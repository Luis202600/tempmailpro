import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitPromise: Promise<void> | undefined
}

/**
 * Resuelve la URL de la base de datos de forma segura para serverless.
 *
 * En Vercel el sistema de archivos es de solo lectura salvo en /tmp, por lo
 * que una ruta relativa (o la ausencia de DATABASE_URL) impide abrir SQLite.
 * En esos casos se usa automáticamente file:/tmp/tempmail.db (efímera):
 * la app funciona y los datos se reinician en cada despliegue/arranque frío.
 */
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim()
  const onVercel = process.env.VERCEL === "1"

  if (!raw) {
    if (onVercel) {
      console.warn(
        "[db] DATABASE_URL no definida; usando file:/tmp/tempmail.db (efímera en Vercel)"
      )
    }
    return "file:/tmp/tempmail.db"
  }

  const isRelative = raw.startsWith("file:") && !raw.startsWith("file:/")
  if (isRelative && onVercel) {
    console.warn(
      "[db] DATABASE_URL relativa no es válida en Vercel (solo lectura); usando file:/tmp/tempmail.db"
    )
    return "file:/tmp/tempmail.db"
  }

  return raw
}

const baseClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === "production" ? [] : ["query"],
  })

/**
 * Arranque automático del esquema (CREATE TABLE IF NOT EXISTS).
 *
 * Permite desplegar en entornos serverless (p. ej. Vercel) donde no se
 * puede ejecutar `prisma db push` en tiempo de ejecución: la primera
 * operación se asegura de que las tablas existan. Es idempotente, por lo
 * que también es seguro en local con una base de datos ya creada.
 *
 * IMPORTANTE: es «perezoso» a propósito. No se ejecuta al importar el
 * módulo (durante `next build` Next evalúa todos los módulos aunque no
 * usen la base de datos), sino en la primera consulta real. Así el build
 * nunca necesita DATABASE_URL ni lanza errores por la conexión.
 */
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE TABLE IF NOT EXISTS "TempEmail" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "address" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "remoteId" TEXT NOT NULL,
  "remoteToken" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'mail.tm',
  "isDisplayOnly" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TempEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TempEmail_address_key" ON "TempEmail"("address")`,
  `CREATE INDEX IF NOT EXISTS "TempEmail_userId_createdAt_idx" ON "TempEmail"("userId", "createdAt")`,
  `CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "emailId" TEXT NOT NULL,
  "remoteId" TEXT NOT NULL,
  "fromName" TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "bodyPreview" TEXT NOT NULL,
  "bodyText" TEXT NOT NULL,
  "bodyHtml" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "TempEmail" ("id") ON DELETE CASCADE ON UPDATE CASCADE
)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Message_emailId_remoteId_key" ON "Message"("emailId", "remoteId")`,
  `CREATE INDEX IF NOT EXISTS "Message_emailId_idx" ON "Message"("emailId")`,
]

async function runSchemaBootstrap(): Promise<void> {
  try {
    // Se ejecuta contra baseClient directamente (sin puerta de espera)
    // para evitar autoesperas.
    for (const statement of SCHEMA_STATEMENTS) {
      await baseClient.$executeRawUnsafe(statement)
    }
  } catch (err) {
    // Permite reintentar en la siguiente consulta si falla
    globalForPrisma.dbInitPromise = undefined
    throw err
  }
}

/**
 * Devuelve (y crea si hace falta) la promesa de arranque del esquema.
 * Se llama desde los delegados envueltos, nunca al importar el módulo.
 */
function ensureSchema(): Promise<void> {
  if (!globalForPrisma.dbInitPromise) {
    globalForPrisma.dbInitPromise = runSchemaBootstrap()
  }
  return globalForPrisma.dbInitPromise
}

/**
 * Envuelve los delegados de modelo para que cualquier operación espere
 * primero a que el esquema esté listo.
 */
function wrapModelDelegate<T extends object>(delegate: T): T {
  return new Proxy(delegate, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target)
      if (typeof value !== "function") return value
      return (...args: unknown[]) => {
        return (async () => {
          await ensureSchema()
          return (value as (...a: unknown[]) => unknown).apply(target, args)
        })()
      }
    },
  })
}

const MODEL_KEYS = ["user", "tempEmail", "message"] as const
const modelCache = new Map<string, unknown>()

export const db = new Proxy(baseClient, {
  get(target, prop, receiver) {
    if (MODEL_KEYS.includes(prop as (typeof MODEL_KEYS)[number])) {
      const key = prop as string
      if (!modelCache.has(key)) {
        modelCache.set(
          key,
          wrapModelDelegate(Reflect.get(target, prop, target))
        )
      }
      return modelCache.get(key)
    }
    return Reflect.get(target, prop, receiver)
  },
}) as PrismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = baseClient
