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

/**
 * Drizzle handle over a lazily created pool.
 *
 * Proxied so importing this module never opens a connection: a build or a
 * `robots.txt` request should not fail because `DATABASE_URL` is unset and no
 * query is ever issued.
 */
export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver)
  },
})

export * as tables from "./schema"
export { SITE_ID } from "./schema"

/** Postgres SQLSTATE for a unique constraint violation. */
const UNIQUE_VIOLATION = "23505"

/**
 * Reports whether a failed write lost a race against a unique index.
 *
 * A separate `slugExists` check cannot be atomic with the insert that follows it,
 * so the constraint is the real arbiter and its error is what needs translating
 * into something an admin can read.
 */
export function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_VIOLATION
  )
}
