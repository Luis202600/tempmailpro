import { db } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    await setSessionCookie(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión. Inténtalo de nuevo." },
      { status: 500 }
    );
  }
}
