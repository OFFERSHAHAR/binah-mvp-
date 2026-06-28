// Server-only Supabase access via PostgREST using the service_role key.
// ponytail: raw REST, no SDK — three helpers cover every call the app makes.
// NEVER import this into client code (it holds the service_role key).

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/rest/v1`
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra }
}

/** SELECT — pass a PostgREST query string, e.g. "courses?select=*&order=sort_order". */
export async function sbSelect<T = any>(query: string): Promise<T[]> {
  const res = await fetch(`${BASE}/${query}`, { headers: headers(), cache: 'no-store' })
  if (!res.ok) throw new Error(`Supabase SELECT ${query} → ${res.status} ${await res.text()}`)
  return res.json()
}

/** INSERT one row, returns the created row. Throws with status on failure (409 = conflict). */
export async function sbInsert<T = any>(table: string, row: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  })
  if (!res.ok) {
    const body = await res.text()
    const err = new Error(`Supabase INSERT ${table} → ${res.status} ${body}`) as Error & { status?: number }
    err.status = res.status
    throw err
  }
  const data = await res.json()
  return data[0]
}

/** PATCH rows matching a PostgREST filter, e.g. ("app_users", "email=eq.x%40y.com", {...}). */
export async function sbUpdate(table: string, filter: string, patch: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${BASE}/${table}?${filter}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`Supabase UPDATE ${table} → ${res.status} ${await res.text()}`)
}
