import { db } from "@/lib/db";
import {
  createRealEmailAccount,
  createRealEmailAccountWithDomain,
  deleteRemoteAccount,
  resolveDomainProvider,
} from "@/lib/mail-service";
import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const EMAIL_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { oldEmailId, domain } = body as {
      oldEmailId?: string;
      domain?: string;
    };

    let normalizedDomain: string | undefined;
    if (domain) {
      normalizedDomain = domain
        .trim()
        .toLowerCase()
        .replace(/^@+/, "")
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
      if (!DOMAIN_RE.test(normalizedDomain)) {
        return NextResponse.json(
          { error: "Dominio inválido. Ejemplo: midominio.com" },
          { status: 400 }
        );
      }
    }

    const authUser = await getAuthUser();

    // Only domains owned by a provider can receive real mail
    let account;
    if (normalizedDomain) {
      const provider = await resolveDomainProvider(normalizedDomain);
      if (!provider) {
        return NextResponse.json(
          {
            error: `El dominio @${normalizedDomain} no puede recibir correos aquí. Elige uno de la lista.`,
          },
          { status: 400 }
        );
      }
      account = await createRealEmailAccountWithDomain(normalizedDomain, provider);
      console.log("[regenerate] Real account on", provider, ":", account.address);
    } else {
      account = await createRealEmailAccount();
      console.log("[regenerate] Real account:", account.address);
    }

    // Guests: old email disappears. Logged-in users: keep it in their history.
    if (oldEmailId && !authUser) {
      const oldEmail = await db.tempEmail.findUnique({ where: { id: oldEmailId } });
      if (oldEmail) {
        if (oldEmail.provider !== "display") {
          try {
            const provider =
              (oldEmail.provider as "mail.tm" | "mail.gw" | "guerrilla") || "mail.tm";
            await deleteRemoteAccount(oldEmail.remoteToken, provider);
          } catch {
            // Ignore remote deletion errors
          }
        }
        await db.tempEmail.delete({ where: { id: oldEmailId } }).catch(() => {});
      }
    }

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
    console.error("Error regenerating email:", error);
    return NextResponse.json(
      { error: "No se pudo regenerar el correo. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
