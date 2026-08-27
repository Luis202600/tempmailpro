"use client";

import { useEffect } from "react";
import { useTempMailStore } from "@/store/temp-mail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AtSign,
  History,
  Inbox,
  Loader2,
  Mail,
  Play,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const history = useTempMailStore((s) => s.history);
  const isHistoryLoading = useTempMailStore((s) => s.isHistoryLoading);
  const fetchHistory = useTempMailStore((s) => s.fetchHistory);
  const removeHistoryItem = useTempMailStore((s) => s.removeHistoryItem);
  const setEmail = useTempMailStore((s) => s.setEmail);
  const setMessages = useTempMailStore((s) => s.setMessages);
  const setSelectedMessage = useTempMailStore((s) => s.setSelectedMessage);

  // Refresh the list every time the dialog opens
  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, fetchHistory]);

  const handleUse = async (emailId: string) => {
    try {
      const res = await fetch("/api/email/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use", emailId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo reactivar el correo.");
        return;
      }
      setEmail(data);
      setMessages([]);
      setSelectedMessage(null);
      onOpenChange(false);
      toast.success(`Dirección reactivada: ${data.address}`);
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.");
    }
  };

  const handleDelete = async (emailId: string) => {
    try {
      const res = await fetch("/api/email/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", emailId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo eliminar.");
        return;
      }
      removeHistoryItem(emailId);
      toast.success("Correo eliminado del historial");
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de correos
          </DialogTitle>
          <DialogDescription>
            Todas las direcciones que has generado con tu cuenta. Reactiva
            cualquiera para volver a usarla.
          </DialogDescription>
        </DialogHeader>

        {isHistoryLoading && history.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Aún no hay correos</p>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Genera una dirección temporal y aparecerá aquí automáticamente
              mientras tengas la sesión iniciada.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[380px] pr-3 -mr-3">
            <div className="space-y-1">
              {history.map((item, index) => {
                const expired = isExpired(item.expiresAt);
                return (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-1" />}
                    <div className="flex items-center gap-3 py-2.5 group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <AtSign className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium font-mono truncate">
                          {item.address}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {item.messageCount}{" "}
                            {item.messageCount === 1 ? "mensaje" : "mensajes"}
                          </span>
                          {item.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="h-4 px-1.5 text-[10px] font-semibold"
                            >
                              {item.unreadCount} nuevos
                            </Badge>
                          )}
                          <span
                            className={`text-xs ${expired ? "text-muted-foreground/60" : "text-emerald-600 dark:text-emerald-400"}`}
                          >
                            · {expired ? "Expirada" : "Activa"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleUse(item.id)}
                        >
                          <Play className="h-3 w-3" />
                          Usar
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Eliminar ${item.address} del historial`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border rounded-md px-3 py-2">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span>
            Al reactivar una dirección, expira de nuevo en 10 minutos y puedes
            seguir recibiendo correos con ella.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
