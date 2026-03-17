'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Volume2,
    AudioLines,
    ShieldAlert,
    Radio,
    Zap,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SovereignVoice() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'EXECUTING'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 5));

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            addLog("ERROR: SPEECH_API_NOT_SUPPORTED");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US'; // English-only project
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setStatus('LISTENING');
            addLog("VOICE_UPLINK_ESTABLISHED");
        };

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            setStatus('PROCESSING');
            addLog(`RECEIVED: "${text}"`);

            // Dispatch Imperial Command to the System Core
            window.dispatchEvent(new CustomEvent('sovereign-command', {
                detail: { command: text.toLowerCase() }
            }));

            // Simulate Command Execution UI
            setTimeout(() => {
                setStatus('EXECUTING');
                addLog(`COMMAND_EXECUTED_BY_CORE`);
                setTimeout(() => {
                    setStatus('IDLE');
                    setIsListening(false);
                }, 1500);
            }, 1000);
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setStatus('IDLE');
            addLog(`ERROR: ${event.error.toUpperCase()}`);
        };

        recognition.onend = () => {
            setIsListening(false);
            if (status === 'LISTENING') setStatus('IDLE');
        };

        recognition.start();
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-10 overflow-hidden">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full space-y-12 items-center justify-center">

                {/* Voice Visualizer */}
                <div className="relative">
                    <AnimatePresence>
                        {isListening && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 bg-hyper-cyan/20 blur-3xl rounded-full"
                            />
                        )}
                    </AnimatePresence>

                    <button
                        onClick={isListening ? () => { } : startListening}
                        className={cn(
                            "relative w-48 h-48 rounded-full flex items-center justify-center border-2 transition-all duration-700",
                            isListening
                                ? "bg-hyper-cyan border-hyper-cyan shadow-neon-cyan scale-110"
                                : "bg-white/[0.02] border-white/10 hover:border-hyper-cyan/40 text-white/20 hover:text-hyper-cyan"
                        )}
                    >
                        {isListening ? (
                            <div className="flex gap-1 items-center h-12">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [12, 48, 12] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                        className="w-2 bg-carbon-black rounded-full"
                                    />
                                ))}
                            </div>
                        ) : (
                            <Mic size={64} />
                        )}
                    </button>
                </div>

                <div className="text-center space-y-4">
                    <h2 className={cn(
                        "text-3xl font-black italic tracking-tighter uppercase transition-colors",
                        status !== 'IDLE' ? "text-hyper-cyan" : "text-white/40"
                    )}>
                        {status === 'IDLE' && "Voice_Control_Standby"}
                        {status === 'LISTENING' && "Awaiting_Imperial_Command..."}
                        {status === 'PROCESSING' && "Analyzing_Neural_Patterns..."}
                        {status === 'EXECUTING' && "Executing_Strategic_Protocol..."}
                    </h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-mono">
                        Biometric_Voice_Sync: SECURE // Protocol: V4.0
                    </p>
                </div>

                {/* Transcript Area */}
                {transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl w-full text-center"
                    >
                        <span className="text-[8px] font-black text-hyper-cyan uppercase tracking-widest block mb-4">Live_Transcript</span>
                        <p className="text-xl font-bold text-white italic">"{transcript}"</p>
                    </motion.div>
                )}

                {/* Console Output */}
                <div className="w-full bg-black/40 rounded-[2rem] border border-white/5 p-8 space-y-4 font-mono">
                    <div className="flex items-center gap-3 text-white/20 text-[10px] uppercase tracking-widest border-b border-white/5 pb-4">
                        <Terminal size={14} />
                        Output_Stream
                    </div>
                    <div className="space-y-2 h-32 overflow-y-auto custom-scrollbar">
                        {logs.map((log, i) => (
                            <div key={i} className="text-[10px] flex gap-4">
                                <span className="text-white/10">[{new Date().toLocaleTimeString()}]</span>
                                <span className={cn(
                                    log.startsWith('ERROR') ? 'text-rose-500' : 'text-hyper-cyan/60'
                                )}>{'>'} {log}</span>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="text-white/5 italic uppercase tracking-widest text-[9px]">Awaiting Signal...</div>}
                    </div>
                </div>

                {/* Quick Commands Advice */}
                <div className="grid grid-cols-2 gap-6 w-full opacity-40">
                    <div className="flex items-center gap-4 p-4 border border-white/5 rounded-2xl">
                        <Zap size={16} className="text-hyper-cyan" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">"OPEN_VAULT"</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-white/5 rounded-2xl">
                        <Radio size={16} className="text-hyper-cyan" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">"SCOUT_REPORT"</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
