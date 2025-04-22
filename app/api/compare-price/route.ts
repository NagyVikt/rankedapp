// app/api/compare-price/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const payload = await request.json();
  const res = await fetch('http://127.0.0.1:8000/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
