import { getAllDomains } from "@/lib/mail-service";
import { NextResponse } from "next/server";

export const maxDuration = 15;

export async function GET() {
  try {
    const domains = await getAllDomains();
    return NextResponse.json({ domains });
  } catch (error) {
    console.error("[domains] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
}
