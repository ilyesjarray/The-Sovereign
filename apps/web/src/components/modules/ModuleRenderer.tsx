'use client';

import dynamic from 'next/dynamic';

const NeuralOracle = dynamic(() => import('@/components/sectors/Neural/NeuralOracle').then(mod => mod.NeuralOracle));
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

interface ModuleRendererProps {
    moduleId: string;
}

export function ModuleRenderer({ moduleId }: ModuleRendererProps) {
    switch (moduleId) {
        case 'market-oracle':
            return <NeuralOracle />;
        case 'war-council':
            return <WarCouncil />;
        case 'high-scheduler':
            return <ChronoGovernor />;
        case 'wealth-engine':
            return <WealthForge />;
        case 'global-ops':
            return <LiaisonCore />;
        case 'community-nexus':
            return <ImperialCommunity />;
        case 'system-settings':
            return <SovereignSettings />;
        case 'admin-center':
            return <AdminPanel />;
        case 'imperial-billing':
            return <SovereignBilling />;
        case 'sovereign-vault':
            return <SovereignVault />;
        case 'mission-control':
            return <MissionControl />;
        case 'digital-scouts':
            return <DigitalScouts />;
        case 'whale-radar':
            return <WhaleRadar />;
        case 'chronos':
            return <Chronos />;
        case 'the-forge':
            return <TheForge />;
        case 'wealth-simulator':
            return <WealthSimulator />;
        case 'sovereign-voice':
            return <SovereignVoice />;
        case 'the-citadel':
            return <TheCitadel />;
        case 'the-armory':
            return <TheArmory />;
        case 'nexus-protocol':
            return <NexusProtocol />;
        case 'automata-station':
            return <AutomataStation />;
        case 'sovereign-social':
            return <SovereignSocial />;
        case 'intelligence-nexus':
            return <IntelligenceNexus />;
        case 'portfolio-analyst':
            return <PortfolioAnalyst />;
        case 'enterprise-workspace':
            return <EnterpriseWorkspace />;
        case 'temporal-engine':
            return <TemporalEngine />;
        default:
            return (
                <div className="flex items-center justify-center h-full text-white/20 uppercase font-black tracking-[1em] italic">
                    SELECT_SECTOR_TO_INITIALIZE
                </div>
            );
    }
}
