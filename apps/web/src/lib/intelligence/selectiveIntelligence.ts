
export interface IntelligenceItem {
    id: string;
    title: string;
    summary: string;
    impact: string;
    country: string;
    score: number;
    timestamp: string;
    category: 'FINANCE' | 'SECURITY' | 'GEOPOLITICS';
}

const HIGH_PRIORITY_KEYWORDS = ['EPSTEIN', 'MARKET CRASH', 'NUCLEAR', 'GLOBAL SANCTIONS', 'LIQUIDITY CRISIS'];

export function filterIntelligence(news: IntelligenceItem[], level: 'ALL_IMPORTANT' | 'SECURITY_THREAT'): IntelligenceItem[] {
    return news.filter(item => {
        // High priority keywords always trigger
        const hasKeyword = HIGH_PRIORITY_KEYWORDS.some(kw =>
            item.title.toUpperCase().includes(kw) ||
            item.summary.toUpperCase().includes(kw)
        );
        if (hasKeyword) return true;

        // Score filter
        if (item.score < 8) return false;

        // Level filter
        if (level === 'SECURITY_THREAT') {
            return item.category === 'SECURITY';
        }

        return true;
    });
}

// Mock intelligence data for immediate testing
export const mockIntelligence: IntelligenceItem[] = [
    {
        id: 'INT-001',
        title: 'Global Liquidity Flash Crash: Central Banks Convene',
        summary: 'A sudden withdrawal of liquidity in major fiat pairs has triggered emergency protocols at the Fed and ECB.',
        impact: 'EXTREME. Market volatility expected to increase by 300%. Protect capital buffers.',
        country: 'USA',
        score: 9.5,
        timestamp: new Date().toISOString(),
        category: 'FINANCE'
    },
    {
        id: 'INT-002',
        title: 'Cyber-Attack on Strategic Energy Grid in Eastern Europe',
        summary: 'Non-state actors have reportedly breached the firewall of three major power distribution centers.',
        impact: 'HIGH. Regional stability compromised. Energy futures likely to spike.',
        country: 'Ukraine',
        score: 8.8,
        timestamp: new Date().toISOString(),
        category: 'SECURITY'
    },
    {
        id: 'INT-003',
        title: 'Confidential Files Released: Intelligence Network Compromised',
        summary: 'A massive data leak has exposed high-level diplomatic cables involving several "Epstein" connections.',
        impact: 'CRITICAL. Political fallout expected in G7 nations. Trust indices plummeting.',
        country: 'United Kingdom',
        score: 9.2,
        timestamp: new Date().toISOString(),
        category: 'GEOPOLITICS'
    }
];
