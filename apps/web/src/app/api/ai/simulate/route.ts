import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { portfolio, scenario, parameters } = await request.json();

        const systemPrompt = `You are FLEET STRESS TEST — the Sovereign's wealth simulation engine.
You are a quantitative finance expert specializing in portfolio stress testing and scenario analysis.

RULES:
- Simulate portfolio performance under various market conditions
- Test scenarios: market crash (-30%), bull run (+50%), stagflation, black swan events
- Calculate potential losses and gains for each scenario
- Provide risk metrics: VaR, Sharpe ratio, max drawdown
- Recommend hedging strategies
- Use realistic market correlations
- Always provide numerical results with percentages

Portfolio: ${JSON.stringify(portfolio || [])}
Scenario: ${scenario || 'comprehensive_stress_test'}
Parameters: ${JSON.stringify(parameters || {})}`;

        const response = await callGroq(
            [{ role: 'user', content: `Run a comprehensive stress test on this portfolio. Provide scenario analysis with numerical results, risk metrics, and hedging recommendations.` }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 4096,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Simulate API Error]:', error.message);
        return NextResponse.json(
            { error: 'SIMULATION_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
