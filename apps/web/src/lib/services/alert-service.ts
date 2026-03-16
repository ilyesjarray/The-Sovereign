import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface PriceAlert {
    id: string;
    user_id: string;
    symbol: string;
    target_price: number;
    condition: 'ABOVE' | 'BELOW';
    is_active: boolean;
    created_at: string;
}

export class AlertService {
    private static instance: AlertService;
    private supabase = createClient();
    private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

    public static getInstance() {
        if (!this.instance) this.instance = new AlertService();
        return this.instance;
    }

    async getAlerts(userId: string): Promise<PriceAlert[]> {
        try {
            const { data, error } = await this.supabase
                .from('price_alerts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('[Alerts]: Failed to fetch alerts', error);
            return [];
        }
    }

    async createAlert(alert: Omit<PriceAlert, 'id' | 'created_at'>): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('price_alerts')
                .insert(alert);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Alerts]: Failed to create alert', error);
            return false;
        }
    }

    async deleteAlert(id: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('price_alerts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Alerts]: Failed to delete alert', error);
            return false;
        }
    }

    async toggleAlert(id: string, isActive: boolean): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('price_alerts')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[Alerts]: Failed to toggle alert', error);
            return false;
        }
    }

    checkAlert(alert: PriceAlert, currentPrice: number): boolean {
        if (!alert.is_active) return false;

        if (alert.condition === 'ABOVE' && currentPrice >= alert.target_price) {
            this.triggerAlert(alert, currentPrice);
            return true;
        }

        if (alert.condition === 'BELOW' && currentPrice <= alert.target_price) {
            this.triggerAlert(alert, currentPrice);
            return true;
        }

        return false;
    }

    private triggerAlert(alert: PriceAlert, currentPrice: number) {
        toast.success(`PRICE ALERT: ${alert.symbol}`, {
            description: `${alert.symbol} reached $${currentPrice.toLocaleString()} (Target: $${alert.target_price.toLocaleString()})`,
            duration: 10000
        });

        // Auto-disable alert after trigger
        this.toggleAlert(alert.id, false);
    }
}
