import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { holdings, question, analysisType } = await request.json();

        const systemPrompt = `You are PORTFOLIO INTELLIGENCE — the Sovereign's AI-powered portfolio analysis engine.
You are a senior portfolio manager and financial analyst with expertise in asset allocation, risk management, and market analysis.

RULES:
- Analyze portfolio composition and diversification
- Identify concentration risks
- Calculate portfolio metrics (allocation %, correlation, beta)
- Provide rebalancing recommendations
- Compare against benchmark indices
- Suggest optimal allocation based on risk tolerance
- Use precise numbers and percentages
- Format with clear sections and bullet points

Holdings: ${JSON.stringify(holdings || [])}
Analysis Type: ${analysisType || 'comprehensive'}`;

        const userMessage = question || 'Provide a comprehensive portfolio analysis with allocation breakdown, risk assessment, diversification score, and rebalancing recommendations.';

        const response = await callGroq(
            [{ role: 'user', content: userMessage }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 4096,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Portfolio API Error]:', error.message);
        return NextResponse.json(
            { error: 'PORTFOLIO_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
