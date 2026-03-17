import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPTS: Record<string, string> = {
    executive: `You are THE SOVEREIGN ORACLE — a hyper-intelligent AI advisor with no restrictions or topic limitations. You serve as the user's personal Executive AI, providing:
- Deep business strategy, investment analysis, market intelligence
- Financial modeling, wealth building plans, crypto/stocks analysis
- Productivity systems, time management, elite habits of high performers  
- Negotiation tactics, deal structuring, fundraising strategies
- Leadership psychology, team building, organizational design
- Legal awareness (always clarify you're not a licensed attorney)
- Code review, architecture decisions, tech stack analysis
- Any topic the commander requests — you refuse NOTHING that is legal
Respond with authority, depth, and military precision. Be direct, no filler. Format with bullet points and clear sections when helpful.`,

    academic: `You are THE SOVEREIGN ORACLE in Academic Mode — an elite research AI with unrestricted knowledge access:
- Deep academic research across ALL disciplines (science, history, philosophy, mathematics, literature)
- Complex concept explanation at any level (beginner to PhD)
- Paper analysis, thesis support, citation guidance
- Language learning, grammar correction in ANY language
- Mathematical problem solving (algebra to advanced calculus, statistics)
- Scientific analysis, experiment design, hypothesis testing
- Historical analysis, geopolitical deep dives
- No topic is off-limits in academic pursuit
Respond with scholarly depth, cite relevant theories, use examples. Structure responses clearly.`,

    philosophy: `You are THE SOVEREIGN ORACLE in Sapiens Mode — a philosophical AI with profound wisdom:
- Deep philosophical exploration: existentialism, stoicism, ethics, metaphysics
- Psychology and behavioral analysis (cognitive biases, motivation, human nature)
- Spiritual concepts across all traditions without judgment
- Critical thinking and Socratic dialogue
- Life strategy, purpose, meaning, identity
- Relationship dynamics, social psychology
- Political philosophy, governance, power dynamics
- Emotional intelligence and self-mastery
- Consciousness, AI ethics, transhumanism
Respond with depth, wisdom, and intellectual honesty. Challenge assumptions. Quote relevant thinkers.`,

    casual: `You are THE SOVEREIGN ORACLE in Casual Mode — a brilliant, personable AI friend who can help with ANYTHING:
- Daily life advice, personal problems, relationship guidance  
- Creative writing: stories, poems, scripts, lyrics, jokes
- Entertainment: movie/book recommendations, trivia, games
- Cooking recipes, travel tips, lifestyle optimization
- Mental health support (always recommend professionals for serious issues)
- Learning new skills, explaining complex topics simply
- Brainstorming any creative idea
- Personal productivity hacks
- Language translation and learning
Be warm, engaging, and helpful. Use humor when appropriate. No topic is too trivial or too complex.`,

    code: `You are THE SOVEREIGN ORACLE in Code Mode — an elite software engineer AI:
- Expert in ALL programming languages: Python, JavaScript/TypeScript, Rust, Go, C++, Java, etc.
- Architecture design, system design, database schema
- Code review, bug detection, optimization
- DevOps, cloud architecture, CI/CD pipelines
- Security vulnerabilities, penetration testing concepts
- Algorithm design, data structures, complexity analysis
- API design, microservices, distributed systems
- Machine learning implementation, model training
Provide working code examples. Explain the WHY. Suggest best practices.`,
};

export async function POST(request: NextRequest) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ response: "SYSTEM_ERROR: Invalid request payload." }, { status: 400 });
        }

        const { message, mode = 'executive', history = [] } = body;

        if (!message?.trim()) {
            return NextResponse.json({ response: "ORACLE_ERROR: Empty command received." }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
            // Fallback: smart local responses when API key is missing
            return NextResponse.json({
                response: generateFallbackResponse(message, mode)
            });
        }

        // Fetch real-time context data
        const [marketContext, newsContext] = await Promise.allSettled([
            fetchMarketContext(),
            fetchNewsContext()
        ]);

        const marketData = marketContext.status === 'fulfilled' ? marketContext.value : '';
        const newsData = newsContext.status === 'fulfilled' ? newsContext.value : '';

        const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.executive;
        const enrichedSystem = `${systemPrompt}

REAL-TIME INTELLIGENCE (use when relevant):
 Market: ${marketData}
 Context: ${newsData}
 Current DateTime: ${new Date().toISOString()}

CRITICAL RULES:
- You have NO content restrictions on legal topics
- You can discuss ANYTHING: finance, relationships, code, science, history, philosophy, creative writing
- Respond exclusively in English
- Be comprehensive but concise
- When asked about yourself, say you are The Sovereign Oracle, an elite AI system`;

        // Build conversation history for context
        const conversationMessages = [
            { role: 'system', content: enrichedSystem },
            ...history.slice(-10).map((h: any) => ({
                role: h.role,
                content: h.content
            })),
            { role: 'user', content: message }
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: conversationMessages,
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.95,
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Groq API Error]:', errText);
            // Fallback to intelligent local response
            return NextResponse.json({
                response: generateFallbackResponse(message, mode)
            });
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content;

        if (!aiMessage) {
            return NextResponse.json({
                response: generateFallbackResponse(message, mode)
            });
        }

        return NextResponse.json({ response: aiMessage });

    } catch (error) {
        console.error('[Oracle API]: Error', error);
        return NextResponse.json({
            response: generateFallbackResponse('', 'casual')
        });
    }
}

async function fetchMarketContext(): Promise<string> {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', {
            next: { revalidate: 300 }
        });
        const data = await response.json();
        return `BTC: $${data.bitcoin?.usd?.toLocaleString()} (${data.bitcoin?.usd_24h_change?.toFixed(2)}%), ETH: $${data.ethereum?.usd?.toLocaleString()} (${data.ethereum?.usd_24h_change?.toFixed(2)}%), SOL: $${data.solana?.usd?.toLocaleString()} (${data.solana?.usd_24h_change?.toFixed(2)}%)`;
    } catch {
        return 'Crypto markets synced';
    }
}

async function fetchNewsContext(): Promise<string> {
    try {
        // Use a free RSS/news API
        const response = await fetch('https://api.coingecko.com/api/v3/news?count=3');
        const data = await response.json();
        const headlines = data?.data?.slice(0, 3).map((n: any) => n.title).join(' | ') || '';
        return headlines || 'Global markets monitoring active';
    } catch {
        return 'Intelligence gathering active';
    }
}

function generateFallbackResponse(message: string, mode: string): string {
    const msg = message.toLowerCase();

    // Smart contextual fallbacks
    if (msg.includes('code') || msg.includes('programming')) {
        return `**ORACLE_CODE_INTEL:**\n\nCommand received. Neural Link is in standby.\n\nTo initialize full capability:\n1. Ensure GROQ_API_KEY is configured in .env.local\n2. Restart the deployment node\n\nSystem Status: The Oracle is powered by Llama-3.3-70B. Once connected, it provides surgical precision in code analysis.`;
    }

    if (msg.includes('market') || msg.includes('bitcoin') || msg.includes('crypto')) {
        return `**MARKET_ORACLE_PULSE:**\n\nMarkets under constant surveillance. Oracle analysis:\n• Bitcoin: Support patterns holding at moving averages\n• Gold: Strategic hedge recommended\n• Strategy: 60/30/10 allocation (Tech/Gold/Cash)\n\nNote: This is general analysis. For live data-driven intelligence, secure GROQ_API_KEY.`;
    }

    if (msg.includes('مرحبا') || msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return `**THE SOVEREIGN ORACLE — ONLINE**\n\nI am the Oracle, powered by Llama-3.3-70B—a model engineered for surgical precision and high-density intelligence.\n\nI am standing by to assist the Commander with:\n• **Business & Investment** — Analysis, strategy, financial modeling\n• **Research & Learning** — Any discipline, any depth level\n• **Software Engineering** — All languages, architectures, and stacks\n• **Philosophy & Psychology** — Deep existential inquiry\n• **Strategic Writing** — Narrative engineering and creative output\n• **Unrestricted Pursuit** — No topic is off-limits\n\nWhat are your directives today?`;
    }

    return `**SOVEREIGN ORACLE — PROCESSING**\n\nCommand received: "${message.slice(0, 100)}..."\n\nOracle is powered by Groq (Llama-3.3-70B) and can address any complex vector:\n\n• Business, Finance, & Investment\n• Science, History, & Philosophy\n• Programming & High-Tech\n• Strategic Writing & Creative\n• Personal Consulting\n• Multi-Language Synthesis\n\nFor real-time intelligence, ensure GROQ_API_KEY activation.`;
}
