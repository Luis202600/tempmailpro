import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/temp-mail/header";
import { Footer } from "@/components/temp-mail/footer";
import { CookieConsent } from "@/components/consent/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tempmailpro.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TempMail Pro — Correo temporal gratis, privado y sin registro",
    template: "%s | TempMail Pro",
  },
  description:
    "Genera tu correo temporal gratis al instante: direcciones desechables reales que reciben correos de Gmail, Outlook y cualquier servicio. Sin registro, con bandeja en tiempo real y protección anti-spam.",
  keywords: [
    "correo temporal",
    "correo temporal gratis",
    "email desechable",
    "email temporal",
    "correo anónimo",
    "mail temporal",
    "generar correo temporal",
    "cuenta temporal",
    "evitar spam",
    "correo desechable",
    "temp mail",
    "temporary email",
  ],
  authors: [{ name: "TempMail Pro" }],
  creator: "TempMail Pro",
  applicationName: "TempMail Pro",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "TempMail Pro",
    title: "TempMail Pro — Correo temporal gratis, privado y sin registro",
    description:
      "Direcciones de correo temporales 100 % reales que reciben emails al instante. Protege tu bandeja principal del spam sin dar tus datos.",
    images: [
      {
        url: "/logo-tempmail.png",
        width: 512,
        height: 512,
        alt: "TempMail Pro — correo temporal gratis",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "TempMail Pro — Correo temporal gratis, privado y sin registro",
    description:
      "Direcciones de correo temporales 100 % reales que reciben emails al instante. Sin registro, con historial y bandeja en tiempo real.",
    images: ["/logo-tempmail.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo-tempmail.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/logo-tempmail.png",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        <CookieConsent />
        <Toaster position="bottom-right" />

        {/* Google AdSense: solo se carga si se define NEXT_PUBLIC_ADSENSE_CLIENT (p. ej. ca-pub-XXXXXXXX) */}
        {adsenseClient && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
      </body>
    </html>
  );
}

// layout: header/footer compartidos, consentimiento de cookies y AdSense condicional
