import { NextRequest, NextResponse } from 'next/server'
import { db, campaigns } from '@/lib/db'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string }> }
) {
  const { shop } = await params

  // look up existing campaign
  const [row] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.shop, shop))

  if (!row) {
    // nothing saved yet: return empty defaults
    return NextResponse.json({ send_now: [], weekly: [], assignments: {} })
  }
  return NextResponse.json({
    send_now:    row.send_now,
    weekly:      row.weekly,
    assignments: row.assignments,
  })
}

export async function POST(req: NextRequest) {
  const { shop, send_now, weekly, assignments } = await req.json()
  if (!shop || !send_now || !weekly || !assignments) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // upsert via ON CONFLICT(shop)
  await db
    .insert(campaigns)
    .values({ shop, send_now, weekly, assignments })
    .onConflictDoUpdate({
      target: campaigns.shop,
      set: {
        send_now:    sql`EXCLUDED.send_now`,
        weekly:      sql`EXCLUDED.weekly`,
        assignments: sql`EXCLUDED.assignments`,
        updated_at:  sql`now()`,
      },
    })

  return NextResponse.json({ ok: true })
}
