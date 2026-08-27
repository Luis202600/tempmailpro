"use client";

import { useTempMailStore } from "@/store/temp-mail";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmailPanel } from "./email-panel";
import { MessageList } from "./message-list";
import { MessageView } from "./message-view";
import { motion } from "framer-motion";

export function InboxView() {
  const email = useTempMailStore((s) => s.email);
  const messages = useTempMailStore((s) => s.messages);
  const selectedMessage = useTempMailStore((s) => s.selectedMessage);
  const setMessages = useTempMailStore((s) => s.setMessages);
  const addMessage = useTempMailStore((s) => s.addMessage);
  const setSelectedMessage = useTempMailStore((s) => s.setSelectedMessage);
  const updateSelectedMessage = useTempMailStore((s) => s.updateSelectedMessage);
  const setEmail = useTempMailStore((s) => s.setEmail);
  const setIsLoading = useTempMailStore((s) => s.setIsLoading);
  const setIsLoadingMessage = useTempMailStore((s) => s.setIsLoadingMessage);
  const setView = useTempMailStore((s) => s.setView);
  const selectedDomain = useTempMailStore((s) => s.selectedDomain);

  const [isMobileMessageOpen, setIsMobileMessageOpen] = useState(false);
  const isLoadingMessage = useTempMailStore((s) => s.isLoadingMessage);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previousMessageIdsRef = useRef<Set<string>>(new Set());

  const isDisplayOnly = email?.isDisplayOnly ?? false;

  // Generate email if none exists (uses selected domain if available)
  useEffect(() => {
    if (!email) {
      const generateDemo = async () => {
        setIsLoading(true);
        try {
          const payload: { domain?: string } = {};
          if (selectedDomain) payload.domain = selectedDomain;
          const res = await fetch("/api/email/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.id) {
            setEmail(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      generateDemo();
    }
  }, [email, setEmail, setIsLoading, selectedDomain]);

  // Poll for real messages from mail.tm (only for real emails)
  const fetchMessages = useCallback(async () => {
    if (!email) return;
    if (isDisplayOnly) return; // No inbox for display-only
    try {
      const res = await fetch(`/api/email/${email.id}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        // Detect new messages
        const newIds = data
          .filter((m: { id: string }) => !previousMessageIdsRef.current.has(m.id))
          .map((m: { id: string }) => m.id);

        if (previousMessageIdsRef.current.size > 0 && newIds.length > 0) {
          // Add new messages one by one for animation
          for (const msg of data) {
            if (newIds.includes(msg.id)) {
              addMessage(msg);
            }
          }
        } else {
          setMessages(data);
        }

        // Update tracking
        previousMessageIdsRef.current = new Set(data.map((m: { id: string }) => m.id));
      }
    } catch (err) {
      console.error(err);
    }
  }, [email, isDisplayOnly, setMessages, addMessage]);

  useEffect(() => {
    if (!email) return;
    if (isDisplayOnly) return; // No polling for display-only

    // Initial fetch
    fetchMessages();

    // Poll every 3 seconds for real messages
    pollIntervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [email, isDisplayOnly, fetchMessages]);

  // Check expiry
  useEffect(() => {
    if (!email) return;
    const checkExpiry = () => {
      if (new Date() > new Date(email.expiresAt)) {
        setView("landing");
      }
    };
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [email, setView]);

  const handleMessageSelect = useCallback(
    async (messageId: string) => {
      if (!email) return;

      // Immediately show the message with list data (has bodyPreview)
      const listMessage = messages.find((m) => m.id === messageId);
      if (listMessage) {
        setSelectedMessage(listMessage);
        setIsMobileMessageOpen(true);
      }

      // If we already have the full content, no need to fetch again
      const hasFullContent = listMessage?.bodyHtml || listMessage?.bodyText;
      if (hasFullContent) return;

      // Fetch full content in the background
      setIsLoadingMessage(true);
      try {
        const res = await fetch(
          `/api/email/${email.id}/messages/${messageId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.id) {
          updateSelectedMessage(data);
        }
      } catch (err) {
        console.error("Failed to load message content:", err);
      } finally {
        setIsLoadingMessage(false);
      }
    },
    [email, messages, setSelectedMessage, updateSelectedMessage, setIsLoadingMessage]
  );

  const handleBack = useCallback(() => {
    setIsMobileMessageOpen(false);
    setSelectedMessage(null);
  }, [setSelectedMessage]);

  if (!email) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Creando correo real...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10"
    >
      <EmailPanel />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px]">
        {/* Message List */}
        <div
          className={`lg:col-span-2 ${
            isMobileMessageOpen ? "hidden lg:block" : ""
          }`}
        >
          <MessageList
            messages={messages}
            selectedId={selectedMessage?.id ?? null}
            onSelect={handleMessageSelect}
          />
        </div>

        {/* Message View */}
        <div
          className={`lg:col-span-3 ${
            !isMobileMessageOpen && selectedMessage
              ? "hidden lg:block"
              : ""
          }`}
        >
          <MessageView
            message={selectedMessage}
            onBack={handleBack}
            isMobile={isMobileMessageOpen}
            isLoadingContent={isLoadingMessage}
            onRetryLoad={() => {
              if (selectedMessage && email) {
                setIsLoadingMessage(true);
                fetch(`/api/email/${email.id}/messages/${selectedMessage.id}`)
                  .then((res) => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                  })
                  .then((data) => {
                    if (data.id) updateSelectedMessage(data);
                  })
                  .catch((err) => console.error("Retry failed:", err))
                  .finally(() => setIsLoadingMessage(false));
              }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
