import { db } from "@/lib/db";
import {
  deleteRemoteAccount,
  refreshToken,
  type EmailProvider,
} from "@/lib/mail-service";
import { getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const EMAIL_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/** GET /api/email/history — list the logged-in user's generated emails */
export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const emails = await db.tempEmail.findMany({
    where: { userId: user.id, isDisplayOnly: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { messages: true } } },
  });

  // Unread counts per email (one grouped query)
  const unreadRows = await db.message.groupBy({
    by: ["emailId"],
    where: {
      isRead: false,
      tempEmail: { userId: user.id },
    },
    _count: { _all: true },
  });
  const unreadMap = new Map(unreadRows.map((r) => [r.emailId, r._count._all]));

  return NextResponse.json({
    emails: emails.map((e) => ({
      id: e.id,
      address: e.address,
      domain: e.domain,
      provider: e.provider,
      messageCount: e._count.messages,
      unreadCount: unreadMap.get(e.id) ?? 0,
      expiresAt: e.expiresAt.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/email/history
 * Body: { action: "use" | "delete", emailId }
 *  - "use":    re-activate a historical email (extends expiry, refreshes token)
 *  - "delete": remove it from history (and from the provider when possible)
 */
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  const emailId = body?.emailId as string | undefined;

  if (!action || !emailId) {
    return NextResponse.json(
      { error: "Faltan parámetros (action, emailId)." },
      { status: 400 }
    );
  }

  const tempEmail = await db.tempEmail.findUnique({
    where: { id: emailId },
  });

  if (!tempEmail || tempEmail.userId !== user.id) {
    return NextResponse.json({ error: "Correo no encontrado." }, { status: 404 });
  }

  if (action === "use") {
    // Try to refresh the remote credentials so the inbox keeps working.
    let token = tempEmail.remoteToken;
    try {
      const provider = (tempEmail.provider as EmailProvider) || "mail.tm";
      token = await refreshToken(tempEmail.address, tempEmail.password, provider);
      await db.tempEmail.update({
        where: { id: tempEmail.id },
        data: { remoteToken: token },
      });
    } catch (err) {
      console.warn("[history/use] token refresh failed:", err);
      // Continue anyway — the messages route also refreshes on demand.
    }

    const expiresAt = new Date(Date.now() + EMAIL_DURATION_MS);
    const updated = await db.tempEmail.update({
      where: { id: tempEmail.id },
      data: { expiresAt },
    });

    return NextResponse.json({
      id: updated.id,
      address: updated.address,
      domain: updated.domain,
      provider: updated.provider,
      isDisplayOnly: updated.isDisplayOnly,
      expiresAt: updated.expiresAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    });
  }

  if (action === "delete") {
    if (tempEmail.provider !== "display") {
      try {
        const provider = (tempEmail.provider as EmailProvider) || "mail.tm";
        await deleteRemoteAccount(tempEmail.remoteToken, provider);
      } catch {
        // Ignore remote deletion errors
      }
    }
    await db.tempEmail.delete({ where: { id: tempEmail.id } }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción desconocida." }, { status: 400 });
}
