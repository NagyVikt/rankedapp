import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { text, productId } = await req.json();

  // 1) rewrite for SEO
  const seoRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You help rewrite product descriptions for SEO.',
      },
      { role: 'user', content: `Rewrite for SEO:\n\n"${text}"` },
    ],
    temperature: 0.7,
  });

  const seoText = seoRes.choices?.[0]?.message?.content;
  if (!seoText) {
    return NextResponse.json(
      { success: false, error: 'No SEO rewrite returned' },
      { status: 500 },
    );
  }
  const improved = seoText.trim();

  // 2) score it
  const scoreRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You rate SEO quality from 0 to 100.' },
      {
        role: 'user',
        content: `On a scale of 0–100, rate the SEO effectiveness of this product description:\n\n"${improved}"\n\nReply with just the number.`,
      },
    ],
    temperature: 0,
  });

  const scoreText = scoreRes.choices?.[0]?.message?.content;
  const rawScore = scoreText?.trim() ?? '';
  const score = parseInt(rawScore, 10) || 0;

  return NextResponse.json({ improved, score });
}
