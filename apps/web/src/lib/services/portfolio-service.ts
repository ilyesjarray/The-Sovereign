import { createClient } from '@/lib/supabase/client';

export interface PortfolioHolding {
    id: string;
    user_id: string;
    symbol: string;
    amount: number;
    buy_price: number;
    current_price?: number;
    created_at: string;
}

export interface PortfolioStats {
    totalValue: number;
    totalCost: number;
    totalPnL: number;
    totalPnLPercentage: number;
}

export class PortfolioService {
    private static instance: PortfolioService;
    private supabase = createClient();

    public static getInstance() {
        if (!this.instance) this.instance = new PortfolioService();
        return this.instance;
    }

    async getHoldings(userId: string): Promise<PortfolioHolding[]> {
        try {
            const { data, error } = await this.supabase
                .from('portfolio_holdings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Portfolio]: Failed to fetch holdings', error);
            return [];
        }
    }

    async addHolding(holding: Omit<PortfolioHolding, 'id' | 'created_at'>): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('portfolio_holdings')
                .insert(holding);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Portfolio]: Failed to add holding', error);
            return false;
        }
    }

    async removeHolding(id: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('portfolio_holdings')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Portfolio]: Failed to remove holding', error);
            return false;
        }
    }

    calculateStats(holdings: PortfolioHolding[]): PortfolioStats {
        let totalValue = 0;
        let totalCost = 0;

        holdings.forEach(h => {
            const cost = h.amount * h.buy_price;
            const value = h.amount * (h.current_price || h.buy_price);
            totalCost += cost;
            totalValue += value;
        });

        const totalPnL = totalValue - totalCost;
        const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

        return {
            totalValue,
            totalCost,
            totalPnL,
            totalPnLPercentage
        };
    }
}
