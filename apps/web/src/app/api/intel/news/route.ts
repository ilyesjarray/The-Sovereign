import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'NEWS_API_KEY not found in environment' }, { status: 500 });
        }

        // Fetch top general and business headlines related to global tech/markets
        const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=10&apiKey=${apiKey}`;

        const response = await fetch(url, {
            // Revalidate every 5 minutes to avoid hitting rate limits too hard while staying fresh
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error(`NewsAPI responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Transform articles into our ScoutReport format
        const formattedReports = data.articles.map((article: any, index: number) => {
            // Determine "intel level" based on keywords
            let intelLevel = 'INFO';
            const text = (article.title + ' ' + (article.description || '')).toLowerCase();
            if (text.includes('crash') || text.includes('crisis') || text.includes('hack') || text.includes('war')) {
                intelLevel = 'CRITICAL';
            } else if (text.includes('surge') || text.includes('breakthrough') || text.includes('alert') || text.includes('ban')) {
                intelLevel = 'WARNING';
            }

            return {
                id: `news_${Date.now()}_${index}`,
                scout_type: 'NEWS',
                content: `[${article.source.name}] ${article.title} - ${article.description || 'No detailed description available.'}`,
                intel_level: intelLevel,
                created_at: article.publishedAt,
                is_read: false,
                url: article.url
            };
        }).filter((r: any) => r.content.length > 20); // filter out empty/bad articles

        return NextResponse.json({ reports: formattedReports });

    } catch (error) {
        console.error('[NewsAPI Error]:', error);
        return NextResponse.json({ error: 'Failed to fetch global news' }, { status: 500 });
    }
}
