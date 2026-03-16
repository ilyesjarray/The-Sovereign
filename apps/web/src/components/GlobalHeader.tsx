'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, Activity, Sun, Moon, TrendingUp, TrendingDown } from 'lucide-react';

export function GlobalHeader() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [btcChange, setBtcChange] = useState<number>(0);
  const [latency, setLatency] = useState(12);

  // Live BTC price from Binance REST (lightweight poll every 10s)
  useEffect(() => {
    const fetchBTC = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        setLatency(Date.now() - t0);
        const d = await res.json();
        setBtcPrice(parseFloat(d.lastPrice));
        setBtcChange(parseFloat(d.priceChangePercent));
      } catch (_) { }
    };
    fetchBTC();
    const interval = setInterval(fetchBTC, 10000);
    return () => clearInterval(interval);
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <header className="h-20 px-8 flex items-center justify-between bg-carbon-black/60 backdrop-blur-3xl border-b border-white/5 relative z-40">

      {/* Left: Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-hyper-cyan/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4 group-focus-within:text-hyper-cyan transition-colors" />
          <input
            type="text"
            placeholder="SEARCH_COMMANDS_AND_NODES..."
            className="w-full bg-transparent border-none outline-none py-2 pl-8 text-[11px] font-black uppercase tracking-[0.2em] text-white placeholder:text-white/10 focus:placeholder:text-white/20 transition-all font-mono italic"
          />
        </div>
      </div>

      {/* Center: Live BTC Ticker */}
      <div className="hidden lg:flex items-center gap-3 px-6 py-2 rounded-xl bg-white/[0.02] border border-white/5 mx-6">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/30 font-mono">BTC/USDT</span>
        {btcPrice ? (
          <>
            <span className="text-sm font-black text-white italic font-mono">
              ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className={`text-[10px] font-black flex items-center gap-1 ${btcChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {btcChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
            </span>
          </>
        ) : (
          <span className="text-[10px] text-white/20 font-mono animate-pulse">LIVE...</span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-6">

        {/* Neural Latency */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[8px] text-white/20 uppercase font-black tracking-widest font-mono italic">Neural_Latency</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-hyper-cyan italic">{latency}ms</span>
            <Activity size={14} className="text-hyper-cyan animate-pulse" />
          </div>
        </div>

        <div className="w-px h-8 bg-white/5" />

        {/* Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 text-white/30 hover:text-hyper-cyan transition-colors rounded-lg hover:bg-white/5"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </motion.button>

        {/* Notifications */}
        <button className="relative p-2 text-white/30 hover:text-hyper-cyan transition-colors group">
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-hyper-cyan rounded-full shadow-neon-cyan animate-ping" />
        </button>

        {/* User */}
        <div className="flex items-center gap-4 glass-v-series px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:border-hyper-cyan/20 transition-all cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-hyper-cyan/10 flex items-center justify-center border border-hyper-cyan/20 group-hover:shadow-neon-cyan transition-all">
            <User size={16} className="text-hyper-cyan" />
          </div>
          <div className="hidden lg:flex flex-col items-start pr-2">
            <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">Imperial_User</span>
            <span className="text-[8px] text-hyper-cyan font-bold uppercase tracking-widest font-mono">Elite_Level</span>
          </div>
        </div>
      </div>
    </header>
  );
}
