import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { ContactForm } from "@/components/legal/contact-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta con el equipo de TempMail Pro: soporte, sugerencias, incidencias con tu correo temporal o preguntas sobre privacidad.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <LegalPage
      title="Contacto"
      lastUpdated="1 de septiembre de 2025"
      intro="¿Tienes una duda, una sugerencia o has encontrado un problema con tu correo temporal? Escríbenos y te responderemos lo antes posible."
    >
      <LegalSection title="Cómo contactarnos">
        <p>
          La vía más rápida es el formulario de abajo o escribirnos
          directamente a{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>
          . Solemos responder en un plazo de 24–48 horas laborables.
        </p>
        <p>
          Para agilizar la respuesta, escribe un asunto claro e indícanos: qué
          dirección temporal usabas, a qué hora ocurrió el problema y, si
          aplica, el remitente del correo que esperabas.
        </p>
      </LegalSection>

      <LegalSection title="Formulario de contacto">
        <ContactForm />
      </LegalSection>

      <LegalSection title="Preguntas frecuentes">
        <p>
          Antes de escribirnos, quizá encuentres la respuesta en nuestras
          preguntas frecuentes: ¿cómo generar un correo temporal?, ¿cuánto
          dura una dirección? o ¿cómo recuperar una dirección anterior? Todo
          está explicado en la{" "}
          <Link href="/#faq" className="text-foreground underline underline-offset-2">
            sección de preguntas frecuentes de la página principal
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Otros canales">
        <p>
          Para cuestiones de privacidad, protección de datos o aspectos
          legales, utiliza la misma dirección de correo e indica el tema en el
          asunto:{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>
        </p>
        <p>
          Consulta también nuestra{" "}
          <Link href="/privacidad" className="text-foreground underline underline-offset-2">
            Política de Privacidad
          </Link>{" "}
          y los{" "}
          <Link href="/terminos" className="text-foreground underline underline-offset-2">
            Términos del Servicio
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
