import { NextRequest, NextResponse } from 'next/server';
import { db, campaigns, webshops } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string }> },
) {
  const { shop } = await params;

  const [row] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.shopIdentifier, shop));

  if (!row) {
    return NextResponse.json({ send_now: [], weekly: [], assignments: {} });
  }

  return NextResponse.json({
    send_now: row.sendNow,
    weekly: row.weekly,
    assignments: row.assignments,
  });
}
export async function POST(req: NextRequest) {
  const { shop, send_now, weekly, assignments } = await req.json();

  if (!shop || !send_now || !weekly || !assignments) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // 1) Look up the numeric webshop ID
  const rows = await db
    .select({ id: webshops.id })
    .from(webshops)
    .where(eq(webshops.slug, shop)) // ← use `slug`, not `identifier`
    .limit(1);

  // rows has type Array<{ id: number }>
  const webshopRow = rows[0];
  if (!webshopRow) {
    return NextResponse.json({ error: 'Unknown shop' }, { status: 404 });
  }
  const webshopId: number = webshopRow.id;

  // 2) Upsert into campaigns
  await db
    .insert(campaigns)
    .values({
      webshopId, // the numeric FK
      name: shop, // or any string you want to use
      shopIdentifier: shop,
      sendNow: send_now,
      weekly,
      assignments,
    })
    .onConflictDoUpdate({
      target: campaigns.shopIdentifier,
      set: {
        sendNow: sql.raw(`EXCLUDED.${campaigns.sendNow.name}`),
        weekly: sql.raw(`EXCLUDED.${campaigns.weekly.name}`),
        assignments: sql.raw(`EXCLUDED.${campaigns.assignments.name}`),
        updatedAt: sql`now()`,
      },
    });

  return NextResponse.json({ ok: true });
}
