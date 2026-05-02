import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image } = body; // base64 data URL

        if (!image) {
            return NextResponse.json({ safe: false, reason: 'No image provided' }, { status: 400 });
        }

        const GROQ_KEYS = [
            process.env.GROQ_API_KEY || '',
            process.env.GROQ_API_KEY_2 || '',
            process.env.GROQ_API_KEY_3 || '',
        ].filter(k => k.length > 10);

        if (GROQ_KEYS.length === 0) {
            // If no keys, allow upload (fail open)
            return NextResponse.json({ safe: true, reason: 'Moderation keys offline — bypassed' });
        }

        const userContent = [
            {
                type: 'text',
                text: `You are a content moderation system. Analyze this image and determine if it contains NSFW, explicit, pornographic, gore, or violent content that violates community guidelines. Respond with ONLY a JSON object, nothing else: {"safe": true} or {"safe": false, "reason": "brief reason"}`
            },
            {
                type: 'image_url',
                image_url: { url: image }
            }
        ];

        for (let i = 0; i < GROQ_KEYS.length; i++) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_KEYS[i]}`,
                    },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                        messages: [{ role: 'user', content: userContent }],
                        max_tokens: 100,
                        temperature: 0.1,
                        stream: false
                    })
                });

                if (response.status === 429 || response.status === 503) continue;
                if (!response.ok) continue;

                const data = await response.json();
                const text = data.choices?.[0]?.message?.content || '';

                // Parse the JSON response
                const jsonMatch = text.match(/\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    return NextResponse.json(result);
                }

                // If can't parse, check for keywords
                const lower = text.toLowerCase();
                if (lower.includes('"safe": false') || lower.includes('nsfw') || lower.includes('explicit')) {
                    return NextResponse.json({ safe: false, reason: 'Content flagged by AI moderation' });
                }

                return NextResponse.json({ safe: true });
            } catch {
                continue;
            }
        }

        // All keys failed — fail open
        return NextResponse.json({ safe: true, reason: 'Moderation unavailable' });

    } catch (error) {
        console.error('[Moderation API]:', error);
        return NextResponse.json({ safe: true, reason: 'Moderation error — bypassed' });
    }
}
