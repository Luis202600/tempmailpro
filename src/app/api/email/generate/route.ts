import { db } from "@/lib/db";
import {
  createRealEmailAccount,
  createRealEmailAccountWithDomain,
  resolveDomainProvider,
} from "@/lib/mail-service";
import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const maxDuration = 30;

const EMAIL_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    let domain: string | undefined;
    try {
      const body = await request.json();
      domain = body?.domain;
    } catch {
      // No body — use a random real domain
    }

    // Normalize custom domain input
    if (domain) {
      domain = domain
        .trim()
        .toLowerCase()
        .replace(/^@+/, "") // strip leading @
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
      if (!DOMAIN_RE.test(domain)) {
        return NextResponse.json(
          { error: "Dominio inválido. Ejemplo: midominio.com" },
          { status: 400 }
        );
      }
    }

    console.log("[generate] Starting email generation, domain:", domain ?? "(random)");

    // Only domains owned by a provider can receive real mail
    let account;
    if (domain) {
      const provider = await resolveDomainProvider(domain);
      if (!provider) {
        return NextResponse.json(
          {
            error: `El dominio @${domain} no puede recibir correos aquí. Elige uno de la lista.`,
          },
          { status: 400 }
        );
      }
      account = await createRealEmailAccountWithDomain(domain, provider);
      console.log("[generate] Real account on", provider, ":", account.address);
    } else {
      account = await createRealEmailAccount();
      console.log("[generate] Real account created:", account.address);
    }

    // Associate with the logged-in user (if any) so it appears in their history
    const authUser = await getAuthUser();

    const expiresAt = new Date(Date.now() + EMAIL_DURATION_MS);

    const tempEmail = await db.tempEmail.create({
      data: {
        address: account.address,
        domain: account.domain,
        remoteId: account.remoteId,
        remoteToken: account.token,
        password: account.password,
        provider: account.provider,
        isDisplayOnly: false,
        userId: authUser?.id ?? null,
        expiresAt,
      },
    });
    console.log("[generate] Saved to DB:", tempEmail.id, "user:", authUser?.id ?? "guest");

    return NextResponse.json({
      id: tempEmail.id,
      address: tempEmail.address,
      domain: tempEmail.domain,
      provider: tempEmail.provider,
      isDisplayOnly: false,
      expiresAt: tempEmail.expiresAt.toISOString(),
      createdAt: tempEmail.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[generate] Error:", error);
    return NextResponse.json(
      { error: "No se pudo generar el correo. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
