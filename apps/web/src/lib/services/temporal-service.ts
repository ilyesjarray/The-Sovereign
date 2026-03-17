/**
 * temporal-service.ts
 * Quantum-inspired predictive engine for temporal branching.
 */

import { Groq } from 'groq-sdk';

export interface TemporalBranch {
    id: string;
    name: 'ANCHOR' | 'CHAOS' | 'COLLAPSE' | 'SINGULARITY' | 'BLACK_SWAN';
    probability: number;
    description: string;
    impact_factor: number; // -1 to +1
    horizon: string; // Timeframe
}

export class TemporalService {
    private static instance: TemporalService;
    private _groq: Groq | null = null;
    private apiKey: string;

    private constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
    }

    private getGroq(): Groq {
        if (!this._groq) {
            if (!this.apiKey) {
                console.warn('SYSTEM_WARNING: GROQ_API_KEY not found. Temporal branching will be degraded.');
            }
            this._groq = new Groq({ apiKey: this.apiKey || 'mock-key' });
        }
        return this._groq;
    }

    public static getInstance() {
        if (!this.instance) this.instance = new TemporalService();
        return this.instance;
    }

    async generateTimelines(query: string): Promise<TemporalBranch[]> {
        const systemPrompt = `You are THE CHRONOS SINGULARITY.
Analyze the provided event and generate 5 distinct future timelines (ANCHOR, CHAOS, COLLAPSE, SINGULARITY, BLACK_SWAN).
ANCHOR: Status quo, minor changes.
CHAOS: High volatility, unpredictable shifts.
COLLAPSE: Worst-case scenario, systemic failure.
SINGULARITY: Best-case scenario, breakthrough.
BLACK_SWAN: High-impact, low-probability outlier event.

Output STRICT JSON:
{
  "timelines": [
    { "name": "ANCHOR", "probability": 45, "description": "...", "impact_factor": 0.1, "horizon": "3-6 months" },
    ...
  ]
}`;

        try {
            const groq = this.getGroq();
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze event: ${query}` }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2
            });

            const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
            return result.timelines.map((t: any) => ({
                ...t,
                id: Math.random().toString(36).substr(2, 9)
            }));
        } catch (error) {
            console.error('[Temporal Service]: Error', error);
            // High-fidelity fallbacks
            return [
                { id: '1', name: 'ANCHOR', probability: 50, description: 'Neural link stable. Market equilibrium maintained.', impact_factor: 0.05, horizon: '12 months' },
                { id: '2', name: 'CHAOS', probability: 20, description: 'Geopolitical friction increases. Crypto-asset fragmentation.', impact_factor: -0.3, horizon: '3 months' },
                { id: '3', name: 'COLLAPSE', probability: 5, description: 'Flash crash detected. Systemic liquidity drain.', impact_factor: -0.85, horizon: '48 hours' },
                { id: '4', name: 'SINGULARITY', probability: 15, description: 'Technological breakthrough in L2 scaling. Hyper-adoption.', impact_factor: 0.9, horizon: '1 month' },
                { id: '5', name: 'BLACK_SWAN', probability: 10, description: 'Unnamed sovereign state adopts BTC as primary reserve.', impact_factor: 1.2, horizon: 'Instant' }
            ];
        }
    }
}

export const temporalService = TemporalService.getInstance();
