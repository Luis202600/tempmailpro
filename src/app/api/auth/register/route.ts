import { db } from "@/lib/db";
import {
  hashPassword,
  isValidEmail,
  setSessionCookie,
} from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const name = body?.name ? String(body.name).trim().slice(0, 60) : null;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Introduce un email válido." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email." },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: { email, passwordHash: hashPassword(password), name },
      select: { id: true, email: true, name: true },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("[register] Error:", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
