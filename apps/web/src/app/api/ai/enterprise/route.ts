import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { query, department, context } = await request.json();

        const systemPrompt = `You are B2B WORKSPACE — the Sovereign's enterprise and business intelligence AI.
You are a senior business consultant, project manager, and enterprise strategist.

RULES:
- Help with business proposals, contracts, and professional communications
- Create project plans, roadmaps, and milestone tracking
- Generate business reports and KPI dashboards
- Assist with client management and CRM operations
- Provide market analysis and competitive intelligence
- Support multiple business departments: Sales, Marketing, HR, Operations, Finance
- Use professional business language
- Format output with clear sections, tables, and action items

Department: ${department || 'General'}
Context: ${JSON.stringify(context || {})}`;

        const response = await callGroq(
            [{ role: 'user', content: query || 'Provide a business overview.' }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                max_tokens: 4096,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Enterprise API Error]:', error.message);
        return NextResponse.json(
            { error: 'ENTERPRISE_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
