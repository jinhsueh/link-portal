/**
 * Apply pending Prisma migrations to a Turso (libsql) database via HTTP API.
 *
 * Why this exists:
 * - The libsql adapter is not supported by `prisma migrate deploy`, so we can't
 *   run that against Turso. Without this script every schema change requires a
 *   manual `ALTER TABLE` against production, which is exactly how production
 *   500'd after the SocialLink.iconUrl change.
 *
 * What it does:
 * 1. Reads `prisma/migrations/<id>/migration.sql` files (in lexical order — same
 *    order Prisma applies them locally).
 * 2. Reads the `_prisma_migrations` table on the target DB to see which IDs
 *    are already applied. Creates the table if it doesn't exist.
 * 3. For each pending migration, splits the SQL on `;` boundaries (skipping
 *    comments / empty lines), executes each statement via the Turso `pipeline`
 *    HTTP endpoint, then records the migration as applied with a checksum.
 *
 * Skipped silently if `TURSO_DATABASE_URL` is not set (e.g. local dev), so this
 * is safe to wedge into the build script.
 *
 * Usage:
 *   npx tsx scripts/migrate-turso.ts            # apply pending
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate-turso.ts
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const MIGRATIONS_DIR = join(process.cwd(), 'prisma', 'migrations')

interface PipelineRequest {
  type: 'execute' | 'close'
  stmt?: { sql: string }
}

interface PipelineResponse {
  results: Array<
    | { type: 'ok'; response: { type: 'execute'; result: { rows: unknown[][]; cols: Array<{ name: string }> } } }
    | { type: 'ok'; response: { type: 'close' } }
    | { type: 'error'; error: { message: string } }
  >
}

async function runPipeline(host: string, token: string, requests: PipelineRequest[]): Promise<PipelineResponse> {
  const res = await fetch(`https://${host}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}: ${await res.text()}`)
  return res.json() as Promise<PipelineResponse>
}

async function exec(host: string, token: string, sql: string): Promise<PipelineResponse> {
  return runPipeline(host, token, [
    { type: 'execute', stmt: { sql } },
    { type: 'close' },
  ])
}

/** Split a multi-statement SQL string into individual statements. */
function splitStatements(sql: string): string[] {
  // Strip leading SQL line-comments (Prisma migrations always lead with
  // `-- AlterTable` / `-- CreateTable`). If we don't, the whole "statement"
  // looks like a comment and gets filtered out, silently no-op'ing the migration
  // while it gets recorded as applied — exactly how add-user-banner-url
  // produced "Applied 1 migration(s)" but no actual ALTER TABLE.
  const stripLeadingComments = (s: string) =>
    s.replace(/^(\s*--[^\n]*\n)+/, '').trim()

  return sql
    .split(/;\s*\n/)             // boundary = semicolon at end of line
    .map(stripLeadingComments)
    .filter(s => s.length > 0)
    .map(s => s.endsWith(';') ? s : s + ';')
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN
  if (!url || !token) {
    console.log('[migrate-turso] TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not set — skipping (dev mode).')
    return
  }
  const host = url.replace(/^libsql:\/\//, '')

  // 1. Ensure the _prisma_migrations bookkeeping table exists.
  await exec(host, token, `
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                   TEXT PRIMARY KEY NOT NULL,
      "checksum"             TEXT NOT NULL,
      "finished_at"          DATETIME,
      "migration_name"       TEXT NOT NULL,
      "logs"                 TEXT,
      "rolled_back_at"       DATETIME,
      "started_at"           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count"  INTEGER NOT NULL DEFAULT 0
    );
  `)

  // 2. Load applied IDs.
  const appliedRes = await exec(host, token, `SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL;`)
  const appliedRow = appliedRes.results[0]
  const appliedNames = new Set<string>()
  if (appliedRow.type === 'ok' && appliedRow.response.type === 'execute') {
    const colIndex = appliedRow.response.result.cols.findIndex(c => c.name === 'migration_name')
    for (const row of appliedRow.response.result.rows) {
      const cell = row[colIndex] as { type?: string; value?: string } | string
      const name = typeof cell === 'string' ? cell : cell?.value
      if (name) appliedNames.add(name)
    }
  }

  // 3. Read local migrations sorted by directory name (which is timestamped).
  const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()

  let appliedCount = 0
  for (const name of dirs) {
    if (appliedNames.has(name)) continue

    const sqlPath = join(MIGRATIONS_DIR, name, 'migration.sql')
    let sql: string
    try {
      sql = readFileSync(sqlPath, 'utf-8')
    } catch {
      console.warn(`[migrate-turso] no migration.sql for ${name}, skipping`)
      continue
    }

    console.log(`[migrate-turso] Applying ${name}...`)
    const checksum = createHash('sha256').update(sql).digest('hex')
    const id = `${name}-${Date.now()}`

    // 4. Execute each statement, then record. We do NOT wrap in a single
    //    transaction because Turso's HTTP pipeline doesn't support
    //    multi-statement transactions cleanly across DDL.
    const statements = splitStatements(sql)
    for (const stmt of statements) {
      const result = await exec(host, token, stmt)
      const r = result.results[0]
      if (r.type === 'error') {
        // Re-throw with context so failures are debuggable in CI logs.
        throw new Error(`[migrate-turso] FAIL on ${name}: ${r.error.message}\nSQL: ${stmt.slice(0, 200)}`)
      }
    }

    // 5. Mark as applied.
    await exec(host, token, `
      INSERT INTO _prisma_migrations (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
      VALUES ('${id}', '${checksum}', '${name}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${statements.length});
    `)
    appliedCount++
  }

  if (appliedCount === 0) {
    console.log('[migrate-turso] DB up to date — nothing to apply.')
  } else {
    console.log(`[migrate-turso] Applied ${appliedCount} migration(s).`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
