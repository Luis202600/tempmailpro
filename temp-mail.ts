import { create } from "zustand";

export interface TempEmail {
  id: string;
  address: string;
  domain: string;
  provider?: string;
  isDisplayOnly: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface EmailDomain {
  domain: string;
  displayOnly: boolean;
  label: string;
}

export interface EmailMessage {
  id: string;
  remoteId?: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  bodyPreview: string;
  bodyText: string;
  bodyHtml: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface HistoryEmail {
  id: string;
  address: string;
  domain: string;
  provider: string;
  messageCount: number;
  unreadCount: number;
  expiresAt: string;
  createdAt: string;
}

interface TempMailState {
  email: TempEmail | null;
  messages: EmailMessage[];
  selectedMessage: EmailMessage | null;
  domains: EmailDomain[];
  selectedDomain: string | null;
  isLoading: boolean;
  isGenerating: boolean;
  isLoadingMessage: boolean;
  isInbox: boolean;
  view: "landing" | "inbox";

  // Auth
  user: AuthUser | null;
  isAuthLoading: boolean;
  history: HistoryEmail[];
  isHistoryLoading: boolean;

  setEmail: (email: TempEmail) => void;
  setMessages: (messages: EmailMessage[]) => void;
  addMessage: (message: EmailMessage) => void;
  setSelectedMessage: (message: EmailMessage | null) => void;
  updateSelectedMessage: (message: EmailMessage) => void;
  markMessageAsRead: (messageId: string) => void;
  setDomains: (domains: EmailDomain[]) => void;
  setSelectedDomain: (domain: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsLoadingMessage: (loading: boolean) => void;
  setView: (view: "landing" | "inbox") => void;
  reset: () => void;

  // Auth actions
  fetchUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

export const useTempMailStore = create<TempMailState>((set, get) => ({
  email: null,
  messages: [],
  selectedMessage: null,
  domains: [],
  selectedDomain: null,
  isLoading: false,
  isGenerating: false,
  isLoadingMessage: false,
  isInbox: false,
  view: "landing",

  user: null,
  isAuthLoading: true,
  history: [],
  isHistoryLoading: false,

  setEmail: (email) => set({ email, isInbox: true, view: "inbox" }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [message, ...state.messages] })),
  setSelectedMessage: (message) => set({ selectedMessage: message }),
  updateSelectedMessage: (message) =>
    set((state) => ({
      selectedMessage: message,
      messages: state.messages.map((m) =>
        m.id === message.id ? message : m
      ),
    })),
  markMessageAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isRead: true } : m
      ),
      selectedMessage:
        state.selectedMessage?.id === messageId
          ? { ...state.selectedMessage, isRead: true }
          : state.selectedMessage,
    })),
  setDomains: (domains) => set({ domains }),
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setIsLoadingMessage: (loading) => set({ isLoadingMessage: loading }),
  setView: (view) => set({ view }),
  reset: () =>
    set({
      email: null,
      messages: [],
      selectedMessage: null,
      isLoading: false,
      isGenerating: false,
      isLoadingMessage: false,
      isInbox: false,
      view: "landing",
    }),

  fetchUser: async () => {
    set({ isAuthLoading: true });
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const user = data.user ?? null;
      set({ user, isAuthLoading: false });
      if (user) {
        get().fetchHistory();
      } else {
        set({ history: [] });
      }
    } catch {
      set({ user: null, isAuthLoading: false });
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      get().fetchHistory();
    } else {
      set({ history: [] });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, history: [] });
    }
  },

  fetchHistory: async () => {
    set({ isHistoryLoading: true });
    try {
      const res = await fetch("/api/email/history");
      if (!res.ok) {
        if (res.status === 401) set({ history: [], user: null });
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.emails)) {
        set({ history: data.emails });
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      set({ isHistoryLoading: false });
    }
  },

  clearHistory: () => set({ history: [] }),
  removeHistoryItem: (id) =>
    set((state) => ({ history: state.history.filter((h) => h.id !== id) })),
}));
