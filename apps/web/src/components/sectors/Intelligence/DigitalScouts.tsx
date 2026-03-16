'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radio,
    Globe,
    TrendingUp,
    ShieldCheck,
    Zap,
    Eye,
    ExternalLink,
    Cpu,
    RefreshCw,
    Bell,
    Download,
    Mail
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type ScoutReport = {
    id: string;
    scout_type: 'MARKET' | 'NEWS' | 'SECURITY' | 'SYSTEM';
    content: string;
    intel_level: 'INFO' | 'WARNING' | 'CRITICAL';
    created_at: string;
    is_read: boolean;
};

export function DigitalScouts() {
    const [reports, setReports] = useState<ScoutReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'MARKET' | 'NEWS' | 'SECURITY'>('ALL');
    const [exporting, setExporting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchReports();
        // Sync with global intelligence streams
        syncGlobalIntel();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data, error } = await supabase
                .from('scout_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error) setReports(data || []);
        }
        setLoading(false);
    };

    const syncGlobalIntel = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/intel/news');
            if (res.ok) {
                const data = await res.json();
                if (data.reports) {
                    setReports(data.reports);
                }
            }
        } catch (error) {
            console.error('Failed to fetch real intel:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase.from('scout_reports').update({ is_read: true }).eq('id', id);
        setReports(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r));
    };

    const runGlobalScan = async () => {
        setIsScanning(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const res = await fetch('/api/intel/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session.user.id })
                });
                if (res.ok) {
                    const ans = await res.json();
                    if (ans.status === 'INTEL_GATHERED') {
                        await fetchReports();
                    }
                }
            }
        } catch (e) {
            console.error('Scan failed', e);
        } finally {
            setIsScanning(false);
        }
    };

    const filteredReports = reports.filter(r =>
        activeFilter === 'ALL' ? true : r.scout_type === activeFilter
    );

    const handleExportIntel = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/intel/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'intelligence', data: { reports } }),
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'sovereign-intel.csv'; a.click();
            URL.revokeObjectURL(url);
        } catch (e) { console.error('Export failed', e); }
        finally { setExporting(false); }
    };

    const handleEmailReport = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) { alert('Please sign in to receive intel reports.'); return; }
        try {
            const highlights = reports.slice(0, 3).map(r => r.content);
            await fetch('/api/intel/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session.user.email,
                    summary: { intelAlerts: highlights, aiInsight: 'Daily intelligence analysis powered by Sovereign Neural Oracle.' }
                }),
            });
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 3000);
        } catch (e) { console.error('Email report failed', e); }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans">
            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-8">

                {/* Intel Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border border-hyper-cyan/30 flex items-center justify-center bg-hyper-cyan/5">
                                <Radio className="w-6 h-6 text-hyper-cyan animate-pulse" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-carbon-black flex items-center justify-center">
                                <span className="text-[7px] font-black text-white">{reports.filter(r => !r.is_read).length}</span>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Digital_Scouts</h1>
                            <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-mono">Autonomous_Intel_Gathering_v4.2</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Encryption Layer HUD */}
                        <div className="flex items-center gap-3 px-4 py-1 bg-white/[0.03] border border-white/5 rounded-full mr-4">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Decryption_Nodes:</span>
                            <div className="flex gap-0.5">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                                        className="w-0.5 h-3 bg-hyper-cyan"
                                    />
                                ))}
                            </div>
                        </div>

                        {['ALL', 'MARKET', 'NEWS', 'SECURITY'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f as any)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                                    activeFilter === f
                                        ? "bg-hyper-cyan text-carbon-black border-hyper-cyan"
                                        : "bg-white/5 border-white/5 text-white/30 hover:border-white/10"
                                )}
                            >
                                {f}
                            </button>
                        ))}

                        <div className="w-px h-6 bg-white/5 mx-1" />

                        {/* Export CSV */}
                        <button
                            onClick={handleExportIntel}
                            disabled={exporting || reports.length === 0}
                            title="Export Intel CSV"
                            className="p-2 rounded-full bg-white/5 border border-white/5 text-white/30 hover:text-hyper-cyan hover:border-hyper-cyan/30 transition-all disabled:opacity-30"
                        >
                            <Download size={14} />
                        </button>

                        {/* Email Report */}
                        <button
                            onClick={handleEmailReport}
                            title="Send Email Intel Report"
                            className={cn(
                                "p-2 rounded-full border transition-all",
                                emailSent
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-white/5 border-white/5 text-white/30 hover:text-rose-400 hover:border-rose-400/30"
                            )}
                        >
                            <Mail size={14} />
                        </button>
                    </div>
                </div>

                {/* Signal Interceptor Visualizer */}
                <div className="glass-v-series rounded-[3rem] p-10 bg-hyper-cyan/[0.02] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[150px]">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 flex items-end gap-1 px-10">
                        {[1, 2, 3, 4, 5, 2, 4, 3, 6, 2, 5, 8, 4, 2, 4, 6, 3, 2].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [`${h * 10}%`, `${h * 15}%`, `${h * 10}%`] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                className="flex-1 bg-hyper-cyan/20 rounded-t-sm"
                            />
                        ))}
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <Radio size={24} className="text-hyper-cyan" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Global_Signal_Interception_Active</span>
                    </div>

                    {/* Triangulation Radar Effect */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 2, opacity: [0, 0.2, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
                            className="absolute w-64 h-64 border border-hyper-cyan/30 rounded-full pointer-events-none"
                        />
                    ))}
                </div>

                {/* Scout Feed */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 pb-10">
                    <AnimatePresence mode="popLayout">
                        {filteredReports.map((report, i) => (
                            <motion.div
                                layout
                                key={report.id || `report-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "relative p-6 rounded-2xl border transition-all group overflow-hidden",
                                    report.is_read ? "bg-white/[0.01] border-white/5 opacity-60" : "bg-white/[0.03] border-white/10 shadow-lg"
                                )}
                            >
                                {/* Status Indicator */}
                                <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1",
                                    report.intel_level === 'CRITICAL' ? "bg-rose-500" : report.intel_level === 'WARNING' ? "bg-amber-400" : "bg-hyper-cyan"
                                )} />

                                <div className="flex gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5",
                                        report.scout_type === 'MARKET' ? "text-emerald-500" : report.scout_type === 'SECURITY' ? "text-hyper-cyan" : "text-white/40"
                                    )}>
                                        {report.scout_type === 'MARKET' ? <TrendingUp size={24} /> : report.scout_type === 'NEWS' ? <Globe size={24} /> : <ShieldCheck size={24} />}
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{report.scout_type}_UNIT_REPORT</span>
                                                <span className="text-[8px] text-white/20 font-mono">{new Date(report.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            {!report.is_read && (
                                                <button
                                                    onClick={() => markAsRead(report.id)}
                                                    className="text-[9px] font-black text-hyper-cyan uppercase tracking-widest hover:underline"
                                                >
                                                    Acknowledge_Intel
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-sm font-bold text-white/80 leading-relaxed font-mono uppercase tracking-tight">
                                            {report.content}
                                        </p>

                                        <div className="flex items-center gap-4 text-[8px] font-black text-white/20 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Cpu size={10} /> Sync_Node: Alpha</span>
                                            <span className="flex items-center gap-1.5"><Zap size={10} /> Priority: {report.intel_level}</span>
                                            <div className="flex-1" />
                                            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                Explore_Full_Data <ExternalLink size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {reports.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
                            <RefreshCw className="w-12 h-12 text-white/5 animate-spin mb-6" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Scanning_Global_Frequencies...</p>
                        </div>
                    )}
                </div>

                {/* Scout Status Footer */}
                <div className="flex justify-between items-center py-6 border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <Bell size={14} className="text-hyper-cyan animate-bounce" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Scout_Array_Optimal</span>
                        </div>
                        <div className="w-px h-6 bg-white/5" />
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Uptime_Record: 99.998%</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchReports}
                            disabled={loading || isScanning}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest transition-all"
                        >
                            <RefreshCw size={12} className={cn(loading && "animate-spin")} /> Force_Sync
                        </button>
                        <button
                            onClick={runGlobalScan}
                            disabled={isScanning}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-neon-cyan border",
                                isScanning
                                    ? "bg-hyper-cyan/5 border-hyper-cyan/20 text-hyper-cyan/50 cursor-not-allowed"
                                    : "bg-hyper-cyan/20 border-hyper-cyan/50 text-hyper-cyan hover:bg-hyper-cyan hover:text-carbon-black"
                            )}
                        >
                            <Globe size={12} className={cn(isScanning && "animate-spin")} /> {isScanning ? 'Executing_Deep_Scan...' : 'Initiate_Global_Scan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
