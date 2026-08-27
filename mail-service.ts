// ─── Multi-provider real email service ──────────────────────────────────────
// Real temporary email providers:
//   - mail.tm       (REST + JWT, Hydra/JSON-LD)
//   - mail.gw       (same API as mail.tm, different domains)
//   - guerrillamail (session-based, several alias domains)
//
// Every domain offered to users can receive real mail — display-only domains
// (@gmail.com etc.) were removed on purpose.

export type EmailProvider = "mail.tm" | "mail.gw" | "guerrilla";

interface ProviderConfig {
  name: EmailProvider;
  baseUrl: string;
}

const PROVIDERS: Record<"mail.tm" | "mail.gw", ProviderConfig> = {
  "mail.tm": { name: "mail.tm", baseUrl: "https://api.mail.tm" },
  "mail.gw": { name: "mail.gw", baseUrl: "https://api.mail.gw" },
};

const GUERRILLA_BASE = "https://api.guerrillamail.com/ajax.php";

// All GuerrillaMail domains are aliases of the same mail system — mail sent
// to user@<any of these> lands in the same inbox (their API confirms this).
export const GUERRILLA_DOMAINS: string[] = [
  "sharklasers.com",
  "guerrillamail.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "guerrillamail.info",
  "guerrillamailblock.com",
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface MailTmDomain {
  id: string;
  domain: string;
  isActive: boolean;
}

interface MailTmAccount {
  id: string;
  address: string;
}

interface MailTmToken {
  token: string;
  id: string;
}

interface MailTmMessageSummary {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  subject: string;
  intro: string;
  createdAt: string;
  seen: boolean;
}

interface MailTmMessageFull extends MailTmMessageSummary {
  text: string;
  html: string[];
}

interface GuerrillaMessage {
  mail_id: string | number;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_body?: string;
  mail_timestamp?: number;
  mail_date?: string;
  mail_read?: 0 | 1;
  content_type?: string;
  att?: number;
}

export interface RealEmailAccount {
  remoteId: string;
  address: string;
  domain: string;
  password: string;
  token: string;
  provider: EmailProvider;
}

export interface RealMessage {
  remoteId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  bodyPreview: string;
  bodyText: string;
  bodyHtml: string;
  isRead: boolean;
  createdAt: string;
}

export interface DomainInfo {
  domain: string;
  displayOnly: boolean;
  provider: EmailProvider | "display";
  label: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADJECTIVES = [
  "swift", "calm", "bold", "keen", "pure", "cool", "fast", "safe",
  "zen", "nova", "eco", "pro", "neo", "lux", "max", "sol", "arc",
  "vex", "ion", "flux", "ruby", "jade", "sage", "onyx", "rust",
];

const NOUNS = [
  "fox", "owl", "ray", "bay", "oak", "elm", "sky", "sea",
  "sun", "air", "hub", "lab", "box", "den", "hex", "pod",
  "web", "app", "dev", "net", "paw", "fin", "wing", "mist", "dusk",
];

function generateLocalPart(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9999) + 1;
  return `${adj}${noun}${num}`;
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "Tmp";
  for (let i = 0; i < 13; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(t) };
}

// ─── Domain functions ───────────────────────────────────────────────────────

/**
 * Fetch all currently active domains from a JWT-based provider
 */
async function getProviderDomains(provider: "mail.tm" | "mail.gw"): Promise<string[]> {
  const config = PROVIDERS[provider];
  const { signal, done } = withTimeout(8000);
  try {
    const res = await fetch(`${config.baseUrl}/domains`, { signal });
    if (!res.ok) throw new Error(`Failed to fetch ${provider} domains: ${res.status}`);
    const data = await res.json();
    const domains: MailTmDomain[] = data["hydra:member"] || [];
    return domains.filter((d) => d.isActive).map((d) => d.domain);
  } finally {
    done();
  }
}

/**
 * Build the full domain list: live domains from mail.tm + mail.gw and all
 * GuerrillaMail alias domains. Every returned domain can receive real mail.
 */
export async function getAllDomains(): Promise<DomainInfo[]> {
  const [tm, gw] = await Promise.allSettled([
    getProviderDomains("mail.tm"),
    getProviderDomains("mail.gw"),
  ]);

  const seen = new Set<string>();
  const realDomains: DomainInfo[] = [];

  const add = (domain: string, provider: EmailProvider) => {
    const d = domain.toLowerCase();
    if (seen.has(d)) return;
    seen.add(d);
    realDomains.push({ domain: d, displayOnly: false, provider, label: d });
  };

  if (tm.status === "fulfilled") {
    for (const d of tm.value) add(d, "mail.tm");
  } else {
    console.error("[domains] mail.tm fetch failed:", tm.reason);
  }

  if (gw.status === "fulfilled") {
    for (const d of gw.value) add(d, "mail.gw");
  } else {
    console.error("[domains] mail.gw fetch failed:", gw.reason);
  }

  for (const d of GUERRILLA_DOMAINS) add(d, "guerrilla");

  return realDomains;
}

/**
 * Figure out which provider (if any) can create a real account on a domain.
 * Returns null when the domain is not owned by any provider (display-only).
 */
export async function resolveDomainProvider(
  domain: string
): Promise<EmailProvider | null> {
  const d = domain.toLowerCase().trim();

  if (GUERRILLA_DOMAINS.includes(d)) return "guerrilla";

  const [tm, gw] = await Promise.allSettled([
    getProviderDomains("mail.tm"),
    getProviderDomains("mail.gw"),
  ]);

  if (tm.status === "fulfilled" && tm.value.map((x) => x.toLowerCase()).includes(d)) {
    return "mail.tm";
  }
  if (gw.status === "fulfilled" && gw.value.map((x) => x.toLowerCase()).includes(d)) {
    return "mail.gw";
  }
  return null;
}

// ─── GuerrillaMail functions ────────────────────────────────────────────────

async function guerrillaRequest(
  params: Record<string, string>,
  method: "GET" | "POST" = "GET"
): Promise<Record<string, unknown>> {
  const { signal, done } = withTimeout(10000);
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${GUERRILLA_BASE}?${query}`, { method, signal });
    if (!res.ok) throw new Error(`GuerrillaMail error: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    done();
  }
}

/**
 * Attach (or create) a GuerrillaMail inbox for a given user. The inbox is
 * keyed by the local part, so re-calling this with the same user recovers
 * an expired session.
 */
async function guerrillaAttachSession(localPart: string): Promise<string> {
  const data = await guerrillaRequest({
    f: "set_email_user",
    email_user: localPart,
  });

  const sidToken = data.sid_token as string | undefined;
  const authFailed = (data.auth as { success?: boolean } | undefined)?.success === false;

  if (!sidToken || authFailed) {
    throw new Error("GUERRILLA_SESSION_FAILED");
  }
  return sidToken;
}

function mapGuerrillaMessage(m: GuerrillaMessage): RealMessage {
  const fromEmail = m.mail_from || "(desconocido)";
  const createdAtIso =
    m.mail_timestamp && m.mail_timestamp > 0
      ? new Date(m.mail_timestamp * 1000).toISOString()
      : new Date().toISOString();

  if (typeof m.mail_body === "string" && m.mail_body.length > 0) {
    const isHtml =
      m.content_type?.includes("html") ||
      /<\/?[a-z][\s\S]*>/i.test(m.mail_body);
    return {
      remoteId: String(m.mail_id),
      fromName: fromEmail.split("@")[0],
      fromEmail,
      subject: m.mail_subject || "(Sin asunto)",
      bodyPreview: m.mail_excerpt || "",
      bodyText: isHtml ? "" : m.mail_body,
      bodyHtml: isHtml ? m.mail_body : "",
      isRead: m.mail_read === 1,
      createdAt: createdAtIso,
    };
  }

  return {
    remoteId: String(m.mail_id),
    fromName: fromEmail.split("@")[0],
    fromEmail,
    subject: m.mail_subject || "(Sin asunto)",
    bodyPreview: m.mail_excerpt || "",
    bodyText: "",
    bodyHtml: "",
    isRead: m.mail_read === 1,
    createdAt: createdAtIso,
  };
}

// ─── Account functions ──────────────────────────────────────────────────────

/**
 * Create a real email account. If no provider is given, tries mail.tm first,
 * then mail.gw, then guerrilla as fallbacks.
 */
export async function createRealEmailAccount(
  provider?: EmailProvider
): Promise<RealEmailAccount> {
  if (provider) {
    const domain = await getFirstActiveDomain(provider);
    return createRealEmailAccountWithDomain(domain, provider);
  }

  const order: EmailProvider[] = ["mail.tm", "mail.gw", "guerrilla"];
  const errors: string[] = [];
  for (const p of order) {
    try {
      const domain = await getFirstActiveDomain(p);
      return await createRealEmailAccountWithDomain(domain, p);
    } catch (err) {
      errors.push(`${p}: ${err instanceof Error ? err.message : err}`);
    }
  }
  throw new Error(`All providers failed — ${errors.join(" | ")}`);
}

async function getFirstActiveDomain(provider: EmailProvider): Promise<string> {
  if (provider === "guerrilla") return GUERRILLA_DOMAINS[0];
  const domains = await getProviderDomains(provider);
  if (domains.length === 0) throw new Error(`No active domain on ${provider}`);
  return domains[0];
}

/**
 * Create a real email account on a specific provider using a chosen domain.
 * If the domain is no longer active on a JWT provider (422), falls back to
 * that provider's current first active domain.
 */
export async function createRealEmailAccountWithDomain(
  domain: string,
  provider: EmailProvider
): Promise<RealEmailAccount> {
  if (provider === "guerrilla") {
    const localPart = generateLocalPart();
    const sidToken = await guerrillaAttachSession(localPart);
    return {
      remoteId: `gm-${localPart}`,
      address: `${localPart}@${domain}`,
      domain,
      password: "guerrilla",
      token: sidToken,
      provider: "guerrilla",
    };
  }

  const config = PROVIDERS[provider];
  const localPart = generateLocalPart();
  let address = `${localPart}@${domain}`;
  const password = generatePassword();

  const tryCreate = async (addr: string): Promise<Response> => {
    return fetch(`${config.baseUrl}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      body: JSON.stringify({ address: addr, password }),
    });
  };

  let createRes = await tryCreate(address);

  // 422 = address taken OR domain no longer active → retry once
  if (!createRes.ok && createRes.status === 422) {
    // 1) same domain, more random local part
    const altLocal = generateLocalPart() + Math.floor(Math.random() * 99999);
    address = `${altLocal}@${domain}`;
    createRes = await tryCreate(address);

    // 2) still failing → the domain itself is probably inactive; fall back
    //    to the provider's current first active domain
    if (!createRes.ok) {
      const fallbackDomain = await getFirstActiveDomain(provider);
      if (fallbackDomain.toLowerCase() !== domain.toLowerCase()) {
        address = `${generateLocalPart()}@${fallbackDomain}`;
        createRes = await tryCreate(address);
        if (createRes.ok) {
          // keep the actual domain the account was created on
          domain = fallbackDomain;
        }
      }
    }
  }

  if (!createRes.ok) {
    const errBody = await createRes.text();
    throw new Error(`Failed to create account: ${createRes.status} ${errBody}`);
  }

  const account: MailTmAccount = await createRes.json();
  const finalDomain = account.address.split("@")[1] || domain;

  // Brief delay so the account propagates before requesting a token
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const token = await getToken(account.address, password, provider);

  return {
    remoteId: account.id,
    address: account.address,
    domain: finalDomain,
    password,
    token,
    provider,
  };
}

/**
 * Get a JWT token for the given credentials on a JWT provider
 */
async function getToken(
  address: string,
  password: string,
  provider: "mail.tm" | "mail.gw"
): Promise<string> {
  const config = PROVIDERS[provider];
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${config.baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/ld+json" },
      body: JSON.stringify({ address, password }),
    });

    if (res.ok) {
      const data: MailTmToken = await res.json();
      return data.token;
    }

    if (res.status === 401 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      continue;
    }

    const errBody = await res.text();
    throw new Error(`Failed to get token: ${res.status} ${errBody}`);
  }

  throw new Error("Failed to get token after retries");
}

/**
 * Refresh credentials for an existing account on any provider.
 * - JWT providers: re-request the token with address+password.
 * - guerrilla: re-attach the session by local part (sid_tokens expire).
 */
export async function refreshToken(
  address: string,
  password: string,
  provider: EmailProvider
): Promise<string> {
  if (provider === "guerrilla") {
    const localPart = address.split("@")[0];
    return guerrillaAttachSession(localPart);
  }
  return getToken(address, password, provider);
}

// ─── Message functions ──────────────────────────────────────────────────────

/**
 * Fetch the message list for an account on any provider
 */
export async function fetchRemoteMessages(
  token: string,
  provider: EmailProvider
): Promise<RealMessage[]> {
  if (provider === "guerrilla") {
    const data = await guerrillaRequest({
      f: "check_email",
      sid_token: token,
      seq: "0",
    });
    const list = (data.list as GuerrillaMessage[] | undefined) || [];
    return list.map(mapGuerrillaMessage);
  }

  const config = PROVIDERS[provider];
  const { signal, done } = withTimeout(10000);
  try {
    const res = await fetch(`${config.baseUrl}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("TOKEN_EXPIRED");
      throw new Error(`Failed to fetch messages: ${res.status}`);
    }

    const data = await res.json();
    const messages: MailTmMessageSummary[] = data["hydra:member"] || [];

    return messages.map((msg) => ({
      remoteId: msg.id,
      fromName: msg.from.name || msg.from.address.split("@")[0],
      fromEmail: msg.from.address,
      subject: msg.subject || "(Sin asunto)",
      bodyPreview: msg.intro || "",
      bodyText: "",
      bodyHtml: "",
      isRead: msg.seen,
      createdAt: msg.createdAt,
    }));
  } finally {
    done();
  }
}

/**
 * Fetch the full content of a single message, preserving HTML and text
 */
export async function fetchRemoteMessage(
  token: string,
  remoteMessageId: string,
  provider: EmailProvider
): Promise<RealMessage> {
  if (provider === "guerrilla") {
    const data = await guerrillaRequest({
      f: "fetch_email",
      sid_token: token,
      email_id: remoteMessageId,
    });
    return mapGuerrillaMessage(data as GuerrillaMessage);
  }

  const config = PROVIDERS[provider];
  const { signal, done } = withTimeout(10000);
  try {
    const res = await fetch(`${config.baseUrl}/messages/${remoteMessageId}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("TOKEN_EXPIRED");
      throw new Error(`Failed to fetch message: ${res.status}`);
    }

    const msg: MailTmMessageFull = await res.json();

    const bodyHtml = msg.html && msg.html.length > 0 ? msg.html.join("\n") : "";
    const bodyText = msg.text || "";
    const bodyPreview = msg.intro || "";

    return {
      remoteId: msg.id,
      fromName: msg.from.name || msg.from.address.split("@")[0],
      fromEmail: msg.from.address,
      subject: msg.subject || "(Sin asunto)",
      bodyPreview,
      bodyText,
      bodyHtml,
      isRead: msg.seen,
      createdAt: msg.createdAt,
    };
  } finally {
    done();
  }
}

/**
 * Delete an account from its provider (guerrilla sessions just expire)
 */
export async function deleteRemoteAccount(
  token: string,
  provider: EmailProvider
): Promise<void> {
  if (provider === "guerrilla") return; // nothing to delete remotely

  const config = PROVIDERS[provider];
  const res = await fetch(`${config.baseUrl}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;

  const me = await res.json();
  await fetch(`${config.baseUrl}/accounts/${me.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}
