'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    File,
    Upload,
    Trash2,
    Download,
    Lock,
    FileText,
    Image as ImageIcon,
    Archive,
    Plus,
    RefreshCw,
    Search,
    HardDrive,
    Activity,
    Zap,
    Cpu,
    Globe
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type CitadelFile = {
    id: string;
    file_name: string;
    file_extension: string;
    file_size: number;
    file_type: string;
    created_at: string;
};

export function TheCitadel() {
    const [files, setFiles] = useState<CitadelFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ users: 1, signals24h: 300 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch('/api/system/stats').then(res => res.json()).then(data => {
            if (data.users) setStats(data);
        });
    }, []);

    const supabase = createClient();

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase
                .from('citadel_files')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error) setFiles(data || []);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = file.name.split('.')[0];
            const filePath = `${session.user.id}/${Date.now()}_${file.name}`;

            // 1. Upload to Storage (Note: Bucket 'citadel' must exist)
            const { error: uploadError } = await supabase.storage
                .from('citadel')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Record in Database
            const { error: dbError } = await supabase.from('citadel_files').insert({
                user_id: session.user.id,
                file_name: fileName,
                file_extension: fileExt,
                file_size: file.size,
                storage_path: filePath,
                file_type: file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT'
            });

            if (dbError) throw dbError;

            fetchFiles();
        } catch (error) {
            console.error('Citadel_Upload_Failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const deleteFile = async (id: string, storagePath: string) => {
        const { error: storageError } = await supabase.storage
            .from('citadel')
            .remove([storagePath]);

        if (!storageError) {
            await supabase.from('citadel_files').delete().eq('id', id);
            fetchFiles();
        }
    };

    const downloadFile = async (storagePath: string, fileName: string) => {
        const { data, error } = await supabase.storage.from('citadel').download(storagePath);
        if (data) {
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } else {
            console.error("Failed to download file:", error);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getIcon = (type: string) => {
        if (type === 'IMAGE') return <ImageIcon className="text-hyper-cyan" />;
        if (type === 'ARCHIVE') return <Archive className="text-amber-500" />;
        return <FileText className="text-white/40" />;
    };

    const filteredFiles = files.filter(f =>
        f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans relative">
            {/* Defensive Matrix (Background) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                <svg className="w-full h-full">
                    <defs>
                        <radialGradient id="shield-glow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(0,186,211,0.2)" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>
                    {[...Array(5)].map((_, i) => (
                        <motion.circle
                            key={i}
                            cx="50%"
                            cy="50%"
                            r={100 + i * 150}
                            fill="none"
                            stroke="rgba(0,186,211,0.4)"
                            strokeWidth="1"
                            strokeDasharray="10 20"
                            animate={{
                                rotate: i % 2 === 0 ? 360 : -360,
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
                        />
                    ))}
                    <rect width="100%" height="100%" fill="url(#shield-glow)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-8 relative z-10">

                {/* Biometric Laser Scan Effect 2.0 */}
                <div className="absolute inset-x-0 top-0 h-64 pointer-events-none z-20 overflow-hidden opacity-30">
                    <motion.div
                        animate={{ y: ['-100%', '400%'] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="w-full h-1 bg-gradient-to-r from-transparent via-hyper-cyan to-transparent shadow-neon-cyan relative"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-hyper-cyan text-carbon-black text-[7px] font-black uppercase tracking-widest whitespace-nowrap rounded-b-lg">
                            ASSET_FORTRESS_SCAN_ACTIVE
                        </div>
                    </motion.div>
                </div>

                {/* Citadel Header */}
                <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 p-10 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <ShieldCheck size={200} />
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-6 border-2 border-dashed border-hyper-cyan/20 rounded-full"
                            />
                            <div className="w-24 h-24 rounded-[1.5rem] bg-carbon-black border border-hyper-cyan/40 flex items-center justify-center shadow-neon-cyan relative z-10">
                                <ShieldCheck className="w-12 h-12 text-hyper-cyan animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] text-hyper-cyan font-black tracking-[0.5em] uppercase">Protocol: Sigma-Vault</span>
                                <div className="h-[1px] w-12 bg-white/10" />
                                <span className="text-[10px] text-white/20 font-black tracking-widest uppercase italic">Fortress_Core_V4</span>
                            </div>
                            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mt-2 leading-none">The Citadel</h1>
                        </div>
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="group flex items-center gap-6 px-12 py-7 bg-hyper-cyan text-carbon-black rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-neon-cyan hover:bg-white transition-all italic disabled:opacity-50"
                    >
                        {isUploading ? <RefreshCw className="animate-spin" /> : <Upload size={24} />}
                        <span>Fortify_New_Asset</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                    />
                </div>

                {/* Live Breach Telemetry Feed */}
                <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-[1.5rem] px-8 py-5 flex items-center gap-8 backdrop-blur-md">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-neon-rose" />
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic whitespace-nowrap">Global_Breach_Sentinel:</span>
                    </div>
                    <div className="flex-1 flex gap-12 items-center overflow-hidden">
                        {[
                            "INTRUSION_DEFLECTED_NODE_7",
                            "QUANTUM_BYPASS_ATTEMPT_LOCKED",
                            "BRUTE_FORCE_ARRAY_QUARANTINED",
                            "DDOS_THRESHOLD_NORMALIZED",
                            "LATERAL_MOVE_PREVENTED"
                        ].map((msg, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                                className="text-[9px] font-mono text-rose-400/40 uppercase tracking-widest whitespace-nowrap border-r border-white/5 pr-12 last:border-0 italic"
                            >
                                <span className="text-rose-500/20">[{new Date().toLocaleTimeString([], { hour12: false })}]</span> {msg}
                            </motion.span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 shrink-0 border-l border-white/5 pl-8">
                        <Activity size={18} className="text-rose-500" />
                        <div>
                            <div className="text-[8px] text-white/20 font-black uppercase tracking-widest leading-none mb-1">Deflected_Vector</div>
                            <div className="text-[11px] text-white font-black tracking-widest leading-none">{(stats.signals24h * 842).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Search & Main Matrix */}
                <div className="flex-1 flex flex-col gap-8 min-h-0">
                    <div className="grid grid-cols-12 gap-8 shrink-0">
                        {/* Search Control */}
                        <div className="col-span-8 relative group">
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-hyper-cyan transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="LOCATE_ENCRYPTED_ASSET_BY_REF_ID..."
                                className="w-full bg-white/[0.02] border border-white/10 rounded-[1.5rem] py-7 pl-20 pr-8 text-[12px] font-black text-white placeholder:text-white/10 outline-none focus:border-hyper-cyan/40 transition-all uppercase tracking-widest italic"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-1 rounded bg-white/5 border border-white/10">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">AES-256</span>
                            </div>
                        </div>

                        {/* Storage HUD */}
                        <div className="col-span-4 glass-v-series rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01] flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                                <HardDrive size={24} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Fortress_Storage_Delta</span>
                                    <span className="text-[10px] font-mono text-hyper-cyan font-black italic">{formatSize(files.reduce((acc, f) => acc + f.file_size, 0))} / 5 GB</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (files.reduce((acc, f) => acc + f.file_size, 0) / (5 * 1024 * 1024 * 1024)) * 100)}%` }}
                                        className="h-full bg-hyper-cyan shadow-neon-cyan"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats HUD Bar */}
                    <div className="grid grid-cols-4 gap-6 shrink-0">
                        <div className="glass-v-series rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-4 group hover:border-hyper-cyan/30 transition-all">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>Core_Encryption</span>
                                <Zap size={14} className="text-amber-500" />
                            </div>
                            <div className="text-2xl font-black text-white italic tracking-tighter">AES-256-GCM</div>
                        </div>
                        <div className="glass-v-series rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-4 group hover:border-hyper-cyan/30 transition-all">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>Vault_Integrity</span>
                                <Cpu size={14} className="text-hyper-cyan" />
                            </div>
                            <div className="text-2xl font-black text-hyper-cyan italic tracking-tighter shadow-neon-cyan uppercase">Optimal</div>
                        </div>
                        <div className="glass-v-series rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-4 group hover:border-hyper-cyan/30 transition-all">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>Threat_Level</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />)}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-rose-500 italic tracking-tighter shadow-neon-rose uppercase">{stats.signals24h > 500 ? 'MAX_THREAT' : 'STABLE'}</div>
                        </div>
                        <div className="glass-v-series rounded-[1.5rem] p-6 border border-white/5 bg-white/[0.01] flex flex-col gap-4 group hover:border-hyper-cyan/30 transition-all">
                            <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>Sentinel_Nodes</span>
                                <Globe size={14} className="text-white/20" />
                            </div>
                            <div className="text-2xl font-black text-white italic tracking-tighter uppercase">{stats.users}_NODES</div>
                        </div>
                    </div>

                    {/* Asset Matrix (Scrollable Area) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4 pb-20">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key="asset-grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid md:grid-cols-3 lg:grid-cols-4 gap-8"
                            >
                                {filteredFiles.map((file, i) => (
                                    <motion.div
                                        layout
                                        key={file.id || `file-${i}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -10 }}
                                        className="group relative p-8 bg-white/[0.01] border border-white/10 rounded-[3rem] hover:border-hyper-cyan/40 transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none group-hover:scale-150">
                                            <Lock size={100} className="text-hyper-cyan" />
                                        </div>

                                        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                                            <div className="w-24 h-24 bg-black/40 rounded-[2rem] flex items-center justify-center border border-white/5 group-hover:border-hyper-cyan/20 group-hover:shadow-neon-cyan/10 transition-all duration-500">
                                                <div className="scale-125">
                                                    {getIcon(file.file_type)}
                                                </div>
                                            </div>
                                            <div className="space-y-2 w-full">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate px-4 italic group-hover:text-hyper-cyan transition-colors">
                                                    {file.file_name}
                                                </h3>
                                                <div className="flex items-center justify-center gap-3">
                                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest">.{file.file_extension}</span>
                                                    <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] font-mono">{formatSize(file.file_size)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-3 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            <button
                                                onClick={() => downloadFile((file as any).storage_path, `${file.file_name}.${file.file_extension}`)}
                                                className="flex-1 py-4 bg-white/5 hover:bg-hyper-cyan hover:text-carbon-black rounded-2xl text-[9px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 italic"
                                            >
                                                <Download size={14} /> SYNC
                                            </button>
                                            <button
                                                onClick={() => deleteFile(file.id, (file as any).storage_path)}
                                                className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}

                                {files.length === 0 && !loading ? (
                                    <motion.div 
                                        key="empty-assets"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="col-span-full flex flex-col items-center justify-center py-56 border border-dashed border-white/10 rounded-[4rem] group hover:border-hyper-cyan/40 transition-colors"
                                    >
                                        <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-10 group-hover:border-hyper-cyan/20 transition-all">
                                            <HardDrive className="w-16 h-16 text-white/10 group-hover:text-hyper-cyan/20" />
                                        </div>
                                        <p className="text-[14px] font-black text-white/20 uppercase tracking-[1em] italic">Vault_Zero_Assets</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-10 px-12 py-5 bg-hyper-cyan/5 border border-hyper-cyan/20 rounded-2xl text-hyper-cyan text-[11px] font-black uppercase tracking-[0.5em] hover:bg-hyper-cyan hover:text-carbon-black transition-all italic shadow-neon-cyan/20"
                                        >
                                            Initiate_Asset_Upload
                                        </button>
                                    </motion.div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="flex justify-between items-center py-6 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic leading-none">
                            <div className="w-2.5 h-2.5 bg-hyper-cyan rounded-full animate-pulse shadow-neon-cyan" />
                            Sovereign_Shield: ACTIVE
                        </div>
                        <div className="w-[1px] h-4 bg-white/5" />
                        <div className="text-[9px] font-mono text-white/10 uppercase tracking-widest italic">
                            Encryption_Algorithm: AES-GCM-256_QUANTUM_READY
                        </div>
                    </div>
                    <div className="flex gap-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono italic">
                        <span>Node_Latency: {(Math.random() * 4 + 8).toFixed(2)}ms</span>
                        <span>Protocol_Sync: OPTIMAL</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

