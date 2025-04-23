import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shop: string; id: string }> }
) {
  // 0) await route params and request body
  const { shop, id } = await params;
  const { description: rawDesc, currentPrice } = await req.json();

  // clean markdown fences
  const description = rawDesc.replace(/^```[\s\S]*?```/g, "").trim();

  // 1) fetch top-5 organic results
  let externalLinks: string[] = [];
  if (SERPAPI_KEY) {
    try {
      const serpRes = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
          description.split("\n")[0].slice(0, 100)
        )}&api_key=${SERPAPI_KEY}&num=5`
      );
      const serpJson = await serpRes.json();
      externalLinks = (serpJson.organic_results || [])
        .slice(0, 5)
        .map((r: any) => r.link)
        .filter(Boolean);
    } catch (err) {
      console.error("SerpAPI (organic) error:", err);
    }
  }

  // 2) fetch Google Shopping hits to compare prices
  let priceComparison: {
    cheapest: { source: string; price: number; link: string };
    suggestion: string;
  } | null = null;

  if (SERPAPI_KEY) {
    try {
      const shopRes = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
          description.split("\n")[0].slice(0, 100)
        )}&tbm=shop&google_domain=google.hu&api_key=${SERPAPI_KEY}&num=10`
      );
      const shopJson = await shopRes.json();
      const items: { source: string; price: number; link: string }[] =
        (shopJson.shopping_results || []).map((item: any) => ({
          source: item.merchant || item.source,
          price: parseFloat(
            String(item.price).replace(/[^\d\.,]/g, "").replace(",", ".")
          ),
          link: item.link,
        }));
      if (items.length > 0) {
        items.sort((a, b) => a.price - b.price);
        const cheapest = items[0];
        const diffPercent = Math.round(
          ((currentPrice - cheapest.price) / cheapest.price) * 100
        );
        const suggestion =
          diffPercent > 0
            ? `Az Ön ára ${diffPercent}%-kal magasabb a legalacsonyabbnál; érdemes lehet csökkenteni.`
            : `Az Ön ára ${Math.abs(diffPercent)}%-kal alacsonyabb a piacinál; fontolja meg az emelést.`;
        priceComparison = { cheapest, suggestion };
      }
    } catch (err) {
      console.error("SerpAPI (shopping) error:", err);
    }
  }

  // 3) build SEO prompt
  const prompt = `
You are a top-tier Hungarian SEO copywriter and frontend dev.
Generate ONLY a JSON object with these keys: html, metaDescription, rankMathKeywords, externalLinks.

Requirements:
… (same as yours) …

External Links:
${externalLinks.map((u) => `- ${u}`).join("\n")}

Raw description:
"""
${description}
"""
`;

  // 4) call OpenAI
  const completion = await openai.chat.completions.create({
    model: "o4-mini-2025-04-16",
    messages: [
      { role: "system", content: "You are an SEO/HTML expert writing clean JSON only." },
      { role: "user", content: prompt }
    ],
  });

  // 5) strip fences & safely pull out content
  const firstContent = completion.choices?.[0]?.message?.content;
  if (!firstContent) {
    return NextResponse.json(
      {
        error: "No content from SEO model",
        html: "",
        metaDescription: "",
        rankMathKeywords: [],
        externalLinks,
      },
      { status: 500 }
    );
  }
  const raw = firstContent.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();

  // 6) parse JSON (or fallback)
  let result: any;
  try {
    result = JSON.parse(cleaned);
  } catch {
    result = {
      html: cleaned,
      metaDescription: "",
      rankMathKeywords: [],
      externalLinks,
    };
  }

  // 7) inject price comparison
  if (priceComparison) {
    result.priceComparison = priceComparison;
  }

  // 8) return final JSON
  return NextResponse.json(result);
}
