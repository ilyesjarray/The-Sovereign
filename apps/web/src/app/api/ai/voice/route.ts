import { NextRequest, NextResponse } from 'next/server';
import { callWhisper } from '@/lib/ai/groq-pool';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided.' },
                { status: 400 }
            );
        }

        const transcription = await callWhisper(audioFile, 'whisper-large-v3-turbo');

        return NextResponse.json({ transcription });
    } catch (error: any) {
        console.error('[Voice API Error]:', error.message);
        return NextResponse.json(
            { error: 'VOICE_ENGINE_ERROR', details: error.message },
            { status: 500 }
        );
    }
}
