import { OpenAI } from 'openai';

// This would typically be an edge function or server-side only
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    dangerouslyAllowBrowser: true // For demo purposes only
});

export type MarketData = {
    asset: string;
    price: number;
    change24h: number;
    volume: number;
};

export type UserProfile = {
    rank: 'Novice' | 'Sovereign' | 'Empire';
    riskTolerance: 'Low' | 'Medium' | 'High';
};

export async function getCommanderStrategy(
    marketData: MarketData[],
    userProfile: UserProfile
) {
    const prompt = `
    Act as a high-frequency trading algorithm and strategic advisor.
    User Rank: ${userProfile.rank}
    User Risk Tolerance: ${userProfile.riskTolerance}
    
    Current Market Data:
    ${JSON.stringify(marketData.slice(0, 10))}
    
    Analyze the market and provide a singular, high-conviction trade setup.
    Format your response as a JSON object with fields: "asset", "action" (BUY/SELL), "entryPrice", "targetPrice", "stopLoss", "rationale".
  `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: prompt }],
            response_format: { type: 'json_object' },
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
        console.warn("AI Service Unavailable (likely missing key), returning mock.");
        return {
            asset: "BTC/USDT",
            action: "BUY",
            entryPrice: 42000,
            targetPrice: 45000,
            stopLoss: 40000,
            rationale: "Mock Rationale: Strong support at 40k, AI signal simulation."
        };
    }
}
