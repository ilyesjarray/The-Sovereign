'use client';

import { Suspense } from 'react';

import dynamic from 'next/dynamic';

const NeuralOracle = dynamic(() => import('@/components/sectors/Neural/NeuralOracle').then(mod => mod.NeuralOracle));
const VisionScout = dynamic(() => import('@/components/sectors/Neural/VisionScout').then(mod => mod.VisionScout));
const WarCouncil = dynamic(() => import('@/components/sectors/Neural/WarCouncil').then(mod => mod.WarCouncil));
const ChronoGovernor = dynamic(() => import('@/components/sectors/Temporal/ChronoGovernor').then(mod => mod.ChronoGovernor));
const WealthForge = dynamic(() => import('@/components/sectors/Wealth/WealthForge').then(mod => mod.WealthForge));
const LiaisonCore = dynamic(() => import('@/components/sectors/Ops/LiaisonCore').then(mod => mod.LiaisonCore));
const ImperialCommunity = dynamic(() => import('@/components/sectors/Community/ImperialCommunity').then(mod => mod.ImperialCommunity));
const SovereignSettings = dynamic(() => import('@/components/sectors/Settings/SovereignSettings').then(mod => mod.SovereignSettings));
const AdminPanel = dynamic(() => import('@/components/sectors/Admin/AdminPanel').then(mod => mod.AdminPanel));
const SovereignBilling = dynamic(() => import('@/components/sectors/Wealth/SovereignBilling').then(mod => mod.SovereignBilling));
const SovereignVault = dynamic(() => import('@/components/sectors/Security/SovereignVault').then(mod => mod.SovereignVault));
const MissionControl = dynamic(() => import('@/components/sectors/Ops/MissionControl').then(mod => mod.MissionControl));
const DigitalScouts = dynamic(() => import('@/components/sectors/Intelligence/DigitalScouts').then(mod => mod.DigitalScouts));
const WhaleRadar = dynamic(() => import('@/components/sectors/Intelligence/WhaleRadar').then(mod => mod.WhaleRadar));
const Chronos = dynamic(() => import('@/components/sectors/Intelligence/Chronos').then(mod => mod.Chronos));
const TheForge = dynamic(() => import('@/components/sectors/Forge/TheForge').then(mod => mod.TheForge));
const WealthSimulator = dynamic(() => import('@/components/sectors/Wealth/WealthSimulator').then(mod => mod.WealthSimulator));
const TheArmory = dynamic(() => import('@/components/sectors/Wealth/TheArmory').then(mod => mod.TheArmory));
const SovereignVoice = dynamic(() => import('@/components/sectors/Security/SovereignVoice').then(mod => mod.SovereignVoice));
const TheCitadel = dynamic(() => import('@/components/sectors/Security/TheCitadel').then(mod => mod.TheCitadel));
const NexusProtocol = dynamic(() => import('@/components/sectors/Security/NexusProtocol').then(mod => mod.NexusProtocol));
const AutomataStation = dynamic(() => import('@/components/sectors/Automata/AutomataStation').then(mod => mod.AutomataStation));
const SovereignSocial = dynamic(() => import('@/components/sectors/Social/SovereignSocial'));
const IntelligenceNexus = dynamic(() => import('@/components/sectors/Social/IntelligenceNexus'));
const PortfolioAnalyst = dynamic(() => import('@/components/sectors/Wealth/PortfolioAnalyst'));
const EnterpriseWorkspace = dynamic(() => import('@/components/sectors/Ops/EnterpriseWorkspace'));
const TemporalEngine = dynamic(() => import('@/components/sectors/Intelligence/TemporalEngine'));

import { ComingSoon } from './ComingSoon';

interface ModuleRendererProps {
    moduleId: string;
}

export function ModuleRenderer({ moduleId }: ModuleRendererProps) {
    switch (moduleId) {
        case 'market-oracle':
            return <NeuralOracle />;
        case 'sovereign-social':
            return <SovereignSocial />;
        case 'sovereign-vault':
            return <SovereignVault />;
        
        // Sectors Under Construction
        case 'war-council':
            return <ComingSoon sectorName="Stratagem_Council" />;
        case 'high-scheduler':
            return <ComingSoon sectorName="Chrono_Governor" />;
        case 'wealth-engine':
            return <ComingSoon sectorName="Asset_Forge" />;
        case 'global-ops':
            return <ComingSoon sectorName="Liaison_Core" />;
        case 'vision-scout':
            return (
                <Suspense fallback={<ModuleLoader />}>
                    <VisionScout />
                </Suspense>
            );
        case 'community-nexus':
            return <ComingSoon sectorName="Imperial_Community" />;
        case 'system-settings':
            return <ComingSoon sectorName="Sovereign_Settings" />;
        case 'admin-center':
            return <ComingSoon sectorName="Throne_Room" />;
        case 'imperial-billing':
            return <ComingSoon sectorName="Imperial_Billing" />;
        case 'mission-control':
            return <ComingSoon sectorName="Field_Command" />;
        case 'digital-scouts':
            return <ComingSoon sectorName="Shadow_Watch" />;
        case 'whale-radar':
            return <ComingSoon sectorName="Deep_Sea_Radar" />;
        case 'chronos':
            return <ComingSoon sectorName="Legacy_Temporal" />;
        case 'the-forge':
            return <ComingSoon sectorName="Genesis_Engine" />;
        case 'wealth-simulator':
            return <ComingSoon sectorName="Fleet_Stress_Test" />;
        case 'sovereign-voice':
            return <ComingSoon sectorName="Voice_Core" />;
        case 'the-citadel':
            return <ComingSoon sectorName="The_Imperial_Bastion" />;
        case 'the-armory':
            return <ComingSoon sectorName="Sovereign_Treasury" />;
        case 'nexus-protocol':
            return <ComingSoon sectorName="Nexus_Uplink" />;
        case 'automata-station':
            return <ComingSoon sectorName="Automata_Grid" />;
        case 'intelligence-nexus':
            return <ComingSoon sectorName="Intelligence_Nexus" />;
        case 'portfolio-analyst':
            return <ComingSoon sectorName="Portfolio_Intelligence" />;
        case 'enterprise-workspace':
            return <ComingSoon sectorName="B2B_Workspace" />;
        case 'temporal-engine':
            return <ComingSoon sectorName="Chronos_Singularity" />;
        default:
            return (
                <div className="flex items-center justify-center h-full text-white/20 uppercase font-black tracking-[1em] italic">
                    SELECT_SECTOR_TO_INITIALIZE
                </div>
            );
    }
}
