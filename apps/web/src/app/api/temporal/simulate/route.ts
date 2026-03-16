import { NextRequest, NextResponse } from 'next/server';
import { temporalService } from '@/lib/services/temporal-service';

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required for simulation.' }, { status: 400 });
        }

        const results = await temporalService.generateTimelines(query);
        return NextResponse.json({ branches: results });

    } catch (error: any) {
        console.error('[Temporal API Error]:', error);
        return NextResponse.json({
            error: 'Temporal branch failed. Engine desync.',
            details: error.message
        }, { status: 500 });
    }
}
