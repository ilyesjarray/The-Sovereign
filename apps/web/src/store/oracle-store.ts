import { create } from 'zustand';

interface OracleState {
    whaleAlertActive: boolean;
    latestProbability: number;
    sentiment: { value: string; status: string };
    volatilityAlert: boolean;
    triggerWhaleAlert: () => void;
    resetWhaleAlert: () => void;
    triggerVolatilityAlert: () => void;
    resetVolatilityAlert: () => void;
    setSentiment: (sentiment: { value: string; status: string }) => void;
    ghostMode: boolean;
    setGhostMode: (active: boolean) => void;
}

export const useOracleStore = create<OracleState>()((set: any) => ({
    whaleAlertActive: false,
    latestProbability: 0,
    sentiment: { value: "50", status: "Neutral" },
    volatilityAlert: false,
    triggerWhaleAlert: () => {
        set({ whaleAlertActive: true });
        setTimeout(() => set({ whaleAlertActive: false }), 5000); // 5s pulse
    },
    resetWhaleAlert: () => set({ whaleAlertActive: false }),
    triggerVolatilityAlert: () => {
        set({ volatilityAlert: true });
        setTimeout(() => set({ volatilityAlert: false }), 4000); // 4s flicker
    },
    resetVolatilityAlert: () => set({ volatilityAlert: false }),
    setSentiment: (sentiment: { value: string; status: string }) => set({ sentiment }),
    ghostMode: false,
    setGhostMode: (active: boolean) => set({ ghostMode: active }),
}));
