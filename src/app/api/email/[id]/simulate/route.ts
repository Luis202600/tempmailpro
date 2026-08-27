import { db } from "@/lib/db";
import { getRandomMessage } from "@/lib/temp-mail";
import { NextResponse } from "next/server";

export async function POST(
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

    const simulated = getRandomMessage();

    const message = await db.message.create({
      data: {
        emailId: id,
        fromName: simulated.fromName,
        fromEmail: simulated.fromEmail,
        subject: simulated.subject,
        body: simulated.body,
      },
    });

    return NextResponse.json({
      id: message.id,
      fromName: message.fromName,
      fromEmail: message.fromEmail,
      subject: message.subject,
      body: message.body,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error simulating message:", error);
    return NextResponse.json(
      { error: "Failed to simulate message" },
      { status: 500 }
    );
  }
}
