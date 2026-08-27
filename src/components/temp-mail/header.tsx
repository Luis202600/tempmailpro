"use client";

import { useEffect, useState } from "react";
import { useTempMailStore } from "@/store/temp-mail";
import { Shield, History, LogIn, LogOut, ChevronDown, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog } from "./auth-dialog";
import { HistoryDialog } from "./history-dialog";
import { toast } from "sonner";

export function Header() {
  const view = useTempMailStore((s) => s.view);
  const setView = useTempMailStore((s) => s.setView);
  const reset = useTempMailStore((s) => s.reset);
  const user = useTempMailStore((s) => s.user);
  const isAuthLoading = useTempMailStore((s) => s.isAuthLoading);
  const logout = useTempMailStore((s) => s.logout);
  const history = useTempMailStore((s) => s.history);

  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Restore the session on every page (header is rendered site-wide)
  const fetchUser = useTempMailStore((s) => s.fetchUser);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const totalUnread = history.reduce((acc, h) => acc + h.unreadCount, 0);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => {
            if (view === "inbox") {
              reset();
            }
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img
              src="/logo-tempmail.png"
              alt="TempMail Pro"
              className="h-8 w-8 object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            TempMail <span className="text-muted-foreground font-normal">Pro</span>
          </span>
        </button>

        <nav className="flex items-center gap-2">
          {view === "inbox" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reset()}
              className="text-muted-foreground hover:text-foreground"
            >
              Inicio
            </Button>
          ) : (
            <>
              <a
                href="/#features"
                className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Funciones
              </a>
              <a
                href="/#faq"
                className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                Preguntas
              </a>
            </>
          )}

          {/* History — only for logged-in users */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              className="gap-1.5 text-muted-foreground hover:text-foreground relative"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
              {totalUnread > 0 && (
                <Badge
                  variant="default"
                  className="h-4 min-w-4 px-1 text-[10px] font-semibold rounded-full"
                >
                  {totalUnread}
                </Badge>
              )}
            </Button>
          )}

          {/* Auth area */}
          {isAuthLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <UserRound className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  {user.name && (
                    <p className="text-xs text-muted-foreground">{user.name}</p>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                  <History className="h-4 w-4" />
                  Mi historial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => setAuthOpen(true)}
              className="gap-1.5 h-8"
            >
              <LogIn className="h-3.5 w-3.5" />
              Iniciar sesión
            </Button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Conexión segura</span>
          </div>
        </nav>
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
    </header>
  );
}
