import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { text, productId } = await req.json();

  // 1) rewrite for SEO
  const seoPrompt = `You are an expert e‑commerce SEO copywriter. 
Given this short product description, rewrite it to maximize SEO (concise, include keywords, call to action):\n\n"${text}"`;

  const seoRes = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You help rewrite product descriptions for SEO." },
      { role: "user", content: seoPrompt },
    ],
    temperature: 0.7,
  });
  const improved = seoRes.choices[0].message.content.trim();

  // 2) score it
  const scorePrompt = `On a scale of 0–100, rate the SEO effectiveness of this product description (0 = poor, 100 = perfect):\n\n"${improved}"\n\nReply with just the number.`;
  const scoreRes = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You rate SEO quality from 0 to 100." },
      { role: "user", content: scorePrompt },
    ],
    temperature: 0,
  });
  const rawScore = scoreRes.choices[0].message.content.trim();
  const score = parseInt(rawScore, 10) || 0;

  return NextResponse.json({ improved, score });
}
