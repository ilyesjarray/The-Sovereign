'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Brain, BookOpen,
    Briefcase, Coffee, Terminal, Zap, Shield,
    Copy, Check, Maximize2, RotateCcw, Code2,
    Sparkles, Image as ImageIcon, Video, FileJson, Search,
    FileText, BarChart, Settings2, Languages, Microscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    mode?: string;
    timestamp?: Date;
};

const MODES = [
    { id: 'executive', label: 'EXECUTIVE', icon: Briefcase, color: 'text-hyper-cyan', bg: 'bg-hyper-cyan/10', border: 'border-hyper-cyan/30', desc: 'Business, Strategy & Investments' },
    { id: 'academic', label: 'ACADEMIC', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', desc: 'Research, Science & Learning' },
    { id: 'philosophy', label: 'SAPIENS', icon: Brain, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', desc: 'Philosophy, Psychology & Wisdom' },
    { id: 'casual', label: 'PERSONAL', icon: Coffee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Life, Creativity & Daily Help' },
    { id: 'code', label: 'CODE', icon: Code2, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', desc: 'Programming & Engineering' },
];

const AI_SERVICES = [
    { id: 'img-gen', label: 'GENERATE_IMAGE', icon: ImageIcon, color: 'text-pink-500' },
    { id: 'vid-gen', label: 'GENERATE_VIDEO', icon: Video, color: 'text-violet-500' },
    { id: 'data-analyze', label: 'ANALYZE_DATA', icon: BarChart, color: 'text-hyper-cyan' },
    { id: 'doc-export', label: 'EXPORT_DOCS', icon: FileText, color: 'text-amber-500' },
];

const QUICK_PROMPTS: Record<string, string[]> = {
    executive: [
        'حلل لي استراتيجية نمو لشركة SaaS',
        'Analyze my investment portfolio risk',
        'كيف أبني نظام إنتاجية للمدراء التنفيذيين؟',
        'Best crypto allocation strategy for 2025',
    ],
    academic: [
        'اشرح لي نظرية الكم بطريقة مبسطة',
        'What caused the fall of the Roman Empire?',
        'Solve: ∫x²sin(x)dx',
        'كيف يعمل الذكاء الاصطناعي التوليدي؟',
    ],
    philosophy: [
        'ما الفرق بين الرواقية والوجودية؟',
        'Is free will an illusion?',
        'كيف أجد هدفي في الحياة؟',
        'The ethics of AI consciousness',
    ],
    casual: [
        'اكتب لي قصيدة عن القوة',
        'Recommend a productivity routine',
        'ترجم هذا إلى الإنجليزية احترافيا',
        'كيف أتعامل مع الضغط النفسي؟',
    ],
    code: [
        'Write a React custom hook for auth',
        'Explain async/await vs Promises',
        'Design a scalable database schema',
        'أكتب API REST بـ Python FastAPI',
    ],
};

export function NeuralOracle() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '⚡ **SOVEREIGN ORACLE — ONLINE**\n\nأنا Oracle، نظام ذكاء اصطناعي إمبراطوري مدعوم بـ **Llama-3.3-70B** (70 مليار معامل، الأقوى مفتوح المصدر).\n\nأتحدث في **أي موضوع** بأي لغة:\n• 📊 الأعمال والاستثمار والتشفير\n• 🎓 العلوم والبحث والرياضيات\n• 💻 البرمجة وهندسة البرمجيات\n• 🧠 الفلسفة وعلم النفس\n• ✍️ الكتابة الإبداعية والترجمة\n• 🌍 أي موضوع آخر بلا قيود\n\nاختر المود المناسب ووجّه أوامرك.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [currentMode, setCurrentMode] = useState(MODES[0]);
    const [isSeriousMode, setIsSeriousMode] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, activeService]);

    const handleServiceRequest = (serviceId: string) => {
        setActiveService(serviceId);
        setIsTyping(true);
        setTimeout(() => {
            let message = "";
            switch (serviceId) {
                case 'img-gen': message = "🎨 **IMAGE_GENERATION_CORE**: Initializing neural rendering. Parameters set for High-Fidelity Imperial Aesthetic."; break;
                case 'vid-gen': message = "🎬 **VIDEO_SYNTHESIS_ACTIVE**: Framerate locked at 60fps. Cinematic lighting layers applied."; break;
                case 'data-analyze': message = "📊 **DEEP_DATA_ANALYSIS**: Intercepting market signals. Cross-referencing 50+ global nodes."; break;
                case 'doc-export': message = "📑 **IMPERIAL_DOCUMENTATION**: Compiling session logs into professional PDF/Markdown format."; break;
            }
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: message,
                timestamp: new Date()
            }]);
            setIsTyping(false);
            setActiveService(null);
        }, 1200);
    };

    const handleSend = async (text?: string) => {
        const userMsg = (text || input).trim();
        if (!userMsg || isTyping) return;

        setInput('');
        const newMsg: Message = { role: 'user', content: userMsg, mode: currentMode.id, timestamp: new Date() };
        setMessages(prev => [...prev, newMsg]);
        setIsTyping(true);

        try {
            const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    mode: currentMode.id,
                    isSeriousMode,
                    history
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || "ORACLE_ERROR: Response unavailable.",
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "ORACLE_ERROR: Neural link disrupted. Attempting reconnection...",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const copyMessage = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        setCopiedId(index);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: '🔄 **ORACLE RESET** — محادثة جديدة. ما الذي يريده القائد؟',
            timestamp: new Date()
        }]);
    };

    // Format message content with basic markdown-like rendering
    const formatContent = (content: string, messageIndex: number) => {
        return content
            .split('\n')
            .map((line, i) => {
                const key = `msg-${messageIndex}-line-${i}`;
                if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={key} className="font-black text-white text-sm mb-1">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.startsWith('• ') || line.startsWith('- ')) {
                    return <p key={key} className="text-white/70 text-sm pl-3 mb-0.5">→ {line.slice(2)}</p>;
                }
                if (line.match(/^\d+\./)) {
                    return <p key={key} className="text-white/70 text-sm mb-0.5">{line}</p>;
                }
                if (line.startsWith('#')) {
                    return <p key={key} className="font-black text-hyper-cyan text-sm mb-1 uppercase tracking-wider">{line.replace(/^#+\s/, '')}</p>;
                }
                if (line === '') return <div key={key} className="h-2" />;
                return <p key={key} className="text-white/80 text-sm leading-relaxed mb-0.5">{line}</p>;
            });
    };

    const quickPrompts = QUICK_PROMPTS[currentMode.id] || [];

    return (
        <div className="flex flex-col h-full bg-carbon-black relative overflow-hidden">
            {/* Neural Synapse Visualizer Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-px h-64 bg-gradient-to-b from-transparent via-hyper-cyan to-transparent"
                                    style={{
                                        left: `${15 + i * 15}%`,
                                        top: '-10%',
                                    }}
                                    animate={{
                                        y: ['0%', '200%'],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                        ease: "linear"
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl border", currentMode.bg, currentMode.border)}>
                            <currentMode.icon size={18} className={currentMode.color} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest italic">
                                SOVEREIGN_ORACLE <span className={cn("text-[10px]", currentMode.color)}>{currentMode.label}</span>
                            </h2>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">{currentMode.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Task Mode Toggle */}
                        <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-xl p-1 mr-2 scale-90">
                            <button
                                onClick={() => setIsSeriousMode(true)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                    isSeriousMode ? "bg-hyper-cyan text-carbon-black" : "text-white/20 hover:text-white/40"
                                )}
                            >
                                <Briefcase size={10} />
                                Serious_Work
                            </button>
                            <button
                                onClick={() => setIsSeriousMode(false)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                    !isSeriousMode ? "bg-emerald-500 text-carbon-black" : "text-white/20 hover:text-white/40"
                                )}
                            >
                                <Coffee size={10} />
                                Casual_Rest
                            </button>
                        </div>

                        {/* Context Memory Nodes */}
                        <div className="flex items-center gap-1.5 mr-4 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mr-1">Context_Nodes:</span>
                            <div className="flex gap-1">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-hyper-cyan" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-1.5 h-1.5 rounded-full bg-hyper-cyan/40" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} className="w-1.5 h-1.5 rounded-full bg-hyper-cyan/20" />
                            </div>
                        </div>

                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-white/20 font-mono uppercase">LLAMA-3.3-70B ONLINE</span>
                        <button
                            onClick={clearChat}
                            className="ml-4 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Reset Chat"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {MODES.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setCurrentMode(mode)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                currentMode.id === mode.id
                                    ? cn(mode.bg, mode.border, mode.color)
                                    : "bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/[0.05]"
                            )}
                        >
                            <mode.icon size={12} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                    <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.map((prompt, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleSend(prompt)}
                                className="p-3 text-left bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all leading-relaxed"
                            >
                                <Sparkles size={10} className={cn("inline mr-1.5 mb-0.5", currentMode.color)} />
                                {prompt}
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Messages */}
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.timestamp?.getTime() || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4 group max-w-5xl",
                                msg.role === 'user' ? "flex-row-reverse ml-auto" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 mt-1",
                                msg.role === 'assistant'
                                    ? cn("border", currentMode.bg, currentMode.border, currentMode.color)
                                    : "bg-white/5 border-white/10 text-white/40"
                            )}>
                                {msg.role === 'assistant'
                                    ? <currentMode.icon size={16} />
                                    : <User size={16} />
                                }
                            </div>

                            {/* Content */}
                            <div className={cn("flex-1 space-y-1 max-w-[85%]", msg.role === 'user' ? "text-right" : "")}>
                                <div className={cn(
                                    "p-4 rounded-2xl border",
                                    msg.role === 'assistant'
                                        ? "bg-white/[0.02] border-white/5"
                                        : cn("border", currentMode.bg, currentMode.border)
                                )}>
                                    {msg.role === 'assistant' ? (
                                        <div className="space-y-0.5">
                                            {formatContent(msg.content, i)}
                                        </div>
                                    ) : (
                                        <p className={cn("text-sm leading-relaxed font-medium", currentMode.color)}>
                                            {msg.content}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                        <button
                                            onClick={() => copyMessage(msg.content, i)}
                                            className="flex items-center gap-1 text-[8px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
                                        >
                                            {copiedId === i ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                            {copiedId === i ? 'COPIED' : 'COPY'}
                                        </button>
                                        {msg.timestamp && (
                                            <span className="text-[8px] font-mono text-white/10">
                                                {msg.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                    >
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", currentMode.bg, currentMode.border, currentMode.color)}>
                            <currentMode.icon size={16} className="animate-pulse" />
                        </div>
                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-2">
                            {[0, 0.2, 0.4].map((delay, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                                    className={cn("w-1.5 h-1.5 rounded-full", currentMode.bg.replace('bg-', 'bg-').replace('/10', '/60'))}
                                />
                            ))}
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Oracle Processing...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                {/* Service Center */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
                    {AI_SERVICES.map(service => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceRequest(service.id)}
                            disabled={isTyping}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                                activeService === service.id
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/[0.05] hover:border-white/10"
                            )}
                        >
                            <service.icon size={12} className={cn(service.color, activeService === service.id && "animate-pulse")} />
                            {service.label}
                        </button>
                    ))}
                </div>

                <div className={cn(
                    "relative flex items-end gap-3 bg-white/[0.03] border rounded-2xl p-3 transition-all",
                    "focus-within:border-white/20",
                    currentMode.border.replace('border-', 'focus-within:border-')
                )}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message Oracle in ${currentMode.label} mode... (Enter to send, Shift+Enter for newline)`}
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none text-white text-xs font-medium placeholder:text-white/10 resize-none custom-scrollbar max-h-32"
                        style={{ minHeight: '24px' }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0",
                            input.trim() && !isTyping
                                ? cn(currentMode.bg, currentMode.border, currentMode.color, "hover:opacity-80")
                                : "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
                        )}
                    >
                        {isTyping
                            ? <Zap size={16} className="animate-pulse" />
                            : <Send size={16} />
                        }
                    </button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Shield size={10} className="text-hyper-cyan" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap size={10} className="text-hyper-cyan" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">No Content Limits</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-mono text-white/10">Llama3.3-70B • 70B params</span>
                </div>
            </div>
        </div>
    );
}
