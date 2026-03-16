import { NextRequest, NextResponse } from 'next/server';
import { getSerperService } from '@/lib/services/serper-service';
import { socialVerifier } from '@/lib/services/social-verifier';

export async function GET() {
    try {
        const serper = getSerperService();

        // 1. Fetch real trending crypto/geopolitical news
        const news = await serper.fetchCryptoIntel('bitcoin geopolitical impact finance');

        // 2. Verify top news items through AI Truth Engine
        const verifiedIntel = await Promise.all(
            news.slice(0, 5).map(async (item) => {
                const verification = await socialVerifier.verifySocialSignal(item.title + " " + item.summary, item.source);
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    source: item.source,
                    author: 'Official_Feed',
                    content: item.title,
                    summary: verification.verified_summary,
                    trustScore: verification.trust_score,
                    category: verification.category,
                    status: verification.status,
                    timestamp: item.publishedAt
                };
            })
        );

        return NextResponse.json({ intel: verifiedIntel });

    } catch (error: any) {
        console.error('[Social Nexus API Error]:', error);
        return NextResponse.json({ error: 'Truth Engine Offline' }, { status: 500 });
    }
}
