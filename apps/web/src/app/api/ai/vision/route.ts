import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, mode = 'recon', history = [], images = [] } = body;

        if (!message?.trim() && images.length === 0) {
            return NextResponse.json({ response: "SCOUT_ERROR: Empty visual command." }, { status: 400 });
        }

        const GROQ_KEYS = [
            process.env.GROQ_API_KEY || '',
            process.env.GROQ_API_KEY_2 || '',
            process.env.GROQ_API_KEY_3 || '',
        ].filter(k => k.length > 10);

        if (GROQ_KEYS.length === 0) {
            return NextResponse.json({ response: "SCOUT_ERROR: Core keys offline." });
        }

        const systemRules = `YOU ARE VISION SCOUT (Llama 4 Engine). You analyze images directly for The Sovereign platform.
Be concise, analytical, and highly technical in your assessment.
Extract all relevant data, text, or context from the images provided.`;

        // Format user message for Vision
        const userContent: any[] = [
            { type: 'text', text: `[SYSTEM CONTEXT INJECTED]:\n${systemRules}\n\n[USER REQUEST]:\n${message}` }
        ];

        images.forEach((img: string) => {
            userContent.push({
                type: 'image_url',
                image_url: { url: img }
            });
        });

        // ONLY send the current message to prevent context length bloat with base64 images
        const conversationMessages = [
            { role: 'user', content: userContent }
        ];

        let lastError = '';
        for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
            const apiKey = GROQ_KEYS[attempt];
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.2-11b-vision-preview',
                        messages: conversationMessages,
                        max_tokens: 1024,
                        temperature: 0.5,
                        top_p: 0.95,
                        stream: false
                    })
                });

                if (response.status === 429 || response.status === 503) {
                    lastError = `Key ${attempt + 1} rate limited`;
                    continue;
                }

                if (!response.ok) {
                    lastError = await response.text();
                    continue;
                }

                const data = await response.json();
                const aiMessage = data.choices?.[0]?.message?.content;

                if (!aiMessage) {
                    return NextResponse.json({ response: "SCOUT_ERROR: Vision parsing failed." });
                }

                return NextResponse.json({ response: aiMessage });
            } catch (error: any) {
                lastError = error.message;
                continue;
            }
        }

        console.error('[Vision API]: All keys exhausted:', lastError);
        return NextResponse.json({ response: "SCOUT_ERROR: Vision network timeout. Try again." });

    } catch (error) {
        console.error('[Vision API]: Error', error);
        return NextResponse.json({ response: "SCOUT_ERROR: Fatal exception in vision node." });
    }
}
