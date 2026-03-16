/**
 * social-verifier.ts
 * AI-powered truth verification engine for social media intelligence.
 */

import { Groq } from 'groq-sdk';
import { getSerperService } from './serper-service';

export interface VerifiedIntel {
    original_content: string;
    source: string;
    author: string;
    media_url?: string;
    verified_summary: string;
    trust_score: number;
    category: 'ECONOMY' | 'GEOPOLITICAL' | 'TECH' | 'SECURITY';
    status: 'VERIFIED' | 'DISPUTED' | 'FAKE';
}

export class SocialVerifierService {
    private static instance: SocialVerifierService;
    private groq: Groq;

    private constructor() {
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    public static getInstance() {
        if (!this.instance) this.instance = new SocialVerifierService();
        return this.instance;
    }

    /**
     * Cross-references social media claims against official news and market data
     */
    async verifySocialSignal(content: string, source: string): Promise<VerifiedIntel> {
        const serper = getSerperService();

        // 1. Search for official confirmation
        const searchQuery = `verification of: ${content.slice(0, 100)}`;
        const searchResults = await serper.search(searchQuery);

        const context = `
        SOCIAL SIGNAL: "${content}"
        SOURCE: ${source}
        OFFICIAL NEWS MATCHES: ${searchResults.slice(0, 3).map(r => r.title).join(' | ')}
        `;

        const systemPrompt = `You are THE SOVEREIGN TRUTH ENGINE.
Your mission is to analyze social media rumors and assign a Truth Score (0-100).
Compare the signal against official news context provided.
Output STRICT JSON:
{
  "verified_summary": "Concise summary of the truth (max 30 words)",
  "trust_score": 85,
  "category": "ECONOMY",
  "status": "VERIFIED"
}
Categories: ECONOMY, GEOPOLITICAL, TECH, SECURITY.
Status rules: 
- 90-100: VERIFIED
- 40-89: DISPUTED
- <40: FAKE`;

        try {
            const completion = await this.groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: context }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1
            });

            const aiResult = JSON.parse(completion.choices[0]?.message?.content || '{}');

            return {
                original_content: content,
                source: source,
                author: 'Anonymous', // Simplified for demo
                verified_summary: aiResult.verified_summary,
                trust_score: aiResult.trust_score,
                category: aiResult.category,
                status: aiResult.status
            };
        } catch (error) {
            console.error('[Social Verifier]: Error', error);
            return {
                original_content: content,
                source: source,
                author: 'Anonymous',
                verified_summary: 'Could not verify at this time. Network desync.',
                trust_score: 50,
                category: 'SECURITY',
                status: 'DISPUTED'
            };
        }
    }
}

export const socialVerifier = SocialVerifierService.getInstance();
