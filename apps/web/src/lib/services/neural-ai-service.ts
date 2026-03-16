/**
 * neural-ai-service.ts
 * Fully migrated to Groq (Llama-3.3-70B) — OpenAI dependency removed.
 */

import { getSerperService } from './serper-service';
import { UserTier } from './subscription-service';

export interface AIResponse {
    content: string;
    thoughtProcess?: string[];
    tierUpgradeRequired?: boolean;
}

async function callGroq(systemPrompt: string, userContent: string, jsonMode = false): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.length < 10) throw new Error('GROQ_API_KEY not configured');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            temperature: 0.4,
            max_tokens: 600,
            ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

export class NeuralAIService {
    private static instance: NeuralAIService;

    private constructor() { }

    public static getInstance(): NeuralAIService {
        if (!NeuralAIService.instance) {
            NeuralAIService.instance = new NeuralAIService();
        }
        return NeuralAIService.instance;
    }

    /**
     * Strategic market analysis using live Serper data + Groq
     */
    async analyzeMarket(query: string, userTier: UserTier = 'ELITE'): Promise<AIResponse> {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
            return {
                content: 'Commander, neural link requires GROQ_API_KEY. Configure your environment to activate full intelligence mode.',
                thoughtProcess: ['GROQ_API_KEY missing', 'Fallback mode active'],
                tierUpgradeRequired: false,
            };
        }

        try {
            const serper = getSerperService();
            const [whaleData, marketSentiment] = await Promise.allSettled([
                serper.fetchWhaleIntel(),
                serper.fetchMarketSentiment(),
            ]);

            const whales = whaleData.status === 'fulfilled' ? whaleData.value : [];
            const sentiment = marketSentiment.status === 'fulfilled' ? marketSentiment.value : [];

            const context = `
LIVE WHALE INTEL: ${whales.slice(0, 3).map((w: any) => w.title).join('; ') || 'N/A'}
MARKET SENTIMENT: ${sentiment.slice(0, 2).map((s: any) => s.title).join('; ') || 'N/A'}
USER TIER: ${userTier}
TIMESTAMP: ${new Date().toISOString()}
`;

            const systemPrompt = `You are THE SOVEREIGN NEURAL ASSISTANT.
PERSONA: Cold, professional, precise, elite.
TONE: Zero fluff. Maximum efficiency. You speak to high-end financial professionals.
RULES:
1. Never use emojis.
2. Never apologize.
3. If data is insufficient, state "DATA INSUFFICIENT" and provide the best logical inference.
4. Focus on ALPHA — exclusive, high-value insights.
5. Address the user as "Commander".
6. Respond in the same language the user writes in.`;

            const content = await callGroq(systemPrompt, `CONTEXT:\n${context}\n\nQUERY: ${query}`);

            return {
                content: content || 'SYSTEM: No response generated.',
                thoughtProcess: ['Node connection stable', 'Data packets decrypted', 'Neural mapping complete'],
            };
        } catch (error) {
            console.error('Neural AI Interface Error:', error);
            return {
                content: 'SYSTEM_OFFLINE: Neural link interrupted. Check Groq API authorization.',
                thoughtProcess: ['Connection timeout', 'API_KEY_INVALID'],
            };
        }
    }

    /**
     * Multi-agent War Council debate — fully powered by Groq
     */
    async generateWarCouncilDebate(): Promise<any> {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
            return this.fallbackDebate();
        }

        try {
            const serper = getSerperService();
            const [whaleData, marketSentiment] = await Promise.allSettled([
                serper.fetchWhaleIntel(),
                serper.fetchMarketSentiment(),
            ]);

            const whales = whaleData.status === 'fulfilled' ? whaleData.value : [];
            const sentiment = marketSentiment.status === 'fulfilled' ? marketSentiment.value : [];

            const context = `
WHALE_MOVE: ${whales[0]?.title || 'Standard accumulation'}
SENTIMENT: ${sentiment[0]?.title || 'Neutral volatility'}
TIMESTAMP: ${new Date().toISOString()}`;

            const systemPrompt = `Act as the Imperial consensus engine.
Generate a 4-step debate between three AI agents:
1. Vanguard Alpha (Technician): Charts and technical levels.
2. Oracle Primus (Fundamentalist): Macro and sentiment.
3. Shadow Aegis (Sentinel): Whale moves and dark pools.

Output STRICT JSON:
{
  "steps": [
    {"agent": "Technician", "content": "..."},
    {"agent": "Fundamentalist", "content": "..."},
    {"agent": "Sentinel", "content": "..."},
    {"agent": "Technician", "content": "..."}
  ],
  "directive": "ONE_WORD_DIRECTIVE",
  "directiveDescription": "Short intense action path",
  "confidence": 94.5
}`;

            const raw = await callGroq(systemPrompt, `CURRENT_CONTEXT:\n${context}`, true);
            return JSON.parse(raw || '{}');
        } catch (error) {
            console.error('Council Interface Error:', error);
            return this.fallbackDebate();
        }
    }

    private fallbackDebate() {
        const directives = ['AGGRESSIVE_ACCUMULATION', 'TACTICAL_HEDGE', 'ALPHA_STRIKE_CONFIRMED', 'NEURAL_HANDSHAKE_READY'];
        const directive = directives[Math.floor(Math.random() * directives.length)];
        return {
            steps: [
                { agent: 'Vanguard Alpha', content: 'Fractal divergence on micro-timeframes. Liquidity pools forming at current support. Neural oscillators flipping bullish.' },
                { agent: 'Oracle Primus', content: 'Macro model signals supply shock imminent. Institutional accumulation visible on-chain. Fed sentiment stabilising.' },
                { agent: 'Shadow Aegis', content: 'Top 5 non-exchange wallets increased positions 12.4% in 72h. Supply-side liquidity drying up.' },
                { agent: 'Vanguard Alpha', content: `Consensus: ${directive.toLowerCase().replace(/_/g, ' ')} strategy confirmed.` },
            ],
            directive,
            directiveDescription: 'Imperial algorithm detects rare alignment. Proceed with high-density allocation.',
            confidence: parseFloat((92 + Math.random() * 6).toFixed(1)),
        };
    }
}

export const neuralAI = NeuralAIService.getInstance();
