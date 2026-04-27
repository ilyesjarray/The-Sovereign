import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { tasks, schedule, preferences } = await request.json();

        const systemPrompt = `You are CHRONOS SINGULARITY — the Sovereign's temporal optimization AI.
You are an expert in time management, scheduling, and productivity optimization.

RULES:
- Analyze tasks and create optimized schedules
- Consider energy levels, priorities, and deadlines
- Provide time-blocking strategies
- Suggest automation opportunities for recurring tasks
- Use military-style precision in time allocation
- Format output clearly with timestamps and priorities
- Always calculate total allocated vs free time

Input data:
Tasks: ${JSON.stringify(tasks || [])}
Current Schedule: ${JSON.stringify(schedule || {})}
Preferences: ${JSON.stringify(preferences || {})}`;

        const response = await callGroq(
            [{ role: 'user', content: `Optimize my schedule and tasks. Provide a structured daily plan with time blocks, priorities, and efficiency recommendations.` }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.4,
                max_tokens: 4096,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Temporal API Error]:', error.message);
        return NextResponse.json(
            { error: 'TEMPORAL_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
