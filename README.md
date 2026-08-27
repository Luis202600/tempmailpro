# TempMail Pro

**Generador de correo temporal real, gratis y sin registro.** Crea direcciones de correo desechables que reciben emails de verdad en una bandeja de entrada en vivo: activaciones de cuentas, códigos de verificación, enlaces de descarga y más — sin exponer tu correo personal.

🌐 **URL de producción:** _configúrala en `NEXT_PUBLIC_SITE_URL` al desplegar_

---

## ✨ Características

- **Bandeja 100 % real** — las direcciones se crean en proveedores reales (mail.tm, mail.gw y GuerrillaMail) y reciben correo de cualquier servicio: GitHub, Stripe, Amazon, Netflix…
- **Actualización en tiempo real** — la bandeja se consulta cada 3 segundos y los mensajes nuevos aparecen animados, sin recargar.
- **Varios dominios reales** — elige el dominio de tu dirección entre los disponibles o escribe uno concreto.
- **Historial multi-dispositivo** — regístrate gratis y guarda tus direcciones para volver a usarlas cuando quieras (se reactivan con 10 minutos más de vida).
- **Lectura segura** — el HTML de los correos se renderiza en un `iframe` aislado (sandbox), sin scripts ni rastreadores.
- **Copiado en un clic** — la dirección se copia al portapapeles con un botón.
- **Expiración automática** — cada dirección vive 10 minutos renovables; después se limpian los datos remotos.
- **Privacidad primero** — sin rastreadores de terceros, banner de cookies conforme a RGPD y páginas legales incluidas.
- **SEO listo** — metadatos completos, Open Graph, `sitemap.xml`, `robots.txt`, datos estructurados JSON-LD y contenido en español.
- **Monetizable** — integración opcional de Google AdSense con `ads.txt` automático y consentimiento previo.

## 🧰 Tecnología

| Capa | Herramienta |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 + shadcn/ui (New York) + Lucide Icons |
| Base de datos | SQLite con [Prisma ORM](https://www.prisma.io) |
| Estado | Zustand |
| Animaciones | Framer Motion |
| Notificaciones | Sonner |
| Tipografías | Geist Sans / Geist Mono |

## 📋 Requisitos

- Node.js 20+ o [Bun](https://bun.sh) 1.1+
- Conexión a Internet (la app habla con los proveedores de correo desde el servidor)

## 🚀 Puesta en marcha local

```bash
# 1. Instalar dependencias
bun install        # o: npm install

# 2. Crear tu archivo .env (ver .env.example)
cp .env.example .env

# 3. (Opcional) Crear/actualizar el esquema de la base de datos.
#    La app también lo crea automáticamente al arrancar.
bun run db:push    # o: npx prisma db push

# 4. Arrancar en desarrollo
bun run dev        # o: npm run dev
```

Abre <http://localhost:3000> y ya puedes generar tu primer correo temporal.

## 🔐 Variables de entorno

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Cadena de conexión SQLite. En local: `file:../db/custom.db` (ruta relativa a `prisma/`). En Vercel: `file:/tmp/tempmail.db`. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública del sitio **sin barra final** (p. ej. `https://tudominio.com`). La usan el canonical, Open Graph, `sitemap.xml` y `robots.txt`. |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Opcional | ID de editor de AdSense (`ca-pub-…`). Sin este valor no se carga ningún script de anuncios ni se publica `ads.txt`. |

## 🐙 Publicar en GitHub

```bash
# Dentro de la carpeta del proyecto
git init
git add .
git commit -m "TempMail Pro: versión inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/tempmail-pro.git
git push -u origin main
```

> 💡 El `.gitignore` ya excluye `node_modules/`, `.next/`, `.env`, bases de datos y logs. El archivo `.env.example` sí se sube como documentación.

## ▲ Desplegar en Vercel

1. Entra en [vercel.com/new](https://vercel.com/new) e **importa tu repositorio** de GitHub.
2. Vercel detecta Next.js automáticamente. No toques los comandos de build.
3. Añade las **variables de entorno**:

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | `file:/tmp/tempmail.db` |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.vercel.app` (o tu dominio propio) |
   | `NEXT_PUBLIC_ADSENSE_CLIENT` | _solo cuando tengas AdSense aprobado_ |

4. Pulsa **Deploy**. En 1–2 minutos tendrás el sitio en línea.

### ⚠️ Nota importante sobre SQLite en Vercel

Las funciones serverless de Vercel tienen un **sistema de archivos efímero**: la base de datos SQLite vive en `/tmp` y se **reinicia** en cada arranque en frío o redeploy. La app está preparada para esto (`src/lib/db.ts` crea el esquema automáticamente con `CREATE TABLE IF NOT EXISTS` en la primera consulta), así que **todo funciona**, pero los registros de usuario y el historial de direcciones no persisten entre despliegues.

Las funciones principales (generar correo, recibir mensajes, copiar) **no dependen de la base de datos para el usuario final**. Si más adelante quieres persistencia real para cuentas e historial, migra `DATABASE_URL` a un proveedor gestionado (por ejemplo PostgreSQL con Prisma + el adaptador correspondiente) — el resto del código no cambia.

## 💰 Google AdSense

1. Despliega el sitio con un dominio propio y verifica su propiedad en [Google AdSense](https://adsense.google.com).
2. Cuando te aprueben, añade la variable `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX` y redespliega.
3. Automáticamente sucederá:
   - `https://tudominio.com/ads.txt` servirá tu registro de AdSense.
   - El script de AdSense se cargará solo tras el **consentimiento de cookies** del banner RGPD incluido.
   - El espacio publicitario del inicio (`src/components/ads/ad-slot.tsx`) empezará a mostrar anuncios.

## 📁 Estructura del proyecto

```
├── prisma/                  # Esquema de la base de datos (User, TempEmail, Message)
├── public/                  # Logo, favicon y estáticos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # Registro, login, logout y sesión (sin dependencias externas)
│   │   │   └── email/       # Generar, regenerar, dominios, historial y mensajes
│   │   ├── contacto/        # Página de contacto (formulario con asunto)
│   │   ├── privacidad/      # Política de privacidad (RGPD)
│   │   ├── terminos/        # Términos del servicio
│   │   ├── ads.txt/         # ads.txt dinámico (si hay AdSense configurado)
│   │   ├── robots.ts        # robots.txt
│   │   ├── sitemap.ts       # sitemap.xml
│   │   ├── layout.tsx       # Metadatos SEO, fuentes y layout global
│   │   └── page.tsx         # Página principal (landing + bandeja)
│   ├── components/
│   │   ├── ads/             # Espacio publicitario con gating de consentimiento
│   │   ├── consent/         # Banner de cookies RGPD
│   │   ├── legal/           # Componentes de páginas legales y formulario de contacto
│   │   ├── temp-mail/       # Header, landing, panel de correo, bandeja, mensajes…
│   │   └── ui/              # Componentes shadcn/ui
│   ├── lib/
│   │   ├── auth.ts          # Hash scrypt + sesiones HMAC en cookie httpOnly
│   │   ├── db.ts            # Cliente Prisma + arranque automático del esquema
│   │   ├── mail-service.ts  # Integración multi-proveedor (mail.tm, mail.gw, GuerrillaMail)
│   │   └── temp-mail.ts     # Tipos y utilidades
│   ├── store/               # Estado global (Zustand)
│   └── hooks/               # Hooks utilidades
├── .env.example             # Plantilla de variables de entorno
└── package.json
```

## 🧪 Scripts disponibles

| Comando | Acción |
| --- | --- |
| `dev` | Arranca el servidor de desarrollo |
| `build` | Compila la aplicación para producción |
| `start` | Sirve la compilación de producción |
| `lint` | Ejecuta ESLint |
| `db:push` | Sincroniza el esquema de Prisma con la base de datos |
| `db:generate` | Genera el cliente de Prisma |

## 📬 Contacto

- Soporte y consultas generales: **freetoolsstudio@gmail.com**
- Privacidad y aspectos legales: la misma dirección, indicando el tema en el asunto.

---

Hecho con ❤️ por **FreeToolsStudio** — herramientas gratuitas para proteger tu correo.
