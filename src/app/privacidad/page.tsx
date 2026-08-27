import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de TempMail Pro: qué datos tratamos, cuánto tiempo los conservamos, qué cookies usamos y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      lastUpdated="1 de septiembre de 2025"
      intro="En TempMail Pro tratamos tus datos con el máximo respeto: no pedimos información personal para usar el servicio y solo guardamos lo imprescindible para que tu correo temporal funcione. Esta página explica, de forma clara, qué datos tratamos, por qué y cuáles son tus derechos."
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos es el equipo de TempMail
          Pro (en adelante, «el servicio»), accesible a través del sitio web
          TempMail Pro. Para cualquier cuestión relativa a privacidad puedes
          escribirnos a{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que tratamos">
        <p>Según cómo uses el servicio, tratamos las siguientes categorías de datos:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Direcciones temporales generadas:</strong>{" "}
            la dirección, el dominio, la fecha de creación y de expiración.
          </li>
          <li>
            <strong className="text-foreground">Mensajes recibidos:</strong>{" "}
            remitente, asunto y contenido de los correos que llegan a tu
            dirección temporal. Se almacenan únicamente mientras la dirección
            está activa y se eliminan al caducar o al borrarla.
          </li>
          <li>
            <strong className="text-foreground">Datos de cuenta (opcional):</strong>{" "}
            si creas una cuenta para usar el historial, tratamos tu email y una
            contraseña almacenada como hash criptográfico (nunca en texto
            plano). No solicitamos nombre real, teléfono ni ningún otro dato
            personal.
          </li>
          <li>
            <strong className="text-foreground">Datos técnicos:</strong>{" "}
            registros técnicos necesarios para prestar el servicio y prevenir
            abusos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalidad y base jurídica">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Prestar el servicio de correo temporal</strong>{" "}
            (ejecución de contrato o aplicación de condiciones precontractuales).
          </li>
          <li>
            <strong className="text-foreground">Mantener tu historial de direcciones</strong>{" "}
            si tienes una cuenta (ejecución de contrato).
          </li>
          <li>
            <strong className="text-foreground">Publicidad</strong> mediante cookies de
            terceros, únicamente si otorgas tu consentimiento en el banner de
            cookies (consentimiento, art. 6.1.a RGPD y art. 22 LSSI).
          </li>
          <li>
            <strong className="text-foreground">Seguridad y prevención de abusos</strong>{" "}
            (interés legítimo).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Plazos de conservación">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Las direcciones temporales y sus mensajes se eliminan
            automáticamente al expirar (10 minutos por defecto, ampliables al
            reactivarlas desde el historial) o cuando las borras manualmente.
          </li>
          <li>
            Los datos de cuenta se conservan mientras la cuenta esté activa.
            Puedes solicitar su supresión en cualquier momento.
          </li>
          <li>
            Las cookies persisten según lo indicado en la sección de cookies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Destinatarios y proveedores terceros">
        <p>Para prestar el servicio trabajamos con proveedores que actúan como encargados o como responsables independientes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Proveedores de buzones (mail.tm, mail.gw y GuerrillaMail):</strong>{" "}
            las direcciones temporales se crean en la infraestructura de estos
            servicios, que reciben y almacenan los mensajes hasta su
            recuperación. Te recomendamos consultar sus políticas de privacidad.
          </li>
          <li>
            <strong className="text-foreground">Google AdSense:</strong>{" "}
            si das tu consentimiento, Google y sus partners pueden utilizar
            cookies para mostrar anuncios personalizados basados en tu
            navegación. Puedes gestionar o revocar tu elección desde el banner
            de cookies, deshabilitar la personalización en{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Configuración de anuncios de Google
            </a>{" "}
            o visitar{" "}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              aboutads.info
            </a>
            .
          </li>
        </ul>
        <p>
          No vendemos ni cedemos tus datos personales a terceros con fines
          publicitarios propios.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>Utilizamos las siguientes cookies y almacenamientos locales equivalentes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">tm_session (esencial):</strong>{" "}
            cookie técnica httpOnly que mantiene tu sesión iniciada. Caduca a
            los 30 días. No requiere consentimiento.
          </li>
          <li>
            <strong className="text-foreground">tm_cookie_consent (esencial):</strong>{" "}
            guarda tu elección sobre las cookies publicitarias para no volver a
            mostrarte el banner.
          </li>
          <li>
            <strong className="text-foreground">Cookies publicitarias de terceros:</strong>{" "}
            solo se instalan si pulsas «Aceptar todo» en el banner y permiten a
            Google AdSense mostrar anuncios, medir su rendimiento y
            personalizarlos.
          </li>
        </ul>
        <p>
          Puedes borrar o bloquear las cookies desde la configuración de tu
          navegador en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Conforme al RGPD y a la LOPDGDD, puedes ejercer en cualquier momento
          los siguientes derechos escribiendo a{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>
          :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Acceso a tus datos personales.</li>
          <li>Rectificación de datos inexactos.</li>
          <li>Supresión («derecho al olvido»).</li>
          <li>Oposición al tratamiento.</li>
          <li>Limitación del tratamiento.</li>
          <li>Portabilidad de los datos.</li>
        </ul>
        <p>
          También puedes presentar una reclamación ante la Agencia Española de
          Protección de Datos (www.aepd.es).
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas apropiadas: contraseñas
          almacenadas como hash con sal (scrypt), cookies de sesión httpOnly,
          renderizado de correos en entornos aislados (sandbox) y eliminación
          automática de los mensajes expirados. Ningún sistema es infalible, por
          lo que te recomendamos no enviar datos sensibles (bancarios,
          sanitarios o de identidad) a direcciones temporales.
        </p>
      </LegalSection>

      <LegalSection title="9. Menores de edad">
        <p>
          El servicio no está dirigido a menores de 14 años. No recopilamos
          deliberadamente datos de menores; si crees que un menor ha facilitado
          datos personales, contáctanos para eliminarlos.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios en esta política">
        <p>
          Publicaremos aquí cualquier actualización de esta política,
          indicando la fecha de la última revisión al inicio del documento. El
          uso del servicio después de una modificación implica la aceptación de
          la política actualizada.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Dudas sobre privacidad:{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>
          . Consultas generales en nuestra{" "}
          <a href="/contacto" className="text-foreground underline underline-offset-2">
            página de contacto
          </a>{" "}
          y condiciones de uso en los{" "}
          <a href="/terminos" className="text-foreground underline underline-offset-2">
            Términos del Servicio
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
