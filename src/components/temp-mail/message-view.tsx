"use client";

import type { EmailMessage } from "@/store/temp-mail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Clock,
  Trash2,
  ExternalLink,
  Code,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";

interface MessageViewProps {
  message: EmailMessage | null;
  onBack: () => void;
  isMobile: boolean;
  isLoadingContent?: boolean;
  onRetryLoad?: () => void;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-slate-100 text-slate-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Build a sandboxed HTML document that renders the email HTML content.
 * Uses srcdoc on an iframe for full isolation — scripts, styles, and links
 * all work properly without leaking into the parent page.
 */
function buildIframeSrcDoc(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base target="_blank" rel="noopener noreferrer">
<style>
  /* Reset */
  body {
    margin: 0;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1a1a1a;
    background: #ffffff;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  /* Make links visible and clickable */
  a {
    color: #2563eb;
    text-decoration: underline;
  }
  a:hover {
    color: #1d4ed8;
  }
  /* Ensure images are responsive */
  img {
    max-width: 100%;
    height: auto;
  }
  /* Style buttons commonly found in activation emails */
  .btn, .button, [role="button"] {
    display: inline-block;
  }
  /* Table styling for layout emails */
  table {
    max-width: 100%;
  }
  /* Prevent oversized elements */
  * {
    max-width: 100% !important;
    box-sizing: border-box;
  }
  /* Allow explicit widths on container elements */
  table, .wrapper, .container, .email-container, [width] {
    max-width: none !important;
  }
</style>
</head>
<body>${html}</body>
</html>`;
}

export function MessageView({
  message,
  onBack,
  isMobile,
  isLoadingContent = false,
  onRetryLoad,
}: MessageViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"html" | "text">("html");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-detect: if there's HTML use HTML mode, otherwise text
  const hasHtml = useMemo(
    () => !!(message?.bodyHtml && message.bodyHtml.trim().length > 0),
    [message?.bodyHtml]
  );
  const hasText = useMemo(
    () => !!(message?.bodyText && message.bodyText.trim().length > 0),
    [message?.bodyText]
  );
  const hasPreview = useMemo(
    () => !!(message?.bodyPreview && message.bodyPreview.trim().length > 0),
    [message?.bodyPreview]
  );

  const hasContent = hasHtml || hasText;

  // Default to html if available, otherwise text
  useEffect(() => {
    if (hasHtml) {
      setViewMode("html");
    } else if (hasText) {
      setViewMode("text");
    }
  }, [hasHtml, hasText]);

  // Build the iframe srcdoc
  const iframeSrcDoc = useMemo(() => {
    if (!message?.bodyHtml) return "";
    return buildIframeSrcDoc(message.bodyHtml);
  }, [message?.bodyHtml]);

  // Auto-resize iframe to fit content
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body) {
        // Set height to content height
        const height = doc.body.scrollHeight;
        iframe.style.height = `${Math.min(Math.max(height, 100), 2000)}px`;
      }
    } catch {
      // Cross-origin restrictions — ignore
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!message) return;
    setIsDeleting(true);
    try {
      toast.success("Mensaje eliminado");
      onBack();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  }, [message, onBack]);

  if (!message) {
    return (
      <Card className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Selecciona un mensaje
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Haz clic en un correo para ver su contenido
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8 -ml-1 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-sm font-semibold text-foreground truncate">
              {message.subject}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* View mode toggle */}
            {hasHtml && hasText && (
              <div className="flex items-center mr-1 rounded-md border">
                <Button
                  variant={viewMode === "html" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("html")}
                  className="h-7 w-7 rounded-r-none"
                  title="Ver como HTML"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === "text" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("text")}
                  className="h-7 w-7 rounded-l-none"
                  title="Ver como texto"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sender info */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${getAvatarColor(
              message.fromName
            )}`}
          >
            {getInitials(message.fromName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {message.fromName}
              </span>
              <Badge variant="secondary" className="text-[10px] h-4">
                <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
                {message.fromEmail.split("@")[1]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {message.fromEmail}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {formatFullDate(message.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {isLoadingContent && !hasContent ? (
          /* ── Loading: fetching full content from server ── */
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Cargando contenido del mensaje...
              </p>
            </div>
          </div>
        ) : !hasContent && !isLoadingContent ? (
          /* ── No content available (fetch failed or no body) ── */
          <div className="flex items-center justify-center py-16 px-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              {hasPreview ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    No se pudo cargar el contenido completo del mensaje.
                  </p>
                  <div className="mt-2 p-4 bg-muted/50 rounded-lg w-full text-left">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Vista previa:</p>
                    <p className="text-sm text-foreground/90">{message.bodyPreview}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No se pudo cargar el contenido del mensaje.
                </p>
              )}
              {onRetryLoad && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryLoad}
                  className="mt-2 gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        ) : isLoadingContent && hasContent ? (
          /* ── Content available but refreshing (show content with subtle indicator) ── */
          <>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b px-4 py-1.5 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground">Actualizando contenido...</span>
            </div>
            {viewMode === "html" && hasHtml ? (
              <iframe
                ref={iframeRef}
                srcDoc={iframeSrcDoc}
                onLoad={handleIframeLoad}
                sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                className="w-full border-0 min-h-[200px]"
                style={{ height: "500px" }}
                title="Contenido del correo"
              />
            ) : hasText ? (
              <div className="p-4 sm:p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed break-words">
                  {message.bodyText}
                </pre>
              </div>
            ) : null}
          </>
        ) : viewMode === "html" && hasHtml ? (
          /* ── HTML mode: sandboxed iframe ── */
          <iframe
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="w-full border-0 min-h-[200px]"
            style={{ height: "500px" }}
            title="Contenido del correo"
          />
        ) : hasText ? (
          /* ── Text mode: plain text with proper link handling ── */
          <div className="p-4 sm:p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed break-words">
              {message.bodyText}
            </pre>
          </div>
        ) : (
          /* ── Fallback: show preview ── */
          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground">
              {message.bodyPreview || "Contenido no disponible"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
