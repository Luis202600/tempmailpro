import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Términos del Servicio",
  description:
    "Términos y condiciones de uso de TempMail Pro: descripción del servicio, cuentas de usuario, uso aceptable, limitación de responsabilidad y ley aplicable.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos del Servicio"
      lastUpdated="1 de septiembre de 2025"
      intro="Estas condiciones regulan el uso de TempMail Pro, el generador de correos temporales gratuitos. Al acceder o utilizar el servicio aceptas estos términos; si no estás de acuerdo, por favor no lo utilices."
    >
      <LegalSection title="1. Objeto y aceptación">
        <p>
          TempMail Pro («el servicio») permite generar direcciones de correo
          electrónico temporales y desechables para recibir mensajes sin
          exponer tu bandeja principal. El acceso al sitio y el uso del
          servicio implican la aceptación plena de estos términos y de nuestra{" "}
          <a href="/privacidad" className="text-foreground underline underline-offset-2">
            Política de Privacidad
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Descripción del servicio">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            El servicio es <strong className="text-foreground">gratuito</strong> y genera
            direcciones temporales en dominios de proveedores asociados
            (mail.tm, mail.gw, GuerrillaMail).
          </li>
          <li>
            Por defecto, cada dirección caduca a los <strong className="text-foreground">10 minutos</strong>.
            Los usuarios registrados pueden reactivar direcciones anteriores
            desde su historial.
          </li>
          <li>
            Los mensajes recibidos se muestran en formato HTML y texto y se
            eliminan al expirar la dirección.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cuentas de usuario">
        <p>
          El registro es opcional y únicamente habilita el historial de
          direcciones. Eres responsable de la confidencialidad de tu
          contraseña y de la actividad que ocurra en tu cuenta. Nos reservamos
          el derecho de suspender cuentas que incumplan estos términos.
        </p>
      </LegalSection>

      <LegalSection title="4. Uso aceptable">
        <p>
          Al usar TempMail Pro te comprometes a no emplearlo para:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Actividades ilegales o que infrinjan la ley aplicable.</li>
          <li>Fraude, phishing, suplantación de identidad o engaño.</li>
          <li>
            Crear cuentas en servicios cuya edad mínima o condiciones de uso
            no cumplas.
          </li>
          <li>
            Enviar spam saliente o distribuir malware desde nuestras
            infraestructuras.
          </li>
          <li>
            Intentar sobrecargar, revertir ingeniería o acceder indebidamente
            al servicio o a sus proveedores.
          </li>
        </ul>
        <p>
          El incumplimiento puede suponer la suspensión inmediata del acceso
          sin perjuicio de las acciones legales que correspondan.
        </p>
      </LegalSection>

      <LegalSection title="5. Propiedad intelectual">
        <p>
          La marca, el logotipo, el diseño y el código de TempMail Pro están
          protegidos por la normativa de propiedad intelectual e industrial.
          Los mensajes que recibes pertenecen a sus remitentes; el contenido de
          terceros que se muestra en el servicio lo está a título de mero
          transporte.
        </p>
      </LegalSection>

      <LegalSection title="6. Exoneración de responsabilidad">
        <p>
          El servicio se presta «tal cual» y «según disponibilidad», sin
          garantías de funcionamiento ininterrumpido. No somos responsables
          de:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            La pérdida de mensajes o direcciones al caducar o ser eliminadas
            (incluido el borrado manual desde el historial).
          </li>
          <li>
            El contenido de los correos recibidos o de los sitios enlazados en
            ellos.
          </li>
          <li>
            Daños derivados de un uso inadecuado del servicio contrario a
            estos términos.
          </li>
        </ul>
        <p>
          <strong className="text-foreground">Importante:</strong> las direcciones temporales
          no deben usarse para cuentas cuya pérdida te cause un perjuicio
          (banca, trabajo, redes sociales principales), ya que cualquiera que
          conozca la dirección podría llegar a ver sus mensajes durante su vida
          útil.
        </p>
      </LegalSection>

      <LegalSection title="7. Límites del servicio">
        <p>
          Podemos establecer límites técnicos (número de direcciones, tamaño o
          frecuencia de uso) para garantizar la disponibilidad y prevenir
          abusos. Las funciones pueden cambiar, pausarse o descontinuarse,
          avisando cuando sea razonablemente posible.
        </p>
      </LegalSection>

      <LegalSection title="8. Modificaciones">
        <p>
          Podemos actualizar estos términos; publicaremos la versión vigente en
          esta página con su fecha de revisión. Los cambios sustanciales se
          comunicarán de forma visible en el sitio.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por la legislación española. Para cualquier
          controversia, las partes se someten a los juzgados y tribunales que
          correspondan conforme a la normativa de consumidores y usuarios.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Consultas sobre estos términos:{" "}
          <a
            href="mailto:freetoolsstudio@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            freetoolsstudio@gmail.com
          </a>{" "}
          o desde la{" "}
          <a href="/contacto" className="text-foreground underline underline-offset-2">
            página de contacto
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
