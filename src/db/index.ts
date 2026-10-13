import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

const globalForDb = globalThis as unknown as {
  altntveDb?: DrizzleDb
}

function createDb(): DrizzleDb {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local — see .env.example.",
    )
  }

  const pool = new Pool({
    connectionString,
    idleTimeoutMillis: intFromEnv("DATABASE_IDLE_TIMEOUT_MS", 30_000),
    max: intFromEnv("DATABASE_POOL_MAX", 10),
  })

  return drizzle(pool, { schema })
}

function getDb(): DrizzleDb {
  globalForDb.altntveDb ??= createDb()
  return globalForDb.altntveDb
}

function intFromEnv(name: string, fallback: number) {
  const raw = process.env[name]
  const parsed = Number.parseInt(raw ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver)
  },
})

export * as tables from "./schema"
export { SITE_ID } from "./schema"
