import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const MODEL_NAME = 'llama-3.3-70b-versatile';

const NEWS_API = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: User ID required for intel scan.' }, { status: 401 });
        }

        if (!GROQ_API_KEY || GROQ_API_KEY.length < 10) {
            return NextResponse.json({ error: 'GROQ_API_KEY not configured.' }, { status: 503 });
        }

        // 1. Fetch raw news
        const newsRes = await fetch(NEWS_API);
        if (!newsRes.ok) throw new Error('Failed to fetch raw market intel from global nodes.');
        const newsData = await newsRes.json();

        // Get top 3 breaking news articles
        const topNews = newsData.Data?.slice(0, 3) || [];

        if (topNews.length === 0) {
            return NextResponse.json({ status: 'NO_NEW_INTEL' });
        }

        // 2. Synthesize using AI (Llama 3.3)
        const reports: any[] = [];

        for (const item of topNews) {
            const prompt = `Analyze this news and rewrite it as a 'Sovereign Intelligence Briefing' in a concise, urgent, and highly professional tone (max 40 words). Mention any potential market impact. 
            News Title: ${item.title}
            Source: ${item.source_info?.name}
            Content: ${item.body}`;

            try {
                const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: MODEL_NAME,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.3,
                        max_tokens: 200
                    })
                });

                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    let intelContent = aiData.choices[0].message.content.trim();
                    // Remove quotes if AI added them
                    if (intelContent.startsWith('"') && intelContent.endsWith('"')) {
                        intelContent = intelContent.slice(1, -1);
                    }

                    reports.push({
                        user_id: userId,
                        scout_type: 'NEWS',
                        intel_level: Math.random() > 0.7 ? 'CRITICAL' : (Math.random() > 0.4 ? 'WARNING' : 'INFO'),
                        content: intelContent,
                        is_read: false
                    });
                }
            } catch (e) {
                console.error('AI Summarization Node offline for item:', item.title);
            }
        }

        if (reports.length > 0) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            const { error } = await supabase.from('scout_reports').insert(reports);
            if (error) {
                console.error("Supabase insert failed:", error);
                throw error;
            }
            return NextResponse.json({ status: 'INTEL_GATHERED', count: reports.length, reports });
        }

        return NextResponse.json({ status: 'ALL_NODES_SILENT' });

    } catch (error: any) {
        console.error("Intel Scan critical failure:", error);
        return NextResponse.json({ error: error.message || 'Internal Intel Node Error' }, { status: 500 });
    }
}
