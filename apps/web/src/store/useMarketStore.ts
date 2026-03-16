'use client';

import { create } from 'zustand';

export interface MarketAsset {
  symbol: string;
  price: number;
  change24h: number;
  lastUpdate: number;
}

export interface ArbitrageOpportunity {
  id: string;
  pair: [string, string];
  spread: number;
  netProfit: number;
  confidence: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface MarketState {
  prices: Record<string, MarketAsset>;
  opportunities: ArbitrageOpportunity[];
  isConnected: boolean;
  
  // Actions
  updatePrice: (symbol: string, price: number, change24h?: number) => void;
  setOpportunities: (opportunities: ArbitrageOpportunity[]) => void;
  setConnectionStatus: (status: boolean) => void;
  getPrice: (symbol: string) => number | undefined;
}

export const useMarketStore = create<MarketState>()((set: any, get: any) => ({
  prices: {},
  opportunities: [],
  isConnected: false,

  updatePrice: (symbol: string, price: number, change24h?: number) => {
    set((state: any) => ({
      prices: {
        ...state.prices,
        [symbol]: {
          symbol,
          price,
          change24h: change24h ?? state.prices[symbol]?.change24h ?? 0,
          lastUpdate: Date.now(),
        },
      },
    }));
  },

  setOpportunities: (opportunities: ArbitrageOpportunity[]) => set({ opportunities }),
  
  setConnectionStatus: (status: boolean) => set({ isConnected: status }),

  getPrice: (symbol: string) => get().prices[symbol]?.price,
}));
