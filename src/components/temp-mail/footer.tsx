"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md overflow-hidden">
              <img
                src="/logo-tempmail.png"
                alt="TempMail Pro — correo temporal gratis"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              TempMail <span className="text-muted-foreground font-normal">Pro</span>
            </span>
          </div>

          <nav
            aria-label="Enlaces legales"
            className="flex items-center gap-6 text-sm text-muted-foreground"
          >
            <Link href="/privacidad" className="hover:text-foreground transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-foreground transition-colors">
              Términos
            </Link>
            <Link href="/contacto" className="hover:text-foreground transition-colors">
              Contacto
            </Link>
            <Link href="/#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            Conexión segura
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground space-y-1">
          <p>
            © {new Date().getFullYear()} TempMail Pro — Generador de correos
            temporales gratuitos. Todos los derechos reservados.
          </p>
          <p>
            Las direcciones temporales y sus mensajes se eliminan
            automáticamente al caducar. Consulta nuestra{" "}
            <Link href="/privacidad" className="underline underline-offset-2 hover:text-foreground">
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
