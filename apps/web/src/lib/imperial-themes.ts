import {
    Shield, Globe, Brain, Heart, Landmark,
    Gavel, Ghost, Ship, Coins, Castle,
    GraduationCap, Hammer, Telescope, Sprout,
    Users, LucideIcon
} from 'lucide-react';

export interface SectorTheme {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    secondaryColor: string;
    atmosphere: 'cyber' | 'organic' | 'industrial' | 'void' | 'royal';
    accentGlow: string;
}

export const SECTOR_THEMES: Record<string, SectorTheme> = {
    vault: {
        id: 'vault',
        name: 'The Vault',
        icon: Shield,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'cyber',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    command: {
        id: 'command',
        name: 'Global Command',
        icon: Globe,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'void',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    nexus: {
        id: 'nexus',
        name: 'Neural Nexus',
        icon: Brain,
        color: '#0074D9',
        secondaryColor: '#3DA663',
        atmosphere: 'cyber',
        accentGlow: 'rgba(80, 200, 120, 0.2)'
    },
    bio: {
        id: 'bio',
        name: 'Bio-Sentinel',
        icon: Heart,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'organic',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    projects: {
        id: 'projects',
        name: 'Imperial Projects',
        icon: Landmark,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'royal',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    council: {
        id: 'council',
        name: 'High Council',
        icon: Gavel,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'royal',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    shadow: {
        id: 'shadow',
        name: 'Shadow Sentinel',
        icon: Ghost,
        color: '#E05252',
        secondaryColor: '#B91C1C',
        atmosphere: 'void',
        accentGlow: 'rgba(224, 82, 82, 0.2)'
    },
    fleet: {
        id: 'fleet',
        name: 'The Fleet',
        icon: Ship,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'industrial',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    mint: {
        id: 'mint',
        name: 'The Mint',
        icon: Coins,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'royal',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    citadel: {
        id: 'citadel',
        name: 'The Citadel',
        icon: Castle,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'industrial',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    academy: {
        id: 'academy',
        name: 'The Academy',
        icon: GraduationCap,
        color: '#0074D9',
        secondaryColor: '#3DA663',
        atmosphere: 'royal',
        accentGlow: 'rgba(80, 200, 120, 0.2)'
    },
    forge: {
        id: 'forge',
        name: 'The Forge',
        icon: Hammer,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'industrial',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    },
    observatory: {
        id: 'observatory',
        name: 'The Observatory',
        icon: Telescope,
        color: '#0074D9',
        secondaryColor: '#3DA663',
        atmosphere: 'void',
        accentGlow: 'rgba(80, 200, 120, 0.2)'
    },
    greenhouse: {
        id: 'greenhouse',
        name: 'The Greenhouse',
        icon: Sprout,
        color: '#0074D9',
        secondaryColor: '#3DA663',
        atmosphere: 'organic',
        accentGlow: 'rgba(80, 200, 120, 0.2)'
    },
    agora: {
        id: 'agora',
        name: 'The Agora',
        icon: Users,
        color: '#00F3FF',
        secondaryColor: '#A68245',
        atmosphere: 'organic',
        accentGlow: 'rgba(212, 175, 55, 0.2)'
    }
};
