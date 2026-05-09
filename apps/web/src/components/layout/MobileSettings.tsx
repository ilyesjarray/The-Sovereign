'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Globe, Bell, Shield, User, Users,
    Palette, Lock, Fingerprint, Eye, EyeOff,
    Languages, HardDrive, Smartphone, Zap,
    ChevronRight, ChevronLeft, Save, RotateCcw, Link, UserPlus,
    Camera, Loader2, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const SECTIONS = [
    { id: 'profile', label: 'IMPERIAL_PROFILE', icon: User, color: 'text-hyper-cyan' },
    { id: 'syndicate', label: 'SYNDICATE_COMMAND', icon: Users, color: 'text-purple-400' },
    { id: 'subscriptions', label: 'IMPERIAL_TREASURY', icon: Zap, color: 'text-amber-400' },
    { id: 'security', label: 'GUARD_PROTOCOLS', icon: Shield, color: 'text-emerald-400' },
    { id: 'language', label: 'LINGUA_CENTER', icon: Languages, color: 'text-blue-400' },
];

export function MobileSettings() {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    
    // Core States
    const [notifications, setNotifications] = useState(true);
    const [biometrics, setBiometrics] = useState(true);

    // Profile States
    const [fullName, setFullName] = useState('');
    const [emailNode, setEmailNode] = useState('');
    const [userTier, setUserTier] = useState('GUEST');
    const [neuralLinkId, setNeuralLinkId] = useState('');
    const [sovereignCredits, setSovereignCredits] = useState(0);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userId, setUserId] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Syndicate States
    const [inviteEmail, setInviteEmail] = useState('');
    const [syndicateMembers, setSyndicateMembers] = useState<{ id: string, email: string, role: string, status: string }[]>([]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUserId(session.user.id);
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile && !error) {
                setFullName(profile.full_name || '');
                setEmailNode(profile.email || session.user.email || '');
                setAvatarUrl(profile.avatar_url || null);
                setUserTier(profile.tier || 'GUEST');
                setNeuralLinkId(profile.neural_link_id || '');
                setSovereignCredits(profile.sovereign_credits || 0);
            } else {
                setEmailNode(session.user.email || '');
            }
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        if (userId) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    email: emailNode,
                })
                .eq('id', userId);

            if (!error) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }
        }
        setIsSaving(false);
    };

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 256;
                    let w = img.width, h = img.height;
                    if (w > h && w > MAX) { h = Math.round(h * (MAX / w)); w = MAX; }
                    else if (h > MAX) { w = Math.round(w * (MAX / h)); h = MAX; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No canvas context');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(b => b ? resolve(b) : reject('Blob failed'), 'image/jpeg', 0.5);
                };
                img.onerror = reject;
                img.src = reader.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;
        setIsUploading(true);
        try {
            const blob = await compressImage(file);
            const filePath = `${userId}/avatar.jpg`;
            const { error: upErr } = await supabase.storage
                .from('citadel')
                .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });
            if (!upErr) {
                const { data: urlData } = supabase.storage.from('citadel').getPublicUrl(filePath);
                const publicUrl = urlData.publicUrl + '?t=' + Date.now();
                await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
                setAvatarUrl(publicUrl);
            }
        } catch (err) {}
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubscribe = (planId: string) => {
        const PAYMENT_LINKS: Record<string, string> = {
            'standard': 'https://nowpayments.io/payment/?iid=4458788659',
            'premium': 'https://nowpayments.io/payment/?iid=5180468463',
            'ultra': 'https://nowpayments.io/payment/?iid=6375314481'
        };
        const url = PAYMENT_LINKS[planId];
        if (url) window.open(url, '_blank');
    };

    // --- RENDERERS ---
    
    const renderMainList = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 space-y-6"
        >
            <div className="flex items-center gap-4 p-4 rounded-2xl glass-v-series border border-white/5 bg-white/[0.02]">
                <div className="w-14 h-14 rounded-xl border border-hyper-cyan/30 overflow-hidden relative shrink-0">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-hyper-cyan/10 flex items-center justify-center">
                            <User size={24} className="text-hyper-cyan" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-white italic truncate">{fullName || 'COMMANDER'}</span>
                    <span className="text-[9px] font-black text-hyper-cyan uppercase tracking-widest">{userTier}_TIER</span>
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Core Configurations</span>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className="w-full p-4 flex items-center justify-between active:bg-white/[0.05] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white/5", section.color)}>
                                    <section.icon size={16} />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{section.label.replace('_', ' ')}</span>
                            </div>
                            <ChevronRight size={16} className="text-white/20" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sovereign_Credits</span>
                    <div className="text-xl font-black text-hyper-cyan italic mt-1">{sovereignCredits} <span className="text-[10px] text-white/30">SCR</span></div>
                </div>
                <Zap className="w-8 h-8 text-hyper-cyan/20" />
            </div>
        </motion.div>
    );

    const renderDetailView = () => {
        const section = SECTIONS.find(s => s.id === activeSection);
        if (!section) return null;

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full bg-carbon-black"
            >
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0 bg-black/50 backdrop-blur-lg sticky top-0 z-10">
                    <button onClick={() => setActiveSection(null)} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <span className="text-xs font-black text-white uppercase tracking-widest">{section.label.replace('_', ' ')}</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto pb-24 flex-1 space-y-6">
                    {activeSection === 'profile' && (
                        <div className="space-y-6">
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                            
                            <div className="flex flex-col items-center gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-20 h-20 rounded-2xl border border-hyper-cyan/30 flex items-center justify-center relative overflow-hidden active:scale-95 transition-all"
                                >
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-hyper-cyan/50" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        {isUploading ? <Loader2 className="animate-spin text-hyper-cyan" /> : <Camera className="text-hyper-cyan" />}
                                    </div>
                                </button>
                                <span className="text-[10px] text-hyper-cyan font-black uppercase tracking-widest">{userTier} TIER</span>
                            </div>

                            <div className="space-y-4">
                                <MobileField label="FULL_NAME" value={fullName} onChange={setFullName} />
                                <MobileField label="EMAIL_NODE" value={emailNode} onChange={setEmailNode} />
                                <MobileField label="NEURAL_LINK_ID" value={neuralLinkId} onChange={setNeuralLinkId} />
                                <MobileField label="ACCESS_TIER" value={userTier} readOnly />
                            </div>

                            <button
                                onClick={saveSettings}
                                disabled={isSaving}
                                className={cn(
                                    "w-full py-4 mt-4 font-black text-xs uppercase tracking-[0.2em] rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2",
                                    saveSuccess ? "bg-emerald-500 text-black" : "bg-hyper-cyan text-black"
                                )}
                            >
                                <Save size={16} />
                                {isSaving ? 'COMMITTING...' : saveSuccess ? 'COMMITTED ✓' : 'SAVE_CHANGES'}
                            </button>
                        </div>
                    )}

                    {activeSection === 'syndicate' && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Invite Operative</span>
                                <input
                                    type="email"
                                    placeholder="EMAIL_COORDINATES..."
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-hyper-cyan/50 placeholder:text-white/20 uppercase"
                                />
                                <button
                                    onClick={() => {
                                        if(!inviteEmail) return;
                                        setSyndicateMembers(prev => [{ id: Date.now().toString(), email: inviteEmail, role: 'OPERATIVE', status: 'PENDING' }, ...prev]);
                                        setInviteEmail('');
                                    }}
                                    className="w-full py-3 bg-hyper-cyan/10 text-hyper-cyan border border-hyper-cyan/30 rounded-xl font-black text-[10px] uppercase tracking-widest active:bg-hyper-cyan active:text-black transition-all flex items-center justify-center gap-2"
                                >
                                    <UserPlus size={14} /> DEPLOY_INVITE
                                </button>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active_Roster</span>
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-black text-white uppercase truncate">{emailNode}</span>
                                        <span className="text-[9px] text-hyper-cyan font-mono mt-0.5">COMMANDER</span>
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">ONLINE</span>
                                </div>
                                {syndicateMembers.map(m => (
                                    <div key={m.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <span className="text-xs font-black text-white uppercase truncate">{m.email}</span>
                                            <span className="text-[9px] text-white/40 font-mono mt-0.5">{m.role}</span>
                                        </div>
                                        <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded">{m.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'subscriptions' && (
                        <div className="space-y-4">
                            <SubscriptionCard tier="Standard" price="15" features={['Basic Neural Access', '10GB Vault', 'Standard Intel']} onClick={() => handleSubscribe('standard')} color="text-white" border="border-white/20" bg="bg-white/5" />
                            <SubscriptionCard tier="Premium" price="40" features={['Whale Order Tracking', 'Premium Intel', '100GB Quantum Vault']} onClick={() => handleSubscribe('premium')} color="text-hyper-cyan" border="border-hyper-cyan/30" bg="bg-hyper-cyan/5" />
                            <SubscriptionCard tier="Ultra" price="90" features={['Llama 3.3 Overlord', 'B2B Syndicate Control', 'Unlimited Vault']} onClick={() => handleSubscribe('ultra')} color="text-amber-500" border="border-amber-500/40" bg="bg-amber-500/10" isMax />
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className="space-y-4">
                            <MobileSecurityToggle label="BIOMETRIC_LOCK" desc="Local fingerprint resonance" active={biometrics} onToggle={() => setBiometrics(!biometrics)} icon={Fingerprint} />
                            <MobileSecurityToggle label="QUANTUM_ALERTS" desc="Encrypted signal delivery" active={notifications} onToggle={() => setNotifications(!notifications)} icon={Zap} />
                            <MobileSecurityToggle label="STEALTH_MODE" desc="Hide from tracking nodes" active={false} onToggle={() => {}} icon={EyeOff} />
                        </div>
                    )}

                    {activeSection === 'language' && (
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-4">
                            <Languages className="w-12 h-12 text-blue-400 mx-auto opacity-50" />
                            <p className="text-xs text-white/60 uppercase tracking-widest font-bold">Linguistic protocol fixed to English for Kernel ops.</p>
                            <div className="py-3 px-4 bg-hyper-cyan/10 text-hyper-cyan rounded-xl text-[10px] font-black tracking-widest">CURRENT: ENGLISH</div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="h-full bg-carbon-black relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
                {activeSection ? renderDetailView() : renderMainList()}
            </AnimatePresence>
        </div>
    );
}

function MobileField({ label, value, onChange, readOnly }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black text-white/40 uppercase tracking-widest pl-1">{label}</label>
            <input
                value={value}
                onChange={e => onChange?.(e.target.value)}
                readOnly={readOnly}
                className={cn(
                    "w-full px-4 py-3 rounded-xl border outline-none text-xs font-bold uppercase tracking-wider transition-all",
                    readOnly ? "bg-white/[0.02] border-white/5 text-white/30" : "bg-white/[0.05] border-white/10 text-white focus:border-hyper-cyan/50"
                )}
            />
        </div>
    );
}

function SubscriptionCard({ tier, price, features, onClick, color, border, bg, isMax }: any) {
    return (
        <div className={cn("p-6 rounded-2xl border flex flex-col relative overflow-hidden", border, bg)}>
            {isMax && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8px] font-black px-3 py-1 rounded-bl-xl tracking-widest">MAX</div>}
            <span className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-1", color)}>{tier}</span>
            <div className="text-2xl font-black text-white mb-4">${price}<span className="text-xs text-white/30">/mo</span></div>
            <div className="space-y-2 mb-6">
                {features.map((f: string, i: number) => (
                    <div key={i} className="text-[10px] text-white/70 font-bold uppercase tracking-widest truncate">- {f}</div>
                ))}
            </div>
            <button onClick={onClick} className={cn("w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest", isMax ? "bg-amber-500 text-black" : "border border-white/20 text-white")}>
                Initialize
            </button>
        </div>
    );
}

function MobileSecurityToggle({ label, desc, active, onToggle, icon: Icon }: any) {
    return (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between active:bg-white/[0.05]" onClick={onToggle}>
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-hyper-cyan/10 text-hyper-cyan" : "bg-white/5 text-white/30")}><Icon size={18} /></div>
                <div>
                    <div className="text-xs font-black text-white uppercase tracking-widest">{label}</div>
                    <div className="text-[9px] text-white/40 uppercase font-bold mt-0.5">{desc}</div>
                </div>
            </div>
            <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", active ? "bg-hyper-cyan/30" : "bg-white/10")}>
                <motion.div animate={{ x: active ? 24 : 0 }} className={cn("w-4 h-4 rounded-full", active ? "bg-hyper-cyan" : "bg-white/40")} />
            </div>
        </div>
    );
}
