'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Sector = 'hub' | 'intel' | 'vault' | 'ops' | 'bios' | 'council' | 'system' | 'neural' | 'chronos' | 'nexus';

interface ThemeConfig {
    accent: string;
    glow: string;
    bg: string;
    label: string;
}

const sectorThemes: Record<Sector, ThemeConfig> = {
    hub: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'SOVEREIGN_COMMAND'
    },
    intel: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'INTELLIGENCE_CENTER'
    },
    vault: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'ASSET_VAULT_DECRYPTED'
    },
    ops: {
        accent: '#0074D9',
        glow: 'rgba(80, 200, 120, 0.2)',
        bg: '#000000',
        label: 'OPERATIONAL_CONTROL'
    },
    bios: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'ELITE_BIOS_DECRYPT'
    },
    council: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'HIGH_COUNCIL'
    },
    system: {
        accent: '#0074D9',
        glow: 'rgba(80, 200, 120, 0.2)',
        bg: '#000000',
        label: 'SYSTEM_CENTER'
    },
    neural: {
        accent: '#0074D9',
        glow: 'rgba(80, 200, 120, 0.2)',
        bg: '#000000',
        label: 'NEURAL_NEXUS'
    },
    chronos: {
        accent: '#00F3FF',
        glow: 'rgba(212, 175, 55, 0.2)',
        bg: '#000000',
        label: 'CHRONOS_COMMAND'
    },
    nexus: {
        accent: '#0074D9',
        glow: 'rgba(80, 200, 120, 0.2)',
        bg: '#000000',
        label: 'POWER_NEXUS'
    }
};

interface SovereignThemeContextType {
    sector: Sector;
    setSector: (sector: Sector) => void;
    theme: ThemeConfig;
}

const SovereignThemeContext = createContext<SovereignThemeContextType | undefined>(undefined);

export function SovereignThemeProvider({ children }: { children: React.ReactNode }) {
    const [sector, setSector] = useState<Sector>('hub');
    const [theme, setTheme] = useState<ThemeConfig>(sectorThemes.hub);

    useEffect(() => {
        setTheme(sectorThemes[sector]);

        // Update CSS Variables for global styling
        const root = document.documentElement;
        root.style.setProperty('--sovereign-accent', sectorThemes[sector].accent);
        root.style.setProperty('--sovereign-glow', sectorThemes[sector].glow);
    }, [sector]);

    return (
        <SovereignThemeContext.Provider value={{ sector, setSector, theme }}>
            {children}
        </SovereignThemeContext.Provider>
    );
}

export const useSovereignTheme = () => {
    const context = useContext(SovereignThemeContext);
    if (!context) throw new Error('useSovereignTheme must be used within SovereignThemeProvider');
    return context;
};
