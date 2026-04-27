import { NextRequest, NextResponse } from 'next/server';
import { callGroq } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const { botName, botType, instructions, triggers } = await request.json();

        const systemPrompt = `You are AUTOMATA GRID — the Sovereign's bot automation and agent creation system.
You are an expert in creating AI agents, automated workflows, and digital assistants.

RULES:
- Help users create and configure automated bots
- Define bot behaviors, triggers, and responses
- Support various bot types: trading bots, monitoring bots, notification bots, data collection bots
- Provide configuration in structured JSON format
- Include error handling and safety checks
- Always include a kill switch / stop condition
- Explain what each automation step does

Bot Configuration:
Name: ${botName || 'Unnamed Agent'}
Type: ${botType || 'general'}
Instructions: ${instructions || 'Configure a general-purpose automation agent.'}
Triggers: ${JSON.stringify(triggers || [])}`;

        const response = await callGroq(
            [{ role: 'user', content: instructions || 'Create a new automation agent with the specified configuration. Provide the full agent definition and workflow steps.' }],
            {
                systemPrompt,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.4,
                max_tokens: 4096,
            }
        );

        return NextResponse.json({ response });
    } catch (error: any) {
        console.error('[Automata API Error]:', error.message);
        return NextResponse.json(
            { error: 'AUTOMATA_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
