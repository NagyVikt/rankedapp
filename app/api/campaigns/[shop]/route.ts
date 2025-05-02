import { NextRequest, NextResponse } from 'next/server'
import { db, campaigns }           from '@/lib/db'
import { eq, sql }                 from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string }> }
) {
  const { shop } = await params

  const [row] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.shopIdentifier, shop))

  if (!row) {
    return NextResponse.json({ send_now: [], weekly: [], assignments: {} })
  }

  return NextResponse.json({
    send_now:    row.sendNow,
    weekly:      row.weekly,
    assignments: row.assignments,
  })
}

export async function POST(req: NextRequest) {
  const { shop, send_now, weekly, assignments } = await req.json()
  if (!shop || !send_now || !weekly || !assignments) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await db
    .insert(campaigns)
    .values({
      shopIdentifier: shop,
      sendNow:        send_now,
      weekly,
      assignments,
    })
    .onConflictDoUpdate({
      target: campaigns.shopIdentifier,
      set: {
        sendNow:     sql.raw(`EXCLUDED.${campaigns.sendNow.name}`),
        weekly:      sql.raw(`EXCLUDED.${campaigns.weekly.name}`),
        assignments: sql.raw(`EXCLUDED.${campaigns.assignments.name}`),
        updatedAt:   sql`now()`,
      },
    })

  return NextResponse.json({ ok: true })
}
