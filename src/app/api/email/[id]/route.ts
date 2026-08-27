import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return NextResponse.json({
      id: tempEmail.id,
      address: tempEmail.address,
      domain: tempEmail.domain,
      expiresAt: tempEmail.expiresAt.toISOString(),
      createdAt: tempEmail.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tempEmail = await db.tempEmail.findUnique({ where: { id } });

    if (tempEmail) {
      // Delete remote account from its provider
      try {
        const { deleteRemoteAccount } = await import("@/lib/mail-service");
        const provider = (tempEmail.provider as "mail.tm" | "mail.gw" | "guerrilla") || "mail.tm";
        if (!tempEmail.isDisplayOnly) {
          await deleteRemoteAccount(tempEmail.remoteToken, provider);
        }
      } catch {
        // Ignore remote deletion errors
      }
      await db.tempEmail.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
}
