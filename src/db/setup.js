import { createClient } from '@libsql/client'

export let client = null

export function initDbClient(url, authToken) {
  if (!url || !authToken) {
    client = null
    return false
  }
  
  try {
    client = createClient({ url, authToken })
    return true
  } catch (error) {
    console.error('Failed to create Turso client:', error)
    client = null
    return false
  }
}

export async function initDbSchema() {
  if (!client) return

  try {
    // ── sites — full schema with all fields ──────────────────────────────────
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sites (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        createdAt   TEXT NOT NULL,
        status      TEXT NOT NULL DEFAULT 'active',
        ownerName   TEXT DEFAULT '',
        ownerPhone  TEXT DEFAULT '',
        address     TEXT DEFAULT '',
        completedAt TEXT
      )
    `)

    // ── ADD COLUMN migrations for existing tables (safe — IF NOT EXISTS equiv) ──
    // SQLite doesn't support IF NOT EXISTS on ALTER TABLE, so we wrap each in try/catch
    const safeAlter = async (sql) => {
      try { await client.execute(sql) } catch (_) { /* column already exists */ }
    }
    await safeAlter("ALTER TABLE sites ADD COLUMN status      TEXT NOT NULL DEFAULT 'active'")
    await safeAlter("ALTER TABLE sites ADD COLUMN ownerName   TEXT DEFAULT ''")
    await safeAlter("ALTER TABLE sites ADD COLUMN ownerPhone  TEXT DEFAULT ''")
    await safeAlter("ALTER TABLE sites ADD COLUMN address     TEXT DEFAULT ''")
    await safeAlter("ALTER TABLE sites ADD COLUMN completedAt TEXT")

    // ── entries ──────────────────────────────────────────────────────────────
    await client.execute(`
      CREATE TABLE IF NOT EXISTS entries (
        id         TEXT PRIMARY KEY,
        siteId     TEXT NOT NULL,
        type       TEXT NOT NULL,
        category   TEXT NOT NULL,
        amount     REAL NOT NULL,
        date       TEXT NOT NULL,
        note       TEXT DEFAULT '',
        qty        REAL,
        unitPrice  REAL,
        qtyDetail  TEXT DEFAULT '',
        createdAt  TEXT NOT NULL,
        FOREIGN KEY (siteId) REFERENCES sites(id) ON DELETE CASCADE
      )
    `)
    await safeAlter("ALTER TABLE entries ADD COLUMN qty       REAL")
    await safeAlter("ALTER TABLE entries ADD COLUMN unitPrice REAL")
    await safeAlter("ALTER TABLE entries ADD COLUMN qtyDetail TEXT DEFAULT ''")

    // ── payments ─────────────────────────────────────────────────────────────
    await client.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id         TEXT PRIMARY KEY,
        siteId     TEXT NOT NULL,
        amount     REAL NOT NULL,
        method     TEXT NOT NULL DEFAULT 'cash',
        date       TEXT NOT NULL,
        note       TEXT DEFAULT '',
        createdAt  TEXT NOT NULL,
        FOREIGN KEY (siteId) REFERENCES sites(id) ON DELETE CASCADE
      )
    `)

    console.log('Database schema ready')
  } catch (error) {
    console.error('DB init error:', error)
  }
}
