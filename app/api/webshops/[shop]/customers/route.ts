// app/api/webshops/[shop]/customers/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db, webshops, customers }  from '@/lib/db'
import { eq, desc }                 from 'drizzle-orm'

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

    // 1) Look up the webshop record to get its integer ID
    const [shopRow] = await db
      .select()
      .from(webshops)
      .where(eq(webshops.slug, shopSlug))

    if (!shopRow) {
      return NextResponse.json({ error: 'Unknown shop' }, { status: 404 })
    }

    // 2) Pull Woo creds from cookies…
    const shops = JSON.parse(
      decodeURIComponent(req.cookies.get('my_webshops')?.value ?? '[]')
    ) as { name: string; url: string }[]

    const matched = shops.find(s => {
      const base = slugify(s.url)
      return base === shopSlug || `www-${base}` === shopSlug
    })
    if (!matched) {
      return NextResponse.json({ error: 'Unknown shop in cookie' }, { status: 404 })
    }

    const conns = JSON.parse(
      decodeURIComponent(req.cookies.get('wooConnections')?.value ?? '[]')
    ) as WooEntry[]
    const creds = conns.find(c => c.selectedShopUrl === matched.url)
    if (!creds) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 401 })
    }

    // 3) Fetch all emails from Woo…
    let raw = matched.url
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
    const u = new URL(raw)
    if (!u.hostname.startsWith('www.')) u.hostname = `www.${u.hostname}`
    const origin = u.origin

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
      const data = await wcRes.json()
      for (const c of data) if (c.email) allEmails.push(c.email as string)
      page++
    } while (page <= totalPages)

    // 4) Upsert into customers *with* webshopId
    await db
      .insert(customers)
      .values(
        allEmails.map(email => ({
          email,
          webshopId: shopRow.id,    // ← KEY: never null
        }))
      )
      .onConflictDoNothing()

    // 5) Return de-duplicated list by the FK
    const saved = await db
      .select({ email: customers.email })
      .from(customers)
      .where(eq(customers.webshopId, shopRow.id))  // ← filter on webshopId
      .orderBy(desc(customers.createdAt))

    return NextResponse.json({ emails: saved.map(r => r.email) })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
