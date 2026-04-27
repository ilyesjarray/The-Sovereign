import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { prompt, language, type } = await request.json();

        const systemPrompt = `You are GENESIS ENGINE — the Sovereign's AI-powered code generation and automation core.
You are a world-class software engineer and automation architect.

RULES:
- Generate clean, production-ready code
- Always explain what the code does
- Support any programming language requested
- For automation tasks, provide step-by-step workflows
- Format output with markdown code blocks
- Be direct, precise, and comprehensive

Type: ${type || 'code_generation'}
Language: ${language || 'auto-detect'}`;

        const response = await callGroq(
            [{ role: 'user', content: prompt }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.3,
                max_tokens: 8192,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Forge API Error]:', error.message);
        return NextResponse.json(
            { error: 'FORGE_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
