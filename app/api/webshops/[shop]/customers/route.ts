// app/api/webshops/[shop]/customers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db, customers } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

interface WooEntry {
  selectedShopUrl: string
  consumerKey:      string
  consumerSecret:   string
}

function slugify(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase()
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string }> }
) {
  try {
    const { shop: shopSlug } = await params

    // 1) find shop in my_webshops cookie
    const shops = JSON.parse(
      decodeURIComponent(req.cookies.get('my_webshops')?.value ?? '[]')
    ) as { name: string; url: string }[]

    const matched = shops.find((s) => {
      const base = slugify(s.url)
      return base === shopSlug || `www-${base}` === shopSlug
    })
    if (!matched) return NextResponse.json({ error: 'Unknown shop' }, { status: 404 })

    // 2) find Woo creds in wooConnections cookie
    const conns = JSON.parse(
      decodeURIComponent(req.cookies.get('wooConnections')?.value ?? '[]')
    ) as WooEntry[]
    const creds = conns.find((c) => c.selectedShopUrl === matched.url)
    if (!creds) return NextResponse.json({ error: 'Missing credentials' }, { status: 401 })

    // 3) normalize URL → https://www...
    let raw = matched.url
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
    const u = new URL(raw)
    if (!u.hostname.startsWith('www.')) u.hostname = `www.${u.hostname}`
    const origin = u.origin

    // 4) page through Woo customers
    const allEmails: string[] = []
    let page = 1, totalPages = 1
    const perPage = 100

    do {
      const qs = new URLSearchParams({
        consumer_key:    creds.consumerKey,
        consumer_secret: creds.consumerSecret,
        per_page:        String(perPage),
        page:            String(page),
        _fields:         'email',
      })

      const wcRes = await fetch(`${origin}/wp-json/wc/v3/customers?${qs}`, {
        next: { revalidate: 60 },
      })
      if (!wcRes.ok) {
        return NextResponse.json(
          { error: `Woo returned ${wcRes.status}` },
          { status: wcRes.status }
        )
      }

      totalPages = Number(wcRes.headers.get('X-WP-TotalPages') ?? '1')
      const pageData = await wcRes.json()
      pageData.forEach((c: any) => {
        if (c.email) allEmails.push(c.email as string)
      })
      page++
    } while (page <= totalPages)

    // 5) upsert into Postgres
    const rows = allEmails.map((email) => ({ shop: shopSlug, email }))
    await db.insert(customers).values(rows).onConflictDoNothing()

    // 6) return de-duplicated list from DB
    const saved = await db
      .select()
      .from(customers)
      .where(eq(customers.shop, shopSlug))
      .orderBy(desc(customers.createdAt))

    return NextResponse.json({ emails: saved.map((r) => r.email) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
