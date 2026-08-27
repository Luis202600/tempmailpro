import Link from "next/link";

interface LegalPageProps {
  /** Fecha de última actualización, formato "12 de enero de 2025" */
  lastUpdated: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/**
 * Contenedor tipográfico compartido por las páginas legales
 * (Privacidad, Términos, Contacto). Server component.
 */
export function LegalPage({ lastUpdated, title, intro, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <nav aria-label="Migas de pan" className="mb-6 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Inicio
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Última actualización: {lastUpdated}
      </p>
      <p className="mt-6 text-base text-foreground/90 leading-relaxed border-l-2 border-primary/30 pl-4">
        {intro}
      </p>

      <div className="mt-10 space-y-8">{children}</div>
    </div>
  );
}

export { Section as LegalSection };
