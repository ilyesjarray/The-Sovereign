import { NextResponse } from 'next/server';
import { neuralAI } from '@/lib/services/neural-ai-service';

export async function POST() {
    try {
        const debate = await neuralAI.generateWarCouncilDebate();
        return NextResponse.json(debate);
    } catch (error) {
        console.error('War Council API Error:', error);
        return NextResponse.json({ error: 'Failed to initiate council' }, { status: 500 });
    }
}
