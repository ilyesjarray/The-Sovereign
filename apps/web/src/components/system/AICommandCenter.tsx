'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Cpu, Shield, Loader2, User, Bot, Volume2 } from 'lucide-react';
import { useVocal } from '@/providers/VocalProvider';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AICommandCenter() {
    const { speak } = useVocal();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
        const allMessages = [...messages, userMessage];
        setMessages(allMessages);
        setInput('');
        setIsLoading(true);

        const assistantId = Date.now().toString() + '_ai';
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        try {
            abortRef.current = new AbortController();
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })) }),
                signal: abortRef.current.signal,
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let full = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                full += chunk;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m));
            }

            speak(full);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setMessages(prev => prev.map(m => m.id === assistantId
                    ? { ...m, content: 'DATA INSUFFICIENT. Neural link disrupted. Retry.' }
                    : m
                ));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Neural Interface</h3>
                        <div className="flex items-center gap-1.5 text-[8px] text-cyan-400/60 uppercase font-mono">
                            <span className="h-1 w-1 rounded-full bg-cyan-500 animate-pulse" />
                            Direct Satellite Link // Active
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">Encrypted</span>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]"
                        >
                            <div className="p-4 rounded-full bg-white/5 border border-white/5">
                                <Bot className="w-8 h-8 text-cyan-500/40" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Awaiting Command</p>
                                <p className="text-[10px] text-zinc-600 max-w-[200px] italic">
                                    "Commander, I am ready to process strategic queries."
                                </p>
                            </div>
                        </motion.div>
                    )}
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-zinc-800 border-white/10' : 'bg-cyan-500/10 border-cyan-500/20'
                                    }`}>
                                    {m.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-cyan-400" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                        ? 'bg-zinc-900 text-white rounded-tr-none border border-white/5 font-medium'
                                        : 'bg-white/5 text-cyan-50 border border-white/5 rounded-tl-none font-mono text-[13px]'
                                    }`}>
                                    {m.content || (isLoading && m.role === 'assistant' && (
                                        <span className="inline-flex gap-1">
                                            <span className="animate-bounce delay-0">.</span>
                                            <span className="animate-bounce delay-100">.</span>
                                            <span className="animate-bounce delay-200">.</span>
                                        </span>
                                    ))}
                                    {m.role !== 'user' && m.content && (
                                        <button
                                            onClick={() => speak(m.content)}
                                            className="mt-2 text-[9px] flex items-center gap-1.5 text-cyan-400/40 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                                        >
                                            <Volume2 className="w-3 h-3" /> Re-Transmit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3 text-cyan-400/60 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-mono uppercase tracking-widest">Processing Intelligence...</span>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-6 pt-0">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex items-center gap-2 bg-zinc-900/80 border border-white/10 rounded-xl p-2 pr-3 focus-within:border-cyan-500/50 transition-all">
                        <div className="pl-3 py-2 border-r border-white/10 mr-2">
                            <Terminal className="w-4 h-4 text-zinc-500" />
                        </div>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Enter command or query..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 font-mono"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 p-2 rounded-lg transition-all border border-cyan-500/20 disabled:opacity-30"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    <span>Press Enter to Launch Mission</span>
                    <span>AI Model: GPT-4o // Imperial Secure</span>
                </div>
            </form>
        </div>
    );
}
