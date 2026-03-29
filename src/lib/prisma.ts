import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined
}

function getClient(): PrismaClient {
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma

  let client: PrismaClient

  if (process.env.TURSO_DATABASE_URL) {
    // Production: Turso/libsql
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    client = new PrismaClient({ adapter } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  } else {
    // Local dev: SQLite with better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require(/* webpackIgnore: true */ '@prisma/adapter-better-sqlite3')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
    const filePath = dbUrl.replace('file:', '')
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(/*turbopackIgnore: true*/ process.cwd(), filePath)
    client = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: resolvedPath }) } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  globalForPrisma.__prisma = client
  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getClient() as any)[prop] // eslint-disable-line @typescript-eslint/no-explicit-any
  },
})
