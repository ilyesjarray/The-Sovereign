'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Zap,
    ShieldCheck,
    History,
    Plus,
    TrendingUp,
    Coins,
    ExternalLink,
    ChevronRight,
    RefreshCw,
    Bot,
    Play,
    Square,
    Activity,
    AlertTriangle,
    Target,
    Layers
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { TradingViewChart } from './TradingViewChart';
import { FlashArbEngine, Opportunity } from '@/lib/services/flash-arb-engine';

type ArmoryWallet = {
    id: string;
    address: string;
    chain: string;
    label: string;
};

type Execution = {
    id: string;
    asset_symbol: string;
    amount: number;
    side: 'BUY' | 'SELL' | 'TRANSFER';
    status: string;
    created_at: string;
};

export function TheArmory() {
    const [wallets, setWallets] = useState<ArmoryWallet[]>([]);
    const [executions, setExecutions] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [marketData, setMarketData] = useState<any>(null);
    const [portfolioValue, setPortfolioValue] = useState(0);

    // AI Broker State
    const [isBrokerActive, setIsBrokerActive] = useState(false);
    const [brokerStatus, setBrokerStatus] = useState('STANDBY');
    const [riskLevel, setRiskLevel] = useState('BALANCED');
    const [brokerLog, setBrokerLog] = useState<{ time: string, msg: string }[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [systemStats, setSystemStats] = useState({ users: 1, signals24h: 342, traffic24h: '1.2 GB', syncRate: 98.4 });

    const supabase = createClient();

    useEffect(() => {
        fetchArmoryData();
    }, []);

    const fetchArmoryData = async () => {
        setLoading(true);
        try {
            // Fetch system stats
            const statsRes = await fetch('/api/system/stats');
            if (statsRes.ok) setSystemStats(await statsRes.json());

            // Fetch live market prices
            const marketRes = await fetch('/api/market-data', { method: 'POST' });
            if (marketRes.ok) {
                const md = await marketRes.json();
                setMarketData(md);
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: w } = await supabase.from('armory_wallets').select('*');
                const { data: e } = await supabase.from('armory_executions').select('*').order('created_at', { ascending: false }).limit(5);
                setWallets(w || []);
                setExecutions(e || []);

                // Fetch real portfolio to calculate value
                const { data: p } = await supabase.from('user_portfolios').select('*');
                if (p && p.length > 0 && marketRes.ok) {
                    const md = await marketRes.json();
                    let total = 0;
                    p.forEach(asset => {
                        const coin = md.topCoins?.find((c: any) => c.symbol.toLowerCase() === asset.asset_symbol.toLowerCase());
                        if (coin) total += asset.amount * coin.current_price;
                    });
                    setPortfolioValue(total);
                }
            }
        } catch (e) {
            console.error('Armory Sync Error', e);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch price based portfolio value if market data changes
    useEffect(() => {
        if (marketData && marketData.topCoins) {
            const calculateValue = async () => {
                const { data: p } = await supabase.from('user_portfolios').select('*');
                if (p) {
                    let total = 0;
                    p.forEach(asset => {
                        const coin = marketData.topCoins.find((c: any) => c.symbol.toLowerCase() === asset.asset_symbol.toLowerCase());
                        if (coin) total += asset.amount * coin.current_price;
                    });
                    setPortfolioValue(total);
                }
            }
            calculateValue();
        }
    }, [marketData]);

    const scanOpportunities = async () => {
        setIsScanning(true);
        const engine = FlashArbEngine.getInstance();
        const opps = await engine.scanOpportunities();
        setOpportunities(opps);
        setTimeout(() => setIsScanning(false), 1500);
    };

    useEffect(() => {
        scanOpportunities();
        const interval = setInterval(scanOpportunities, 15000);
        return () => clearInterval(interval);
    }, []);

    const displayWallets = wallets;
    const displayExecutions = executions;

    // Calculate real portfolio value
    useEffect(() => {
        if (marketData && marketData.topCoins) {
            let total = 0;
            // Demo balances: 1.5 ETH, 25 SOL
            const eth = marketData.topCoins.find((c: any) => c.symbol === 'eth');
            const sol = marketData.topCoins.find((c: any) => c.symbol === 'sol');
            if (eth) total += 1.5 * eth.current_price;
            if (sol) total += 25 * sol.current_price;
            setPortfolioValue(total);
        }
    }, [marketData]);

    const simulateConnection = async () => {
        setIsConnecting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsConnecting(false);
        // In a real app, integrate @solana/web3.js or wagmi
    };

    // AI Trading Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isBrokerActive) {
            setBrokerStatus('ANALYZING_MARKET_PATTERNS');
            interval = setInterval(async () => {
                setBrokerStatus('EXECUTING_ALGORITHMIC_TRADE');
                try {
                    const res = await fetch('/api/ai-broker', {
                        method: 'POST',
                        body: JSON.stringify({ action: 'TRADE', riskLevel }),
                    });
                    const data = await res.json();

                    if (data.status === 'EXECUTED') {
                        const newExec = data.execution;
                        setExecutions(prev => [newExec, ...prev]);
                        setBrokerLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `SUCCESS: ${newExec.side} ${newExec.amount} ${newExec.asset_symbol} (Yield: ${newExec.projected_yield})` }, ...prev].slice(0, 10));
                        setBrokerStatus('TRADE_CONFIRMED_SEEKING_NEXT');
                    } else {
                        setBrokerLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `ABORTED: ${data.message}` }, ...prev].slice(0, 10));
                        setBrokerStatus('MARKET_VOLATILE_WAITING');
                    }
                } catch (e) {
                    setBrokerStatus('CONNECTION_INTERRUPTED');
                }
            }, 8000); // Try a trade every 8 seconds for the demo
        } else {
            setBrokerStatus('STANDBY');
        }

        return () => clearInterval(interval);
    }, [isBrokerActive, riskLevel]);

    const toggleBroker = () => {
        setIsBrokerActive(!isBrokerActive);
        if (!isBrokerActive) {
            setBrokerLog(prev => [{ time: new Date().toLocaleTimeString(), msg: 'AI Broker Initialized. Connecting to Llama Neural Net...' }, ...prev]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden font-sans relative">
            {/* Liquidity Heatmap Background Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="grid grid-cols-12 grid-rows-6 h-full w-full gap-1">
                    {[...Array(72)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                backgroundColor: ['#00F3FF', '#10b981', '#00F3FF'],
                                opacity: [0.1, 0.4, 0.1]
                            }}
                            transition={{
                                duration: Math.random() * 5 + 3,
                                repeat: Infinity,
                                delay: Math.random() * 5
                            }}
                            className="w-full h-full rounded-sm"
                        />
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full flex flex-col h-full space-y-10 relative z-10">

                {/* Armory Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-hyper-cyan/10 border border-hyper-cyan/30 flex items-center justify-center shadow-neon-cyan/20">
                            <Wallet className="w-8 h-8 text-hyper-cyan" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">The_Armory</h1>
                            <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-mono mt-1">Global_Financial_Execution_Interface</p>
                        </div>
                    </div>

                    <button
                        onClick={simulateConnection}
                        disabled={isConnecting}
                        className="group flex items-center gap-4 px-10 py-5 bg-white text-carbon-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-hyper-cyan hover:shadow-neon-cyan transition-all"
                    >
                        {isConnecting ? <RefreshCw className="animate-spin" /> : <Plus size={20} />}
                        <span>Arm_New_Wallet</span>
                    </button>
                </div>

                {/* Financial Grid */}
                <div className="grid lg:grid-cols-3 gap-8 flex-1 overflow-hidden">

                    {/* Portfolio Column */}
                    <div className="lg:col-span-2 space-y-8 overflow-y-auto custom-scrollbar pr-4">

                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 glass-v-series rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                <TrendingUp size={80} className="absolute -top-4 -right-4 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity" />
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Portfolio_Value</span>
                                <h2 className="text-3xl font-black text-white italic">
                                    ${portfolioValue > 0 ? portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '1,284,590.00'}
                                </h2>
                                <p className="text-[10px] text-emerald-500 font-black mt-4 uppercase tracking-widest">🛡️ Assets_Under_Sovereign_Control</p>
                            </div>
                            <div className="p-8 glass-v-series rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                <Zap size={80} className="absolute -top-4 -right-4 text-hyper-cyan opacity-5 group-hover:opacity-10 transition-opacity" />
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">Neural_Leverage</span>
                                <h2 className="text-3xl font-black text-white italic">1.0x</h2>
                                <p className="text-[10px] text-white/40 font-black mt-4 uppercase tracking-widest">Risk_Profile: REAL_ASSETS_ONLY</p>
                            </div>
                        </div>

                        {/* Asset Distribution Ring Header Overlay (Visual Only) */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 border-[20px] border-hyper-cyan/5 rounded-full pointer-events-none" />

                        {/* Neural Market Pulse Visualizer */}
                        <div className="p-8 glass-v-series rounded-[2.5rem] bg-hyper-cyan/[0.02] border border-hyper-cyan/10 relative overflow-hidden flex items-center justify-between group">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Neural_Market_Pulse</span>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse" />
                                        <div className="w-1.5 h-10 bg-emerald-500/60 rounded-full animate-pulse [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-8 bg-emerald-500/40 rounded-full animate-pulse [animation-delay:0.4s]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-white italic tracking-tighter">BULLISH_SENTIMENT</span>
                                        <span className="text-[8px] text-emerald-500 uppercase font-mono font-bold tracking-widest">Confidence: 94.2%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <span className="text-[8px] text-white/20 uppercase font-black">Volatility_Index</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Layers size={12} className="text-amber-500" />
                                        <span className="text-xs font-mono font-black text-white">LOW_VOL</span>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/5" />
                                <div className="text-right">
                                    <span className="text-[8px] text-white/20 uppercase font-black">Network_Nodes</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Target size={12} className="text-hyper-cyan" />
                                        <span className="text-xs font-mono font-black text-white">{systemStats.users}_Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-Time Trading Chart & Intelligence HUD */}
                        <div className="space-y-6">
                            <div className="p-8 glass-v-series rounded-[3rem] bg-white/[0.01] border border-hyper-cyan/10 relative overflow-hidden group min-h-[450px]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-hyper-cyan/5 rounded-full blur-[120px] pointer-events-none" />
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Neural_Price_Action_Node</h3>
                                        <p className="text-[8px] text-hyper-cyan/40 uppercase font-mono mt-1">Uplink: STABLE // Latency: 14ms</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-500 uppercase">Live</div>
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-white/40 uppercase tracking-widest font-mono italic">0x8F_FEED</div>
                                    </div>
                                </div>
                                <div className="relative z-10 w-full">
                                    <TradingViewChart />
                                </div>
                            </div>
                        </div>

                        {/* Arbitrage Opportunity Matrix */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <div className="flex items-center gap-3">
                                    <Target className="text-hyper-cyan" size={16} />
                                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Arb_Opportunity_Matrix</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isScanning && <RefreshCw size={10} className="text-hyper-cyan animate-spin" />}
                                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest italic">Scanning_Exchanges...</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {opportunities.map((opp, i) => (
                                    <motion.div
                                        key={opp.id || i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        className="p-5 glass-v-series rounded-2xl bg-white/[0.01] border border-white/5 hover:border-hyper-cyan/30 transition-all flex flex-col justify-between group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-white italic">{opp.pair}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[8px] text-white/30 uppercase font-mono">{opp.exchanges[0]}</span>
                                                    <ChevronRight size={8} className="text-white/10" />
                                                    <span className="text-[8px] text-emerald-400 uppercase font-mono">{opp.exchanges[1]}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-emerald-500 italic block">+{opp.spread.toFixed(2)}%</span>
                                                <span className="text-[7px] text-white/20 uppercase font-black">Spread</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] text-white/40 uppercase tracking-widest">Est_Profit</span>
                                                <span className="text-xs font-black text-white">${opp.expectedProfit.toFixed(2)}</span>
                                            </div>
                                            <button className="px-3 py-1.5 bg-hyper-cyan/10 border border-hyper-cyan/30 rounded-lg text-[8px] font-black text-hyper-cyan group-hover:bg-hyper-cyan group-hover:text-carbon-black transition-all">
                                                Execute
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Wallet Matrix */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Active_Wallets</h3>
                                <button onClick={fetchArmoryData} className="text-hyper-cyan hover:rotate-180 transition-transform"><RefreshCw size={14} /></button>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {displayWallets.map((w, i) => (
                                    <motion.div
                                        key={w.id || `wallet-${i}`}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-hyper-cyan/20 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                                                <Coins size={24} className="text-white/20 group-hover:text-hyper-cyan transition-colors" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{w.label || 'LINKED_NODE'}</span>
                                                <p className="text-[9px] font-mono text-white/20 mt-0.5">{w.address.slice(0, 6)}...{w.address.slice(-4)} // {w.chain}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest px-2 py-1 bg-emerald-500/10 rounded-lg">ARMED</span>
                                            <button className="p-3 text-white/10 hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Activity Column */}
                    <div className="glass-v-series rounded-[3rem] bg-white/[0.01] border border-white/10 p-8 flex flex-col h-full space-y-8">
                        <div className="flex items-center gap-3">
                            <History className="text-hyper-cyan" size={18} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Execution_Logs</h3>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                            {displayExecutions.map((ex, i) => (
                                <div key={ex.id || `exec-${i}`} className="relative pl-6 border-l border-white/5 space-y-2">
                                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 bg-hyper-cyan rounded-full shadow-neon-cyan" />
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase italic tracking-tighter",
                                            ex.side === 'BUY' ? 'text-emerald-400' : ex.side === 'SELL' ? 'text-rose-400' : 'text-hyper-cyan'
                                        )}>{ex.side}_{ex.asset_symbol}</span>
                                        <span className="text-[8px] font-mono text-white/20 uppercase">{new Date(ex.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-white italic">{ex.amount} {ex.asset_symbol}</span>
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{ex.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Strategic Action */}
                        <div className="pt-6 border-t border-white/5">
                            <button className="w-full py-5 bg-hyper-cyan/10 hover:bg-hyper-cyan text-hyper-cyan hover:text-carbon-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                                Initialize_Transaction
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* AI Auto-Broker Terminal */}
                <div className="w-full glass-v-series rounded-3xl bg-white/[0.01] border border-hyper-cyan/20 p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8 mt-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-hyper-cyan/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="lg:w-1/3 space-y-6">
                        <div className="flex items-center gap-4 border-b border-white/20 pb-4">
                            <div className="p-3 bg-hyper-cyan/10 rounded-xl relative">
                                <Bot className="text-hyper-cyan w-6 h-6" />
                                {isBrokerActive && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hyper-cyan opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-hyper-cyan"></span></span>}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-widest">Sovereign_AI_Broker</h3>
                                <p className="text-[9px] text-hyper-cyan uppercase font-mono mt-1">Status: {brokerStatus}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Risk_Tolerance_Parameters</label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRiskLevel(r)}
                                            disabled={isBrokerActive}
                                            className={cn(
                                                "py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border",
                                                riskLevel === r ? "bg-hyper-cyan text-carbon-black shadow-neon-cyan border-hyper-cyan" : "bg-white/[0.02] text-white/40 border-white/5 hover:border-hyper-cyan/30 disabled:opacity-50"
                                            )}
                                        >
                                            {r.slice(0, 4)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={toggleBroker}
                                className={cn(
                                    "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.3em] transition-all",
                                    isBrokerActive
                                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/40 hover:bg-rose-500 hover:text-white"
                                        : "bg-hyper-cyan text-carbon-black hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]"
                                )}
                            >
                                {isBrokerActive ? <><Square size={16} /> Terminate_Protocol</> : <><Play size={16} /> Engage_AI_Broker</>}
                            </button>
                        </div>
                    </div>

                    <div className="lg:w-2/3 bg-black/40 rounded-2xl border border-white/5 p-6 flex flex-col font-mono text-xs">
                        <div className="flex items-center gap-2 mb-4 text-hyper-cyan border-b border-white/5 pb-4">
                            <Activity size={14} />
                            <span className="uppercase tracking-widest font-black">Llama_3.3_Trading_Logs</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-white/60">
                            {brokerLog.length === 0 ? (
                                <span className="opacity-50">Awaiting engagement sequence...</span>
                            ) : brokerLog.map((log, i) => (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={`${log.time}-${i}`} className="flex gap-4">
                                    <span className="text-white/30 shrink-0">[{log.time}]</span>
                                    <span className={cn(
                                        "truncate",
                                        log.msg.includes('SUCCESS') ? 'text-emerald-400' : log.msg.includes('ABORTED') ? 'text-amber-400' : 'text-hyper-cyan'
                                    )}>{log.msg}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="flex justify-between items-center py-6 border-t border-white/5 mt-8">
                    <div className="flex flex-col gap-1 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-neon-emerald" />
                            Liquidity_Nexus: CONNECTED // Market_Synced
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <motion.div animate={{ width: ["10%", "60%", "40%"] }} transition={{ duration: 2, repeat: Infinity }} className="h-0.5 bg-hyper-cyan" />
                            <motion.div animate={{ width: ["20%", "40%", "70%"] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="h-0.5 bg-white/10" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={14} className="text-hyper-cyan" />
                        <span className="text-[8px] font-mono text-white/10 uppercase italic">Multi-Sig_Vault_Proxy: ACTIVE</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
