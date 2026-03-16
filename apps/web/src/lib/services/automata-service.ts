'use client';

import { toast } from 'sonner';

export interface BotState {
    id: string;
    name: string;
    status: 'IDLE' | 'RUNNING' | 'HEDGING';
    lastAction: string;
    profit: number;
}

export class AutomataService {
    private static instance: AutomataService;

    public static getInstance() {
        if (!this.instance) this.instance = new AutomataService();
        return this.instance;
    }

    private bots: BotState[] = [
        { id: '1', name: 'PREDATOR_V1', status: 'RUNNING', lastAction: 'L/S SOL-PERP', profit: 12.4 },
        { id: '2', name: 'SENTINEL_BTC', status: 'IDLE', lastAction: 'SCANNING_LIQUIDITY', profit: 4.2 },
        { id: '3', name: 'GHOST_ARB', status: 'RUNNING', lastAction: 'DEX-CEX CROSS ARB', profit: 8.9 },
    ];

    async executeSmartHedge() {
        toast.info("SMART_HEDGE: Activating defensive protocols...", {
            description: "Neural engine detected imminent volatility spike."
        });
        // Simulate hedging logic
        await new Promise(r => setTimeout(r, 2000));
        toast.success("DEFENSE_ALIASED: Portfolio rebalanced to USDT/GOLD.");
    }

    getBots(): BotState[] {
        return this.bots;
    }

    startBot(id: string) {
        const bot = this.bots.find(b => b.id === id);
        if (bot) {
            bot.status = 'RUNNING';
            bot.lastAction = 'INITIALIZING_NEURAL_UPLINK';
            toast.success(`${bot.name}: PROTOCOL_INITIALIZED`);
        }
    }

    stopBot(id: string) {
        const bot = this.bots.find(b => b.id === id);
        if (bot) {
            bot.status = 'IDLE';
            bot.lastAction = 'PROTOCOL_TERMINATED';
            toast.error(`${bot.name}: STANDBY_MODE`);
        }
    }
}
