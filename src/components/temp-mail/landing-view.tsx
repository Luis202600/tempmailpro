"use client";

import { useTempMailStore } from "@/store/temp-mail";
import { Button } from "@/components/ui/button";
import {
  Zap,
  UserX,
  Shield,
  Lock,
  Clock,
  Copy,
  ChevronRight,
  ArrowRight,
  Mail,
  History,
  Globe,
  RefreshCw,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { AdSlot } from "@/components/ads/ad-slot";

const features = [
  {
    icon: Zap,
    title: "Generación instantánea",
    description:
      "Obtén una dirección de correo temporal en menos de un segundo, sin esperas ni formularios.",
  },
  {
    icon: Mail,
    title: "Bandeja 100 % real",
    description:
      "Recibe correos de verdad de Gmail, Outlook o cualquier servicio: llegan a tu bandeja en segundos.",
  },
  {
    icon: Globe,
    title: "Varios dominios reales",
    description:
      "Elige el dominio que prefieras entre los disponibles al crear tu dirección desechable.",
  },
  {
    icon: History,
    title: "Historial con tu cuenta",
    description:
      "Crea una cuenta gratuita y recupera o reactiva cualquier dirección que hayas generado antes.",
  },
  {
    icon: UserX,
    title: "Sin datos personales",
    description:
      "Ni nombre ni teléfono: para usar el correo temporal no necesitamos saber quién eres.",
  },
  {
    icon: Shield,
    title: "Protección anti-spam",
    description:
      "Regístrate donde quieras sin ensuciar tu correo principal: el spam caduca y desaparece solo.",
  },
];

const advanced = [
  {
    icon: RefreshCw,
    title: "Actualización en tiempo real",
    desc: "Tu bandeja se actualiza sola cada pocos segundos y te avisa cuando llega un mensaje nuevo.",
  },
  {
    icon: History,
    title: "Historial multi-dispositivo",
    desc: "Con una cuenta gratuita, tus direcciones te acompañan en el móvil y el ordenador.",
  },
  {
    icon: Globe,
    title: "Selector de dominios",
    desc: "Cambia de dominio al instante para generar una dirección nueva con el que tú elijas.",
  },
  {
    icon: Copy,
    title: "Copiado en un clic",
    desc: "Copia tu dirección al portapapeles al instante, lista para pegar en cualquier registro.",
  },
  {
    icon: Layers,
    title: "Lectura segura",
    desc: "Los correos con formato HTML se renderizan en un entorno aislado (sandbox) para tu seguridad.",
  },
  {
    icon: Clock,
    title: "Expiración automática",
    desc: "Cada dirección vive 10 minutos y se elimina sola; con cuenta, puedes reactivarla cuando quieras.",
  },
];

const faqs = [
  {
    q: "¿Qué es un correo temporal y para qué sirve?",
    a: "Un correo temporal (también llamado email desechable o temp mail) es una dirección válida durante un tiempo limitado. Sirve para registrarte en webs, descargar recursos o probar servicios sin dar tu email real, evitando spam y filtraciones de datos.",
  },
  {
    q: "¿Es gratis usar TempMail Pro?",
    a: "Sí. Generar direcciones temporales, leer los mensajes recibidos y copiar la dirección es completamente gratis. La cuenta con historial también es gratuita y opcional.",
  },
  {
    q: "¿Cuánto dura una dirección temporal?",
    a: "Cada dirección permanece activa 10 minutos, con un contador visible. Si necesitas más tiempo, puedes reactivarla desde el historial cuando tienes una cuenta: obtiene 10 minutos más cada vez.",
  },
  {
    q: "¿Recibe correos de verdad, de Gmail u Outlook?",
    a: "Sí. Los dominios ofrecidos son reales y están conectados a proveedores de correo activos: los mensajes enviados desde Gmail, Outlook o cualquier servicio llegan a tu bandeja en segundos.",
  },
  {
    q: "¿Puedo recuperar una dirección que generé antes?",
    a: "Sí, si has iniciado sesión con tu cuenta. Todas las direcciones que generes quedan en tu historial y puedes volver a usarlas con un clic. Sin cuenta, la dirección desaparece al caducar.",
  },
  {
    q: "¿Puedo recibir archivos adjuntos?",
    a: "Los mensajes se muestran en formato HTML y texto plano. Según el proveedor del dominio, algunos adjuntos podrían no visualizarse; para registros y códigos de verificación funciona perfectamente.",
  },
  {
    q: "¿Es seguro registrarse con un correo temporal?",
    a: "Es ideal para servicios de poca confianza, pruebas o descargas puntuales. No lo uses para cuentas importantes (banca, trabajo, redes principales) porque la dirección caduca y su contenido se elimina.",
  },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "/#website",
        url: "/",
        name: "TempMail Pro",
        description:
          "Generador de correos temporales gratuitos, privados y sin registro.",
        inLanguage: "es",
      },
      {
        "@type": "WebApplication",
        name: "TempMail Pro",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        url: "/",
        description:
          "Genera correos temporales gratis con bandeja en tiempo real. Direcciones desechables reales, sin registro y con historial opcional.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LandingView() {
  const setEmail = useTempMailStore((s) => s.setEmail);
  const isGenerating = useTempMailStore((s) => s.isGenerating);
  const setIsGenerating = useTempMailStore((s) => s.setIsGenerating);
  const setView = useTempMailStore((s) => s.setView);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/email/generate", { method: "POST" });
      const data = await res.json();
      if (data.id) {
        setEmail(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDemo = () => {
    setView("inbox");
  };

  return (
    <div className="flex flex-col">
      <JsonLd />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 text-xs text-muted-foreground mb-8">
              <Lock className="h-3 w-3" />
              Gratis · Sin registro · Bandeja en tiempo real
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Correo temporal{" "}
              <span className="text-muted-foreground">gratis, privado y sin registro</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Genera emails desechables que <strong className="font-medium text-foreground">reciben correos reales</strong> al
              instante. Regístrate donde quieras sin exponer tu dirección
              principal: protege tu bandeja del spam para siempre.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-12 px-8 text-base font-medium gap-2 rounded-lg"
              >
                {isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Generar correo temporal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDemo}
                className="h-12 px-8 text-base font-medium gap-2 rounded-lg"
              >
                Ver demo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Sin registro
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                Instantáneo
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-500" />
                Privado
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Todo lo que necesitas para proteger tu correo
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Un generador de correos temporales pensado para registrar donde
              quieras, recibir códigos de verificación al momento y mantener tu
              identidad a salvo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-xl border bg-card p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/5 transition-colors">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — datos reales del servicio */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "100%", label: "Gratis, siempre" },
              { value: "<1s", label: "En generar tu dirección" },
              { value: "10 min", label: "De vida por dirección" },
              { value: "8+", label: "Dominios reales disponibles" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="avanzadas" className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-primary/5 text-xs font-medium text-primary mb-4">
              INCLUIDO GRATIS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Funciones avanzadas sin pagar nada
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que ofrece TempMail Pro está disponible desde el primer
              clic. Y si creas una cuenta gratuita, además conservas tu
              historial de direcciones.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {advanced.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad slot (solo visible con AdSense configurado y consentimiento dado) */}
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <AdSlot slot="1234567890" className="min-h-[90px]" />
        </div>
      </div>

      {/* FAQ Section */}
      <section id="faq" className="border-t">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Preguntas frecuentes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Resolvemos las dudas más comunes sobre el correo temporal.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group rounded-xl border bg-card px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm sm:text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Empieza ahora, en un clic
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Genera tu correo temporal gratis y recibe tu primer email en
              segundos. Sin compromiso, sin registro y sin límites.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-12 px-8 text-base font-medium gap-2 rounded-lg"
              >
                {isGenerating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    Generar correo temporal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDemo}
                className="h-12 px-8 text-base font-medium gap-2 rounded-lg"
              >
                Ver demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
