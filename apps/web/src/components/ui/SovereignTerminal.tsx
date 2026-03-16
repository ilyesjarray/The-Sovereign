'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Search, Cpu, ShieldCheck } from 'lucide-react';

export function SovereignTerminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState<string[]>(['[SYSTEM_AUTH] SOVEREIGN_INTELLIGENCE_LAYER_V4_READY', '[CMD_LINK] ENCRYPTED_OVERLAY_SYNCHRONIZED']);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleCommand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const cmd = input.trim().toLowerCase();
        let response = `[PROCESS_ERROR] UNKNOWN_VECTOR_IDENTIFIED: ${cmd}`;

        setLogs(prev => [...prev.slice(-10), `> ${input}`]);
        setIsProcessing(true);

        setTimeout(() => {
            if (cmd.startsWith('query')) {
                response = `[RESULT] ANALYSIS_ACK: ${cmd.split(' ')[1] || 'GLOBAL'} - 99.9%_MATRIX_CONFIDENCE`;
            } else if (cmd === 'clear') {
                setLogs([]);
                setInput('');
                setIsProcessing(false);
                return;
            } else if (cmd === 'status') {
                response = '[SYSTEM] CORES_ACTIVE // LATENCY: 2ms // ENCRYPTION: AES_256';
            } else if (cmd === 'running') {
                response = '[LOG] ALL_AUTONOMOUS_TASKS_STABLE';
            }

            setLogs(prev => [...prev, response]);
            setIsProcessing(false);
            setInput('');
        }, 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="w-full max-w-2xl bg-black border border-neon-blue/20 shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden font-mono"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-neon-blue/10 bg-navy-stealth/20">
                            <div className="flex items-center gap-3">
                                <TerminalIcon className="w-4 h-4 text-neon-blue" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-blue/60">SOVEREIGN_COMMAND_TERMINAL</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[8px] text-neon-blue/20 font-black tracking-widest uppercase">ENCRYPTION: ACTIVE</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-3 h-72 overflow-y-auto text-[10px] custom-scrollbar bg-black/20">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-4 ${log.startsWith('>') ? 'text-neon-blue' : 'text-sovereign-blue/40 italic'}`}>
                                    <span className="shrink-0 font-black">{log.startsWith('>') ? '>>>' : '::'}</span>
                                    <p className="tracking-widest uppercase">{log}</p>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleCommand} className="p-5 bg-black border-t border-neon-blue/10 flex items-center gap-5">
                            <Search className="w-4 h-4 text-neon-blue/30" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isProcessing}
                                placeholder={isProcessing ? "PROCESSING_OPERATION..." : "IDENTIFY_COMMAND_VECTOR..."}
                                className={`bg-transparent border-none outline-none flex-1 text-neon-blue font-black text-xs tracking-[0.2em] placeholder:text-neon-blue/10 ${isProcessing ? 'opacity-50' : ''}`}
                            />
                            <div className="flex gap-3">
                                <Cpu className="w-3.5 h-3.5 text-neon-blue/30" />
                                <ShieldCheck className="w-3.5 h-3.5 text-neon-blue/30" />
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
