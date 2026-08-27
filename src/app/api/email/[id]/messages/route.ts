import { db } from "@/lib/db";
import {
  fetchRemoteMessages,
  refreshToken,
} from "@/lib/mail-service";
import { NextResponse } from "next/server";

export const maxDuration = 15;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[messages] Fetching for email:", id);

    const tempEmail = await db.tempEmail.findUnique({
      where: { id },
    });

    if (!tempEmail) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    if (new Date() > tempEmail.expiresAt) {
      return NextResponse.json(
        { error: "Email has expired" },
        { status: 410 }
      );
    }

    // Display-only emails (gmail.com / hotmail.com) have no real inbox —
    // return an empty list immediately without contacting the provider.
    if (tempEmail.isDisplayOnly) {
      return NextResponse.json([]);
    }

    const provider = (tempEmail.provider as "mail.tm" | "mail.gw" | "guerrilla") || "mail.tm";

    // Fetch real messages — wrap in try/catch with timeout
    let remoteMessages: Awaited<ReturnType<typeof fetchRemoteMessages>> = [];
    try {
      const fetchPromise = fetchRemoteMessages(tempEmail.remoteToken, provider);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("FETCH_TIMEOUT")), 8000)
      );
      remoteMessages = await Promise.race([fetchPromise, timeoutPromise]);
      console.log("[messages] Fetched", remoteMessages.length, "remote messages");
    } catch (err) {
      if (err instanceof Error && err.message === "TOKEN_EXPIRED") {
        try {
          const newToken = await refreshToken(tempEmail.address, tempEmail.password, provider);
          await db.tempEmail.update({
            where: { id },
            data: { remoteToken: newToken },
          });
          remoteMessages = await fetchRemoteMessages(newToken, provider);
          console.log("[messages] Refreshed token, fetched", remoteMessages.length, "messages");
        } catch (refreshErr) {
          console.error("[messages] Token refresh failed:", refreshErr);
          remoteMessages = [];
        }
      } else {
        console.error("[messages] Fetch failed:", err instanceof Error ? err.message : err);
        remoteMessages = [];
      }
    }

    // Sync remote messages to local DB
    if (remoteMessages && remoteMessages.length > 0) {
      for (const rm of remoteMessages) {
        try {
          await db.message.upsert({
            where: {
              emailId_remoteId: { emailId: id, remoteId: rm.remoteId },
            },
            create: {
              emailId: id,
              remoteId: rm.remoteId,
              fromName: rm.fromName,
              fromEmail: rm.fromEmail,
              subject: rm.subject,
              bodyPreview: rm.bodyPreview,
              bodyText: rm.bodyText,
              bodyHtml: rm.bodyHtml,
              isRead: rm.isRead,
              createdAt: new Date(rm.createdAt),
            },
            update: {
              isRead: rm.isRead,
              bodyPreview: rm.bodyPreview,
            },
          });
        } catch {
          // Ignore upsert errors
        }
      }
    }

    // Return local messages
    const messages = await db.message.findMany({
      where: { emailId: id },
      orderBy: { createdAt: "desc" },
    });

    console.log("[messages] Returning", messages.length, "local messages");
    return NextResponse.json(
      messages.map((m) => ({
        id: m.id,
        remoteId: m.remoteId,
        fromName: m.fromName,
        fromEmail: m.fromEmail,
        subject: m.subject,
        bodyPreview: m.bodyPreview,
        bodyText: m.bodyText,
        bodyHtml: m.bodyHtml,
        isRead: m.isRead,
        createdAt: m.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[messages] Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
