"use client";

import { useTempMailStore } from "@/store/temp-mail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  RefreshCw,
  Check,
  Clock,
  Shield,
  Globe,
  CornerDownLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function EmailPanel() {
  const email = useTempMailStore((s) => s.email);
  const setEmail = useTempMailStore((s) => s.setEmail);
  const setIsGenerating = useTempMailStore((s) => s.setIsGenerating);
  const setMessages = useTempMailStore((s) => s.setMessages);
  const setSelectedMessage = useTempMailStore((s) => s.setSelectedMessage);
  const domains = useTempMailStore((s) => s.domains);
  const setDomains = useTempMailStore((s) => s.setDomains);
  const selectedDomain = useTempMailStore((s) => s.selectedDomain);
  const setSelectedDomain = useTempMailStore((s) => s.setSelectedDomain);

  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  // Fetch available domains on mount
  useEffect(() => {
    if (domains.length > 0) return;
    fetch("/api/email/domains")
      .then((res) => res.json())
      .then((data) => {
        if (data.domains && Array.isArray(data.domains)) {
          setDomains(data.domains);
          if (!selectedDomain && data.domains.length > 0) {
            setSelectedDomain(data.domains[0].domain);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch domains:", err));
  }, [domains.length, selectedDomain, setDomains, setSelectedDomain]);

  // Countdown timer
  useEffect(() => {
    if (!email) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(email.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expirado");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [email]);

  const applyNewEmail = useCallback(
    (data: { id: string }) => {
      setEmail(data as never);
      setMessages([]);
      setSelectedMessage(null);
    },
    [setEmail, setMessages, setSelectedMessage]
  );

  const generateWithDomain = useCallback(
    async (domain: string | undefined) => {
      if (isRegenerating) return;
      setIsRegenerating(true);
      setIsGenerating(true);
      try {
        const payload: { oldEmailId?: string; domain?: string } = {};
        if (email) payload.oldEmailId = email.id;
        if (domain) payload.domain = domain;

        const res = await fetch("/api/email/regenerate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          return;
        }
        if (data.id) {
          applyNewEmail(data);
          toast.success(`Dirección generada: ${data.address}`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al generar el correo");
      } finally {
        setIsRegenerating(false);
        setIsGenerating(false);
      }
    },
    [email, isRegenerating, applyNewEmail, setIsGenerating]
  );

  const handleCopy = useCallback(async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email.address);
      setCopied(true);
      toast.success("Dirección copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  }, [email]);

  const handleDomainChange = useCallback(
    (newDomain: string) => {
      setSelectedDomain(newDomain);
      generateWithDomain(newDomain);
    },
    [setSelectedDomain, generateWithDomain]
  );

  const handleCustomDomainSubmit = useCallback(() => {
    const d = customDomain.trim().toLowerCase();
    if (!d) return;
    setCustomDomain("");
    // The backend validates that the domain can receive mail and
    // returns a clear error when it can't.
    generateWithDomain(d);
  }, [customDomain, generateWithDomain]);

  if (!email) return null;

  // Include the current email's domain in the selector if it's not in the list
  const selectorDomains =
    domains.length > 0 && !domains.some((d) => d.domain === email.domain)
      ? [{ domain: email.domain, displayOnly: false, provider: "current", label: email.domain }, ...domains]
      : domains;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0 w-full">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 shrink-0">
            <img
              src="/logo-tempmail.png"
              alt=""
              className="h-6 w-6 object-contain opacity-60"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground shrink-0">
                Tu dirección temporal
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="font-mono">{timeLeft}</span>
              </div>
            </div>
            <p className="text-base sm:text-lg font-semibold font-mono truncate mt-0.5">
              {email.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Domain selector */}
          <Select
            value={
              selectorDomains.some((d) => d.domain === selectedDomain)
                ? (selectedDomain ?? undefined)
                : (email.domain ?? undefined)
            }
            onValueChange={handleDomainChange}
          >
            <SelectTrigger
              className="h-9 w-[160px] gap-1.5 text-xs"
              disabled={isRegenerating}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Dominio" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">
                  Dominios — reciben correos
                </SelectLabel>
                {selectorDomains.map((d) => (
                  <SelectItem key={d.domain} value={d.domain} className="text-xs">
                    @{d.domain}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 h-9"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateWithDomain(selectedDomain ?? undefined)}
            disabled={isRegenerating}
            className="gap-1.5 h-9"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`}
            />
            Regenerar
          </Button>
        </div>
      </div>

      {/* Custom domain input */}
      <div className="mt-3 flex items-center gap-2">
        <Input
          placeholder="Otro dominio de la lista — ej. sharklasers.com"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCustomDomainSubmit();
          }}
          disabled={isRegenerating}
          className="h-8 text-xs flex-1"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCustomDomainSubmit}
          disabled={isRegenerating || !customDomain.trim()}
          className="gap-1.5 h-8 text-xs"
        >
          <CornerDownLeft className="h-3 w-3" />
          Usar
        </Button>
      </div>

      {/* Progress bar for expiry */}
      <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary/60 rounded-full transition-all duration-1000"
          style={{
            width: `${Math.max(
              0,
              ((new Date(email.expiresAt).getTime() - Date.now()) /
                (10 * 60 * 1000)) *
                100
            )}%`,
          }}
        />
      </div>

      {/* Notice banner */}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
        <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span>
          Esta es una dirección de correo real. Envía un email desde cualquier
          servicio y aparecerá aquí en segundos.
        </span>
      </div>
    </Card>
  );
}
