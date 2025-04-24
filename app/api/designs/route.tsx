// app/api/designs/route.ts
import { NextResponse } from 'next/server'
import { db, designs } from '@/lib/db'    // or relative paths
import { desc } from 'drizzle-orm'

export async function GET() {
    const all = await db
      .select()
      .from(designs)
      .orderBy(desc(designs.createdAt))
  
    return NextResponse.json(all)
  }

export async function POST(req: Request) {
  const { name, design } = await req.json()
  if (!name || !design) {
    return NextResponse.json({ error: 'Missing name or design' }, { status: 400 })
  }
  const [created] = await db
    .insert(designs)
    .values({ name, design })
    .returning()
  return NextResponse.json(created, { status: 201 })
}
