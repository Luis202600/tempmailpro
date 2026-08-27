"use client";

import type { EmailMessage } from "@/store/temp-mail";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface MessageListProps {
  messages: EmailMessage[];
  selectedId: string | null;
  onSelect: (messageId: string) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Ahora";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
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

export function MessageList({
  messages,
  selectedId,
  onSelect,
}: MessageListProps) {
  const [search, setSearch] = useState("");

  const filtered = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.fromName.toLowerCase().includes(search.toLowerCase()) ||
      m.fromEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Bandeja de entrada
          </h2>
          {messages.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {messages.filter((m) => !m.isRead).length} nuevos
            </Badge>
          )}
        </div>
        {messages.length > 0 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar mensajes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            {messages.length === 0 ? (
              <>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Bandeja vacía
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Envía un correo a tu dirección temporal para verlo aquí
                </p>
                <div className="mt-6 space-y-3 w-full max-w-xs">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se encontraron mensajes
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((message) => (
              <button
                key={message.id}
                onClick={() => onSelect(message.id)}
                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                  selectedId === message.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${getAvatarColor(
                      message.fromName
                    )}`}
                  >
                    {getInitials(message.fromName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          !message.isRead
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {message.fromName}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate mt-0.5 ${
                        !message.isRead
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {message.bodyPreview
                        ? message.bodyPreview.slice(0, 80)
                        : message.bodyText
                          ? message.bodyText.slice(0, 80)
                          : ""}
                    </p>
                  </div>
                  {!message.isRead && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
