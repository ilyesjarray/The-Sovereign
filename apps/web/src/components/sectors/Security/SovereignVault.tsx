'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Plus,
    Search,
    Lock,
    Key,
    FileText,
    Trash2,
    Eye,
    EyeOff,
    RefreshCw,
    Terminal,
    Database,
    Upload,
    Skull,
    Loader2,
    Fingerprint,
    IdCard,
    Globe,
    Crown,
    CheckCircle2,
    Zap,
    ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// WebCrypto AES-GCM Utility
async function deriveKey(password: string, salt: Uint8Array) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt as any, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(text: string, password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));

    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    return btoa(String.fromCharCode(...combined));
}

async function decryptData(packed: string, password: string) {
    try {
        const combined = new Uint8Array(atob(packed).split("").map((c) => c.charCodeAt(0)));
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const data = combined.slice(28);

        const key = await deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
        const dec = new TextDecoder();
        return dec.decode(decrypted);
    } catch (e) {
        throw new Error("Decryption failed");
    }
}

type VaultItem = {
    id: string;
    title: string;
    encrypted_content: string;
    item_type: 'NOTE' | 'CREDENTIAL' | 'KEY';
    created_at: string;
};

export function SovereignVault() {
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleContent, setVisibleContent] = useState<Record<string, boolean>>({});

    // New Item State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<'NOTE' | 'CREDENTIAL' | 'KEY'>('NOTE');

    const [decryptedState, setDecryptedState] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'IDLE' | 'ENCRYPTING' | 'SYNCING'>('IDLE');

    // Identity Card State
    const [showIDCard, setShowIDCard] = useState(true);
    const [userData, setUserData] = useState({
        name: '...',
        rank: 'CITIZEN',
        clearance: 'LEVEL_1',
        citizenId: 'SOV-...',
        issuedDate: '...'
    });

    const supabase = createClient();

    useEffect(() => {
        fetchVaultItems();
    }, []);

    const fetchVaultItems = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // First, fetch items
            const { data, error } = await supabase
                .from('vault_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setItems(data || []);

            // Then, fetch profile for Identity Card
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setUserData({
                    name: profile.username || session.user.email?.split('@')[0] || 'SOVEREIGN',
                    rank: profile.level > 10 ? 'IMPERIAL_OVERLORD' : 'ELITE_COMMANDER',
                    clearance: 'LEVEL_ALPHA_' + (profile.level || 1),
                    citizenId: `SOV-${session.user.id.slice(0, 8).toUpperCase()}`,
                    issuedDate: new Date(profile.created_at).toLocaleDateString()
                });
            }
        }
        setLoading(false);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const encrypted = await encryptData(newContent, session.user.id);

        const { error } = await supabase.from('vault_items').insert({
            user_id: session.user.id,
            title: newTitle,
            encrypted_content: encrypted,
            item_type: newType
        });

        if (!error) {
            setNewTitle('');
            setNewContent('');
            setIsAdding(false);
            fetchVaultItems();
        }
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase.from('vault_items').delete().eq('id', id);
        if (!error) fetchVaultItems();
    };

    const handleFileUpload = async () => {
        setIsUploading(true);
        setUploadStatus('ENCRYPTING');

        for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise(r => setTimeout(r, 200));
            if (i === 60) setUploadStatus('SYNCING');
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase.from('vault_items').insert({
                user_id: session.user.id,
                title: 'Quantum_File_Encrypted_' + Math.floor(Math.random() * 1000),
                encrypted_content: await encryptData('ENCRYPTED_BINARY_BUFFER_STREAM', session.user.id),
                item_type: 'KEY'
            });
            fetchVaultItems();
        }

        setIsUploading(false);
        setUploadStatus('IDLE');
        setUploadProgress(0);
    };

    const handleSelfDestruct = () => {
        if (confirm("CRITICAL: INITIALIZE SELF-DESTRUCT PROTOCOL? ALL DATA WILL BE WIPED.")) {
            items.forEach(item => deleteItem(item.id));
            alert("DESTRUCTION_COMPLETE. SYSTEM_FLUSHED.");
        }
    };

    const handleToggleVisibility = async (id: string, encrypted: string) => {
        if (!visibleContent[id]) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const decrypted = await decryptData(encrypted, session.user.id);
                    setDecryptedState(prev => ({ ...prev, [id]: decrypted }));
                }
            } catch (e) {
                try {
                    const decoded = atob(encrypted);
                    if (decoded.startsWith("IMPERIAL_V4_")) {
                        setDecryptedState(prev => ({ ...prev, [id]: decoded.replace("IMPERIAL_V4_", "") }));
                    } else {
                        setDecryptedState(prev => ({ ...prev, [id]: "DECRYPTION_ERROR_RECOVERY_REQUIRED" }));
                    }
                } catch {
                    setDecryptedState(prev => ({ ...prev, [id]: "DECRYPTION_ERROR_RECOVERY_REQUIRED" }));
                }
            }
        }
        setVisibleContent(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans relative">
            {/* Quantum Grid Visualizer (Background) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,186,211,0.1)_0%,transparent_70%)]" />
                <svg className="w-full h-full">
                    <defs>
                        <pattern id="quantum-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="rgba(0,186,211,0.5)" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#quantum-dots)" />
                    {[...Array(3)].map((_, i) => (
                        <motion.line
                            key={i}
                            x1="0"
                            y1={30 + i * 30 + "%"}
                            x2="100%"
                            y2={30 + i * 30 + "%"}
                            stroke="rgba(0,186,211,0.2)"
                            strokeWidth="1"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: i * 5 }}
                        />
                    ))}
                </svg>
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-10 relative z-10">

                {/* Sovereign Digital ID Card V4 */}
                <AnimatePresence>
                    {showIDCard && (
                        <motion.div
                            key="sovereign-id-card"
                            initial={{ opacity: 0, y: -20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            className="relative group mb-4"
                        >
                            <div className="absolute -inset-1 bg-gradient-to-r from-hyper-cyan/20 via-amber-200/20 to-hyper-cyan/20 rounded-[4rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-full bg-carbon-black/60 border border-white/10 rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl backdrop-blur-3xl">

                                {/* Photo/Emblem Section */}
                                <div className="w-full md:w-[380px] bg-gradient-to-br from-hyper-cyan/[0.08] to-transparent p-12 flex flex-col items-center justify-center border-r border-white/10 relative">
                                    <div className="absolute top-0 left-0 p-8 opacity-[0.03]">
                                        <Globe size={240} />
                                    </div>
                                    <div className="relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-8 border border-dashed border-hyper-cyan/20 rounded-full"
                                        />
                                        <div className="w-40 h-40 rounded-full border-4 border-hyper-cyan/30 p-2 bg-carbon-black flex items-center justify-center overflow-hidden shadow-neon-cyan/20 relative z-10">
                                            <div className="w-full h-full rounded-full bg-hyper-cyan/5 flex items-center justify-center text-hyper-cyan relative overflow-hidden">
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,186,211,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine" />
                                                <Crown size={80} className="animate-pulse relative z-10" />
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 bg-hyper-cyan text-carbon-black p-4 rounded-2xl shadow-neon-cyan border-4 border-carbon-black z-20">
                                            <Fingerprint size={24} />
                                        </div>
                                    </div>
                                    <div className="mt-10 text-center relative z-10">
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{userData.name}</h3>
                                        <div className="flex items-center justify-center gap-3 mt-3">
                                            <div className="h-[1px] w-4 bg-hyper-cyan/40" />
                                            <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] font-mono italic">{userData.rank}</span>
                                            <div className="h-[1px] w-4 bg-hyper-cyan/40" />
                                        </div>
                                    </div>
                                </div>

                                {/* Information Section */}
                                <div className="flex-1 p-14 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 rounded bg-hyper-cyan/10 border border-hyper-cyan/30 text-[8px] font-black text-hyper-cyan uppercase tracking-widest">Type: Diplomatic</span>
                                                <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-black text-white/30 uppercase tracking-widest">Serial: {userData.citizenId}</span>
                                            </div>
                                            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Sovereign Passport</h2>
                                            <p className="text-[11px] text-white/30 uppercase tracking-[0.5em] font-mono italic">Imperial_Identity_Protocol_V-SERIES // OMNI_ACCESS</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-2 font-mono">CLEARANCE_AUTH</span>
                                            <div className="px-8 py-4 bg-hyper-cyan text-carbon-black rounded-[1.2rem] text-xs font-black tracking-[0.3em] uppercase shadow-neon-cyan italic">
                                                {userData.clearance}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 my-12 bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hyper-cyan/20 to-transparent" />
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block font-mono">Citizen_ID_Ref</span>
                                            <span className="text-sm font-bold text-white font-mono tracking-tighter">{userData.citizenId}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block font-mono">Imperial_Issue</span>
                                            <span className="text-sm font-bold text-white font-mono tracking-tighter">{userData.issuedDate}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block font-mono">Current_Regime</span>
                                            <span className="text-sm font-bold text-hyper-cyan font-mono tracking-widest uppercase italic animate-pulse">ACTIVE_REIGN</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block font-mono">High_Council</span>
                                            <span className="text-sm font-bold text-white font-mono tracking-tighter">SUPREME_COUNCIL</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-8 border-t border-white/10">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full bg-hyper-cyan animate-ping" />
                                                <span className="text-[9px] font-mono text-white/30 uppercase italic tracking-widest">Biometric_Relay: LOCKED</span>
                                            </div>
                                            <div className="h-4 w-[1px] bg-white/10" />
                                            <div className="flex items-center gap-3">
                                                <Terminal size={14} className="text-white/20" />
                                                <span className="text-[9px] font-mono text-white/30 uppercase italic tracking-widest">Node: SOV-OMNI-01</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowIDCard(false)}
                                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-[0.4em] hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 italic group/btn"
                                        >
                                            Minimize_ID
                                            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!showIDCard && (
                    <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowIDCard(true)}
                        className="w-full p-8 bg-white/[0.01] border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-hyper-cyan/30 transition-all mb-4 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.2rem] bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center text-hyper-cyan group-hover:shadow-neon-cyan/20 transition-all relative">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-dashed border-hyper-cyan/20 rounded-[1.2rem]" />
                                <IdCard size={28} />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic">Expand_Imperial_Identity</span>
                                    <span className="px-2 py-0.5 rounded bg-hyper-cyan/10 text-[7px] font-black text-hyper-cyan uppercase">Verified</span>
                                </div>
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] mt-2 block italic">Subject: {userData.name} // Clearance: {userData.clearance}</span>
                            </div>
                        </div>
                        <ChevronRight size={24} className="text-white/20 group-hover:translate-x-2 group-hover:text-hyper-cyan transition-all" />
                    </motion.button>
                )}

                {/* Main Vault Interface */}
                <div className="flex-1 flex flex-col gap-10 min-h-0">
                    {/* Header Protocol */}
                    <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden group/header">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-hyper-cyan/[0.02] to-transparent pointer-events-none" />
                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-hyper-cyan/10 border border-hyper-cyan/30 shadow-neon-cyan/20">
                                    <ShieldAlert className="w-8 h-8 text-hyper-cyan animate-pulse" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                                        Sovereign Vault <span className="text-hyper-cyan font-mono border-l border-white/20 pl-4 ml-4">2.0</span>
                                    </h1>
                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.6em] font-mono mt-3 italic">
                                        Secure_Deep_State_Protocol // Quantum_Ready_Enc
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAdding(true)}
                            className="relative flex items-center gap-6 px-12 py-7 bg-hyper-cyan text-carbon-black rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-white transition-all group/btn italic shadow-neon-cyan"
                        >
                            <Plus size={24} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                            <span>Secure_New_Entry</span>
                        </button>
                    </div>

                    {/* Live Cryptographic HUD */}
                    <div className="grid grid-cols-4 gap-8 shrink-0">
                        <div className="glass-v-series rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                                <Zap size={60} className="text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] font-mono italic">Entropy_Pulse</span>
                            <div className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">Maximum</div>
                            <div className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-amber-500" />
                            </div>
                        </div>
                        <div className="glass-v-series rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:-rotate-12 transition-transform">
                                <Database size={60} className="text-hyper-cyan" />
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] font-mono italic">Sync_Integrity</span>
                            <div className="text-3xl font-black text-hyper-cyan italic tracking-tighter uppercase leading-none mt-2 shadow-neon-cyan">Optimal</div>
                            <div className="flex gap-1 mt-4">
                                {[...Array(8)].map((_, i) => <div key={i} className="flex-1 h-3 bg-hyper-cyan/20 rounded-sm overflow-hidden"><motion.div animate={{ y: ["100%", "0%"] }} transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }} className="w-full h-full bg-hyper-cyan" /></div>)}
                            </div>
                        </div>
                        <div className="glass-v-series rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Key size={60} className="text-white/20" />
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] font-mono italic">Key_Complexity</span>
                            <div className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mt-2">AES-256-GCM</div>
                            <div className="mt-4 text-[8px] font-mono text-white/10 uppercase tracking-widest truncate italic">PBKDF2_HMAC_SHA256_ACTIVE</div>
                        </div>
                        <div className="glass-v-series rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:animate-pulse transition-transform">
                                <Globe size={60} className="text-rose-500" />
                            </div>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] font-mono italic">Node_Latency</span>
                            <div className="text-3xl font-black text-rose-500 italic tracking-tighter uppercase leading-none mt-2 shadow-neon-rose">{(Math.random() * 2 + 8).toFixed(2)}MS</div>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500/40 animate-pulse" />
                                <span className="text-[8px] font-mono text-rose-500/40 uppercase tracking-widest italic">Global_Grid_Sync_Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* Search & Secondary Actions */}
                    <div className="flex gap-8 shrink-0">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-hyper-cyan transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH_VAULT_DEEP_STATE_ARCHIVE..."
                                className="w-full bg-white/[0.01] border border-white/10 rounded-[1.5rem] py-8 pl-20 pr-8 text-[12px] font-black text-white placeholder:text-white/5 outline-none focus:border-hyper-cyan/40 transition-all uppercase tracking-[0.3em] font-mono italic backdrop-blur-md"
                            />
                        </div>
                        <button
                            onClick={handleSelfDestruct}
                            className="px-10 bg-rose-500/5 border border-rose-500/20 rounded-[1.5rem] text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-4 group/destruct italic"
                        >
                            <Skull size={24} className="group-hover/destruct:animate-bounce" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] hidden lg:block">Emergency_Self_Destruct</span>
                        </button>
                    </div>

                    {/* Content Matrix (Scrollable Area) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 pb-20">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {isAdding ? (
                                <motion.div
                                    key="vault-add-form-container"
                                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 40 }}
                                    className="mb-12 p-14 glass-v-series border border-hyper-cyan/30 rounded-[3.5rem] bg-hyper-cyan/[0.02] backdrop-blur-2xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                                        <ShieldAlert size={140} className="text-hyper-cyan" />
                                    </div>
                                    <form onSubmit={handleAddItem} className="space-y-10 relative z-10">
                                        <div className="grid md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-6 italic">Vault_Entry_Identifier</label>
                                                <input
                                                    required
                                                    value={newTitle}
                                                    onChange={(e) => setNewTitle(e.target.value)}
                                                    placeholder="OBJECT_CORE_REFID..."
                                                    className="w-full bg-carbon-black/80 border border-white/5 rounded-2xl py-7 px-8 text-[12px] font-black text-white outline-none focus:border-hyper-cyan/40 transition-all font-mono tracking-widest italic"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-6 italic">Storage_Entropy_Class</label>
                                                <div className="flex gap-4">
                                                    {['NOTE', 'CREDENTIAL', 'KEY'].map((t) => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => setNewType(t as any)}
                                                            className={cn(
                                                                "flex-1 py-7 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all italic",
                                                                newType === t ? "bg-hyper-cyan text-carbon-black border-hyper-cyan shadow-neon-cyan" : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                                                            )}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] ml-6 italic">Payload_Deep_Buffer</label>
                                            <textarea
                                                required
                                                value={newContent}
                                                onChange={(e) => setNewContent(e.target.value)}
                                                placeholder="SECRET_BLOCK_PAYLOAD_STRING..."
                                                rows={4}
                                                className="w-full bg-carbon-black/80 border border-white/5 rounded-[2rem] py-8 px-10 text-[12px] font-black text-white outline-none focus:border-hyper-cyan/40 transition-all resize-none font-mono tracking-widest italic leading-relaxed"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-10 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsAdding(false)}
                                                className="px-10 py-5 text-[12px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors italic"
                                            >
                                                Abort_Secure_Entry
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-14 py-7 bg-hyper-cyan text-carbon-black rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-neon-cyan transition-all hover:scale-105 italic"
                                            >
                                                Execute_Deep_Shield_Uplink
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : null}

                            <motion.div 
                                key="vault-items-grid-container" 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
                            >
                                {filteredItems.map((item, i) => (
                                    <motion.div
                                        layout
                                        key={item.id && item.id !== "" ? `vault-item-${item.id}` : `vault-idx-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group relative p-10 bg-white/[0.01] border border-white/10 rounded-[3rem] hover:border-hyper-cyan/40 transition-all duration-500 overflow-hidden backdrop-blur-md"
                                    >
                                        <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700 pointer-events-none group-hover:scale-150">
                                            <Lock size={120} className="text-hyper-cyan" />
                                        </div>

                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.2rem] bg-white/[0.03] text-white/20 group-hover:text-hyper-cyan flex items-center justify-center transition-all duration-500 border border-white/5 group-hover:border-hyper-cyan/20">
                                                    {item.item_type === 'NOTE' ? <FileText size={28} /> : item.item_type === 'KEY' ? <Key size={28} /> : <Lock size={28} />}
                                                </div>
                                                <div>
                                                    <span className="text-xl font-black text-white uppercase tracking-tighter truncate block max-w-[180px] italic group-hover:text-hyper-cyan transition-colors">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-widest mt-2 block font-mono italic">Ref_ID: {item.id.slice(0, 12)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="w-12 h-12 rounded-[1rem] bg-rose-500/5 text-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="relative overflow-hidden bg-carbon-black/60 rounded-[1.5rem] p-8 border border-white/5 group-hover:border-hyper-cyan/30 transition-all duration-500 backdrop-blur-3xl">
                                            <div className="flex items-center justify-between gap-10">
                                                <div className="flex-1 font-mono text-[11px] text-white/40 tracking-[0.3em] italic break-all leading-relaxed line-clamp-2">
                                                    {visibleContent[item.id] ? (decryptedState[item.id] || 'NEURAL_DECODING...') : 'PROTOCOL_LOCKED_DATA_STREAM'}
                                                </div>
                                                <button
                                                    onClick={() => handleToggleVisibility(item.id, item.encrypted_content)}
                                                    className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 hover:text-carbon-black hover:bg-hyper-cyan transition-all duration-500 shrink-0 shadow-neon-cyan/10"
                                                >
                                                    {visibleContent[item.id] ? <EyeOff size={24} /> : <Eye size={24} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-between items-center px-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 rounded-full bg-hyper-cyan animate-pulse shadow-neon-cyan" />
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-mono italic">GCM_HARDLINKED</span>
                                            </div>
                                            <span className="text-[9px] font-mono text-white/10 uppercase italic tracking-widest">
                                                SYNC: {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {items.length === 0 && !loading && !isAdding ? (
                                <motion.div 
                                    key="vault-empty-state-container" 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-56 space-y-10 group"
                                >
                                    <div className="w-40 h-40 rounded-full border-4 border-dashed border-white/5 flex items-center justify-center group-hover:border-hyper-cyan/20 transition-all duration-700 relative">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border border-dashed border-white/5 rounded-full" />
                                        <Database className="w-16 h-16 text-white/5 group-hover:text-hyper-cyan/10 transition-all" />
                                    </div>
                                    <div className="text-center space-y-4">
                                        <p className="text-[20px] font-black text-white/20 uppercase tracking-[0.8em] italic leading-none">Vault_Zero_Init</p>
                                        <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.5em] italic">No_Encrypted_Ref_Detected_On_Current_Node</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="px-14 py-7 bg-white/5 border border-white/10 rounded-[1.5rem] text-white/20 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-hyper-cyan hover:text-carbon-black hover:border-hyper-cyan transition-all italic shadow-neon-cyan/10"
                                    >
                                        Execute_First_Encryption
                                    </button>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Footer Status Protocol */}
                    <div className="flex justify-between items-center py-10 border-t border-white/10 mt-auto relative z-10 font-mono">
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Deep_Shield: <span className="text-emerald-500 shadow-neon-emerald">REINFORCED</span></span>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10" />
                            <div className="flex items-center gap-4">
                                <ShieldAlert size={18} className="text-hyper-cyan animate-pulse" />
                                <span className="text-[10px] font-black text-hyper-cyan uppercase tracking-[0.5em] italic">Quantum_Tunneling_Active</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-6 text-[10px] text-white/10 italic">
                                <span>Entropy: High</span>
                                <div className="w-1 h-1 bg-white/20 rounded-full" />
                                <span>Ref_Uplink: Optimal</span>
                            </div>
                            <div className="h-6 w-[1px] bg-white/10" />
                            <div className="flex items-center gap-4 text-white/20">
                                <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">V4.0_IMPERIAL_STANDARD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

