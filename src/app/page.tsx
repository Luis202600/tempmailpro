"use client";

import { useTempMailStore } from "@/store/temp-mail";
import { LandingView } from "@/components/temp-mail/landing-view";
import { InboxView } from "@/components/temp-mail/inbox-view";

export default function Home() {
  const view = useTempMailStore((s) => s.view);

  return view === "landing" ? <LandingView /> : <InboxView />;
}
