"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CONSENT_KEY = "tm_cookie_consent";

function readConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value: "accepted" | "rejected") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // storage bloqueado — no persistimos la elección
  }
  window.dispatchEvent(new CustomEvent("tm-consent-changed"));
}

/**
 * Banner de consentimiento de cookies (RGPD).
 * - "Rechazar" → solo cookies esenciales (sesión).
 * - "Aceptar" → también cookies publicitarias de terceros (Google AdSense).
 * La elección se guarda en localStorage y se notifica vía evento
 * "tm-consent-changed" para que los espacios de anuncios reaccionen.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!readConsent()) setVisible(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-[60] border-t bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Cookie className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Utilizamos cookies esenciales para mantener tu sesión. Con tu
            consentimiento, también usamos cookies de terceros (Google AdSense)
            para mostrar publicidad personalizada. Puedes{" "}
            <Link
              href="/privacidad"
              className="underline underline-offset-2 hover:text-foreground"
            >
              leer más en nuestra Política de Privacidad
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 sm:flex-none"
            onClick={() => {
              saveConsent("rejected");
              setVisible(false);
            }}
          >
            Rechazar
          </Button>
          <Button
            size="sm"
            className="h-9 flex-1 sm:flex-none"
            onClick={() => {
              saveConsent("accepted");
              setVisible(false);
            }}
          >
            Aceptar todo
          </Button>
        </div>
      </div>
    </div>
  );
}
