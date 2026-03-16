'use client';

export type AlertLevel = 1 | 2 | 3 | 4 | 5;

export interface SovereignAlert {
    id: string;
    type: 'BLACK_SWAN' | 'DAWN_BRIEFING' | 'EXECUTION_REPORT' | 'SURVEILLANCE_INTERCEPT';
    level: AlertLevel;
    title: string;
    description: string;
    impactAnalysis: string;
    timestamp: number;
    maskedTitle: string; // For lock-screen privacy
}

class NotificationEngine {
    private static instance: NotificationEngine;

    private constructor() { }

    public static getInstance() {
        if (!NotificationEngine.instance) {
            NotificationEngine.instance = new NotificationEngine();
        }
        return NotificationEngine.instance;
    }

    public async dispatch(alert: Omit<SovereignAlert, 'id' | 'timestamp'>) {
        const fullAlert: SovereignAlert = {
            ...alert,
            id: `ALRT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: Date.now(),
        };

        // 1. Simulate Audio Cue (Military Radar Ping)
        this.playAudioCue(fullAlert.level);

        // 2. Intelligence Impact Log
        console.log(`[Intelligence_Center] DISPATCH_LVL_${fullAlert.level}: ${fullAlert.title}`);
        console.log(`[Impact_Analysis]: ${fullAlert.impactAnalysis}`);

        // 3. Return for UI consumption
        return fullAlert;
    }

    private playAudioCue(level: AlertLevel) {
        // Mock audio trigger - in real implementation, this would trigger a high-frequency synth ping
        const frequencies = { 1: 440, 2: 880, 3: 1320, 4: 1760, 5: 2200 };
        console.log(`[SovereignAudio] PLAY_PULSE_FREQ_${frequencies[level]}Hz_DUR_200ms`);
    }

    public generateDawnBriefing(): Omit<SovereignAlert, 'id' | 'timestamp'> {
        return {
            type: 'DAWN_BRIEFING',
            level: 2,
            title: 'DAWN_INTELLIGENCE_REPORT',
            maskedTitle: 'SYSTEM_ROUTINE_UPDATE',
            description: 'Global markets opened with 0.4% volatility. Oil prices remain stable.',
            impactAnalysis: 'Liquidity levels are optimal for Sector 7 expansions. No immediate defensive action required.',
        };
    }

    public generateBlackSwanAlert(event: string): Omit<SovereignAlert, 'id' | 'timestamp'> {
        return {
            type: 'BLACK_SWAN',
            level: 5,
            title: `BLACK_SWAN_DETECTED: ${event.toUpperCase()}`,
            maskedTitle: 'SYSTEM_CRITICAL_WARNING',
            description: `Sudden market collapse detected in ${event}. Automatic protection protocols armed.`,
            impactAnalysis: 'Estimated wealth volatility: -2.4%. Recommendation: Initialize Ghost Vault blackout and halt automated trades.',
        };
    }
}

export const sovereignNotifications = NotificationEngine.getInstance();
