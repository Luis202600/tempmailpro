"use client";

import { useEffect, useSyncExternalStore } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  /** ID del bloque de anuncios definido en tu cuenta de AdSense */
  slot: string;
  className?: string;
  format?: string;
}

const CONSENT_KEY = "tm_cookie_consent";

function subscribe(callback: () => void) {
  window.addEventListener("tm-consent-changed", callback);
  return () => window.removeEventListener("tm-consent-changed", callback);
}

function getConsentSnapshot(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function getServerConsentSnapshot(): string | null {
  return null;
}

/**
 * Espacio publicitario de Google AdSense listo para producción.
 * - No renderiza nada hasta que exista NEXT_PUBLIC_ADSENSE_CLIENT.
 * - Solo muestra anuncios si el usuario aceptó las cookies (banner RGPD).
 * - Reacciona al evento "tm-consent-changed" si el usuario cambia de idea.
 */
export function AdSlot({ slot, className, format = "auto" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const consent = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getServerConsentSnapshot
  );

  const adsEnabled = Boolean(client) && consent === "accepted";

  useEffect(() => {
    if (!adsEnabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle aún no está disponible (script bloqueado)
    }
  }, [adsEnabled, slot]);

  if (!client || !adsEnabled) return null;

  return (
    <div className={className} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
