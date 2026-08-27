import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitPromise: Promise<void> | undefined
}

const baseClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

/**
 * Arranque automático del esquema (CREATE TABLE IF NOT EXISTS).
 *
 * Permite desplegar en entornos serverless (p. ej. Vercel) donde no se
 * puede ejecutar `prisma db push` en tiempo de ejecución: la primera
 * operación se asegura de que las tablas existan. Es idempotente, por lo
 * que también es seguro en local con una base de datos ya creada.
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

// Se ejecuta contra baseClient directamente (sin puerta de espera) para
// evitar autoesperas. Si falla, se resetea para reintentarlo después.
if (!globalForPrisma.dbInitPromise) {
  globalForPrisma.dbInitPromise = (async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await baseClient.$executeRawUnsafe(statement)
    }
  })().catch((err) => {
    globalForPrisma.dbInitPromise = undefined
    throw err
  })
}

function ensureSchema(): Promise<void> {
  return globalForPrisma.dbInitPromise ?? Promise.resolve()
}

/**
 * Envuelve los delegados de modelo para que cualquier operación espere
 * primero a que el esquema esté listo (compatible con Prisma Client
 * Extensions / sin middleware).
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
