import { db } from "@/lib/db";
import { fetchRemoteMessage, refreshToken } from "@/lib/mail-service";
import { NextResponse } from "next/server";

export const maxDuration = 15;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params;
    const localMessage = await db.message.findFirst({
      where: { id: messageId, emailId: id },
    });

    if (!localMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // If we don't have the body yet, fetch it from mail.tm
    const needsFetch =
      (!localMessage.bodyHtml || localMessage.bodyHtml.trim() === "") &&
      (!localMessage.bodyText || localMessage.bodyText.trim() === "");

    if (needsFetch) {
      const tempEmail = await db.tempEmail.findUnique({
        where: { id },
      });

      if (tempEmail) {
        const provider = (tempEmail.provider as "mail.tm" | "mail.gw" | "guerrilla") || "mail.tm";
        let token = tempEmail.remoteToken;

        try {
          const fullMessage = await fetchRemoteMessage(token, localMessage.remoteId, provider);

          await db.message.update({
            where: { id: messageId },
            data: {
              bodyHtml: fullMessage.bodyHtml,
              bodyText: fullMessage.bodyText,
              bodyPreview: fullMessage.bodyPreview,
              isRead: true,
            },
          });

          return NextResponse.json({
            id: localMessage.id,
            remoteId: localMessage.remoteId,
            fromName: localMessage.fromName,
            fromEmail: localMessage.fromEmail,
            subject: localMessage.subject,
            bodyPreview: fullMessage.bodyPreview || localMessage.bodyPreview,
            bodyText: fullMessage.bodyText,
            bodyHtml: fullMessage.bodyHtml,
            isRead: true,
            contentLoaded: true,
            createdAt: localMessage.createdAt.toISOString(),
          });
        } catch (err) {
          console.error("[messageId] Primary fetch failed:", err instanceof Error ? err.message : err);

          if (err instanceof Error && err.message === "TOKEN_EXPIRED") {
            try {
              token = await refreshToken(tempEmail.address, tempEmail.password, provider);
              await db.tempEmail.update({
                where: { id },
                data: { remoteToken: token },
              });
              const fullMessage = await fetchRemoteMessage(token, localMessage.remoteId, provider);

              await db.message.update({
                where: { id: messageId },
                data: {
                  bodyHtml: fullMessage.bodyHtml,
                  bodyText: fullMessage.bodyText,
                  bodyPreview: fullMessage.bodyPreview,
                  isRead: true,
                },
              });

              return NextResponse.json({
                id: localMessage.id,
                remoteId: localMessage.remoteId,
                fromName: localMessage.fromName,
                fromEmail: localMessage.fromEmail,
                subject: localMessage.subject,
                bodyPreview: fullMessage.bodyPreview || localMessage.bodyPreview,
                bodyText: fullMessage.bodyText,
                bodyHtml: fullMessage.bodyHtml,
                isRead: true,
                contentLoaded: true,
                createdAt: localMessage.createdAt.toISOString(),
              });
            } catch (refreshErr) {
              console.error("[messageId] Refresh + fetch failed:", refreshErr instanceof Error ? refreshErr.message : refreshErr);
              // Fall through to return local data with partial flag
            }
          }
          // Fall through to return local data with partial flag
        }
      }
    }

    // Mark as read
    await db.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    const hasContent =
      (localMessage.bodyHtml && localMessage.bodyHtml.trim() !== "") ||
      (localMessage.bodyText && localMessage.bodyText.trim() !== "");

    return NextResponse.json({
      id: localMessage.id,
      remoteId: localMessage.remoteId,
      fromName: localMessage.fromName,
      fromEmail: localMessage.fromEmail,
      subject: localMessage.subject,
      bodyPreview: localMessage.bodyPreview,
      bodyText: localMessage.bodyText,
      bodyHtml: localMessage.bodyHtml,
      isRead: true,
      contentLoaded: hasContent,
      createdAt: localMessage.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[messageId] Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { id, messageId } = await params;
    await db.message.delete({
      where: { id: messageId, emailId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
