'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, Globe, Bell, Shield, User, Users,
    Palette, Lock, Fingerprint, Eye, EyeOff,
    Languages, HardDrive, Smartphone, Zap,
    ChevronRight, Save, RotateCcw, Link, UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const SECTIONS = [
    { id: 'profile', label: 'IMPERIAL_PROFILE', icon: User },
    { id: 'syndicate', label: 'SYNDICATE_COMMAND', icon: Users },
    { id: 'subscriptions', label: 'IMPERIAL_TREASURY', icon: Zap },
    { id: 'security', label: 'GUARD_PROTOCOLS', icon: Shield },
    { id: 'display', label: 'HUD_VISUALS', icon: Palette },
    { id: 'notifications', label: 'SIGNAL_COMMS', icon: Bell },
    { id: 'language', label: 'LINGUA_CENTER', icon: Languages },
];

export function SovereignSettings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [notifications, setNotifications] = useState(true);
    const [biometrics, setBiometrics] = useState(true);
    const [language, setLanguage] = useState('en');

    // Profile State
    const [fullName, setFullName] = useState('Imperial_Commander');
    const [emailNode, setEmailNode] = useState('alpha@sovereign.os');
    const [rank, setRank] = useState('Elite_Tier_One');
    const [location, setLocation] = useState('Encrypted_Nexus');

    // Syndicate State
    const [inviteEmail, setInviteEmail] = useState('');
    const [syndicateMembers, setSyndicateMembers] = useState<{ id: string, email: string, role: string, status: string }[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase.from('user_settings').select('*').eq('id', session.user.id).single();
            if (data) {
                setFullName(data.full_name || 'Imperial_Commander');
                setEmailNode(data.email_node || session.user.email);
                setRank(data.rank || 'Elite_Tier_One');
                setLocation(data.location || 'Encrypted_Nexus');
                setLanguage(data.language || 'en');
                setNotifications(data.notifications ?? true);
                setBiometrics(data.biometrics ?? true);
            } else {
                setEmailNode(session.user.email || 'alpha@sovereign.os');
            }
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('user_settings').upsert({
                id: session.user.id,
                full_name: fullName,
                email_node: emailNode,
                rank: rank,
                location: location,
                language: language,
                biometrics: biometrics,
                notifications: notifications,
                updated_at: new Date().toISOString()
            });
        }
        setIsSaving(false);
    };

    const handleSubscribe = async (planId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, email: session?.user?.email })
            });
            const { url, error } = await res.json();
            if (error) throw new Error(error);
            if (url) window.location.href = url;
        } catch (e) {
            console.error('Subscription error:', e);
            alert('Payment initialization failed. Ensure Stripe keys are valid.');
        }
    };

    const handleInviteToSyndicate = () => {
        if (!inviteEmail) return;
        setSyndicateMembers(prev => [
            { id: `demo-${Date.now()}`, email: inviteEmail, role: 'OPERATIVE', status: 'PENDING' },
            ...prev
        ]);
        setInviteEmail('');
    };

    return (
        <div className="flex h-full bg-carbon-black overflow-hidden relative">
            {/* Settings Sidebar */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-white/[0.01]">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                        <Settings className="text-hyper-cyan animate-spin-slow" size={18} />
                        Core_Configuration
                    </h3>
                    <p className="text-[9px] text-white/20 uppercase font-bold tracking-[0.3em] mt-2">v-Series System Governance</p>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-300 border group",
                                activeSection === section.id
                                    ? "bg-hyper-cyan/10 border-hyper-cyan/30 text-white"
                                    : "bg-white/[0.01] border-transparent text-white/30 hover:bg-white/[0.03]"
                            )}
                        >
                            <section.icon size={18} className={cn(
                                "transition-colors",
                                activeSection === section.id ? "text-hyper-cyan shadow-neon-cyan" : "group-hover:text-hyper-cyan/50"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">{section.label}</span>
                            <ChevronRight size={14} className={cn("ml-auto transition-transform", activeSection === section.id ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0")} />
                        </button>
                    ))}
                </nav>

                <div className="p-8 space-y-4 border-t border-white/5 bg-white/[0.01]">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Storage_Used</span>
                        <span className="text-[8px] font-black text-hyper-cyan uppercase tracking-widest">1.2 GB / 50 GB</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '12%' }}
                            className="h-full bg-hyper-cyan shadow-neon-cyan"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* Header */}
                    <div>
                        <span className="text-[10px] text-hyper-cyan font-black tracking-[0.5em] uppercase italic">/system/kernel/config/</span>
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mt-2">{activeSection.replace('_', ' ')}</h2>
                    </div>

                    {/* Section Dynamic Content */}
                    <div className="space-y-10">
                        {activeSection === 'subscriptions' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="glass-v-series p-10 rounded-3xl border border-hyper-cyan/30 bg-hyper-cyan/[0.02]">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Zap className="text-hyper-cyan w-8 h-8" />
                                        <h3 className="text-2xl font-black text-white italic tracking-widest uppercase">Elite Commander Upgrade</h3>
                                    </div>
                                    <p className="text-xs text-white/50 mb-8 max-w-lg leading-relaxed font-bold uppercase tracking-widest">
                                        Unlock the full potential of The Sovereign OS. Gain access to the AI Auto-Broker, Syndicate Creation, and Zero-Knowledge Enterprise Vault.
                                    </p>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/10 hover:border-hyper-cyan/40 transition-colors flex flex-col">
                                            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Standard</div>
                                            <div className="text-3xl font-black text-white mb-6">$29<span className="text-sm text-white/30">/mo</span></div>
                                            <ul className="space-y-3 mb-8 flex-1 text-xs text-white/60 font-bold tracking-widest uppercase">
                                                <li>- 10GB Secure Vault</li>
                                                <li>- Personal AI Scheduler</li>
                                                <li>- Standard Community Chat</li>
                                            </ul>
                                            <button
                                                onClick={() => handleSubscribe('pro')}
                                                className="w-full py-4 border border-white/10 rounded-xl hover:bg-white/5 font-black text-[10px] uppercase tracking-widest text-white transition-colors"
                                            >
                                                Initialize_Protocol
                                            </button>
                                        </div>

                                        <div className="p-8 rounded-2xl bg-hyper-cyan/10 border border-hyper-cyan/40 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                                            <div className="absolute top-4 right-4 text-[8px] font-black bg-hyper-cyan text-carbon-black px-3 py-1 rounded-full uppercase tracking-widest">Recommended</div>
                                            <div className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.3em] mb-2">Elite Syndicate</div>
                                            <div className="text-3xl font-black text-white mb-6">$99<span className="text-sm text-white/30">/mo</span></div>
                                            <ul className="space-y-3 mb-8 flex-1 text-xs text-white/80 font-bold tracking-widest uppercase">
                                                <li className="text-hyper-cyan">- AI Auto-Broker (Trading Agent)</li>
                                                <li className="text-hyper-cyan">- B2B Syndicate Control (Up to 10 users)</li>
                                                <li>- 1TB Quantum-Secure Vault</li>
                                                <li>- Priority AI Node Routing</li>
                                            </ul>
                                            <button
                                                onClick={() => handleSubscribe('elite')}
                                                className="w-full py-4 bg-hyper-cyan hover:bg-white text-carbon-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-neon-cyan"
                                            >
                                                Ascend_To_Elite
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'syndicate' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="glass-v-series p-10 rounded-3xl border border-white/5 bg-white/[0.01]">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Users className="text-hyper-cyan w-8 h-8" />
                                        <h3 className="text-2xl font-black text-white italic tracking-widest uppercase">Syndicate Command Center</h3>
                                    </div>
                                    <p className="text-xs text-white/50 mb-8 max-w-lg leading-relaxed font-bold uppercase tracking-widest">
                                        Manage your B2B enterprise operations. Invite operatives, assign clearance levels, and monitor active sessions within your secure ecosystem.
                                    </p>

                                    {/* Invite Form */}
                                    <div className="flex gap-4 mb-10">
                                        <input
                                            type="email"
                                            placeholder="OPERATIVE_EMAIL_COORDINATES..."
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 text-xs font-mono text-white outline-none focus:border-hyper-cyan/50 placeholder:text-white/20 uppercase"
                                        />
                                        <button
                                            onClick={handleInviteToSyndicate}
                                            className="px-8 bg-hyper-cyan/10 hover:bg-hyper-cyan text-hyper-cyan hover:text-carbon-black border border-hyper-cyan/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            <UserPlus size={16} /> Deploy_Invite
                                        </button>
                                        <button className="px-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-white/50 hover:text-white flex items-center justify-center">
                                            <Link size={16} />
                                        </button>
                                    </div>

                                    {/* Members List */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-4">Active_Operatives</h4>
                                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-hyper-cyan/20 flex items-center justify-center font-black text-hyper-cyan border border-hyper-cyan">A</div>
                                                <div>
                                                    <span className="text-xs font-black text-white uppercase tracking-widest block">{emailNode}</span>
                                                    <span className="text-[9px] text-hyper-cyan uppercase font-mono mt-1 block">Syndicate_Commander (Owner)</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-md">ONLINE</span>
                                        </div>

                                        {syndicateMembers.map(member => (
                                            <div key={member.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-white/40 border border-white/10">{member.email.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <span className="text-xs font-black text-white uppercase tracking-widest block">{member.email}</span>
                                                        <span className="text-[9px] text-white/30 uppercase font-mono mt-1 block">Role: {member.role}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-md">{member.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center gap-8 p-10 glass-v-series rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-hyper-cyan/5 to-transparent pointer-events-none" />
                                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                        <User size={48} className="text-white/10 group-hover:text-hyper-cyan transition-colors" />
                                        <div className="absolute inset-0 bg-carbon-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Zap size={24} className="text-hyper-cyan" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-2xl font-black text-white italic">EXECUTIVE_NODE_07</div>
                                        <div className="text-[10px] text-hyper-cyan font-black tracking-widest mt-1 uppercase">Commander_Clearance_Active</div>
                                        <div className="flex gap-4 mt-4">
                                            <button className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest italic border-b border-white/10">Edit_ID</button>
                                            <button className="text-[9px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest italic border-b border-red-500/10">Re_Sync_DNA</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <SettingsField label="FULL_NAME" value={fullName} onChange={setFullName} />
                                    <SettingsField label="EMAIL_NODE" value={emailNode} onChange={setEmailNode} />
                                    <SettingsField label="RANK" value={rank} onChange={setRank} />
                                    <SettingsField label="LOCATION" value={location} onChange={setLocation} />
                                </div>
                            </div>
                        )}

                        {activeSection === 'language' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="glass-v-series p-8 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest italic leading-relaxed">
                                        Linguistic protocol is fixed to English for v-Series kernel operations.
                                    </p>
                                    <div className="grid grid-cols-1 gap-4 mt-8">
                                        {[
                                            { code: 'en', label: 'ENGLISH' },
                                        ].map(lang => (
                                            <button
                                                key={lang.code}
                                                className={cn(
                                                    "p-6 rounded-2xl border flex items-center justify-between group transition-all",
                                                    "bg-hyper-cyan/10 border-hyper-cyan/30 text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-black uppercase tracking-widest italic">{lang.label}</span>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-hyper-cyan shadow-neon-cyan animate-pulse" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-hyper-cyan/5 border border-hyper-cyan/10 rounded-2xl">
                                        <span className="text-[9px] text-hyper-cyan/60 font-black uppercase tracking-widest">Current Protocol: ENGLISH — System-wide enforcement active</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="space-y-4">
                                    <SecurityToggle
                                        label="BIOMETRIC_LOCK"
                                        desc="Enable node-locked fingerprint resonance"
                                        active={biometrics}
                                        onToggle={() => setBiometrics(!biometrics)}
                                        icon={Fingerprint}
                                    />
                                    <SecurityToggle
                                        label="QUANTUM_NOTIFICATIONS"
                                        desc="Real-time encrypted alert delivery"
                                        active={notifications}
                                        onToggle={() => setNotifications(!notifications)}
                                        icon={Zap}
                                    />
                                    <SecurityToggle
                                        label="STEALTH_MODE"
                                        desc="Hide activity from tracking nodes"
                                        active={false}
                                        onToggle={() => { }}
                                        icon={EyeOff}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-12 border-t border-white/5 flex justify-end gap-6">
                        <button
                            onClick={loadSettings}
                            className="flex items-center gap-3 px-8 py-4 text-white/30 hover:text-white transition-colors group"
                        >
                            <RotateCcw size={16} className="group-hover:-rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Restore_Kernel</span>
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="flex items-center gap-4 px-10 py-4 bg-hyper-cyan text-carbon-black font-black text-[10px] uppercase tracking-[0.4em] rounded-xl shadow-neon-cyan hover:scale-105 transition-all italic disabled:opacity-50"
                        >
                            <Save size={16} className={cn(isSaving && "animate-pulse")} />
                            {isSaving ? 'Committing...' : 'Commit_Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsField({ label, value, onChange }: { label: string, value: string, onChange?: (val: string) => void }) {
    return (
        <div className="space-y-3 group">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] ml-2">{label}</label>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 group-focus-within:border-hyper-cyan/40 transition-all">
                <input
                    value={value}
                    onChange={e => onChange?.(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-white text-[11px] font-bold uppercase tracking-widest italic"
                />
            </div>
        </div>
    );
}

function SecurityToggle({ label, desc, active, onToggle, icon: Icon }: any) {
    return (
        <div className="p-8 glass-v-series rounded-3xl border border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all" onClick={onToggle}>
            <div className="flex items-center gap-6">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shadow-lg",
                    active ? "bg-hyper-cyan/10 border-hyper-cyan/20 text-hyper-cyan shadow-neon-cyan/20" : "bg-white/5 border-white/10 text-white/20"
                )}>
                    <Icon size={20} />
                </div>
                <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest italic">{label}</div>
                    <div className="text-[9px] text-white/20 uppercase font-black tracking-widest mt-1">{desc}</div>
                </div>
            </div>

            <div className={cn(
                "w-14 h-7 rounded-full p-1 transition-colors duration-500",
                active ? "bg-hyper-cyan/20" : "bg-white/5"
            )}>
                <motion.div
                    animate={{ x: active ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shadow-lg",
                        active ? "bg-hyper-cyan" : "bg-white/20"
                    )}
                >
                    {active && <Zap size={10} className="text-carbon-black" />}
                </motion.div>
            </div>
        </div>
    );
}
