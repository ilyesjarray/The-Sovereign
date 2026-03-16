import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 503 });
    }

    const { assets } = await req.json();
    // assets = [{ name: 'BTC', price: 84000, change: '+2.3%' }, ...]

    const prompt = `You are an elite quantitative trading AI. Analyze the following live crypto prices and give a SHORT trading signal for each asset.

LIVE MARKET DATA:
${assets.map((a: any) => `- ${a.name}: $${a.price} (24h: ${a.change})`).join('\n')}

For each asset, respond with EXACTLY this JSON format (array):
[
  { "asset": "BTC", "signal": "BUY" | "SELL" | "HOLD", "confidence": 85, "reason": "one sentence max", "target": 90000, "stopLoss": 80000 }
]

Be direct, precise, and based on momentum/trend analysis. Return only the JSON array, nothing else.`;

    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 512,
            }),
        });

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content?.trim() || '[]';

        // Parse JSON safely
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        const signals = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        return NextResponse.json({ signals, timestamp: new Date().toISOString() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
