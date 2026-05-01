'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Brain, BookOpen,
    Briefcase, Coffee, Terminal, Zap, Shield,
    Copy, Check, Maximize2, RotateCcw, Code2, X,
    Sparkles, Image as ImageIcon, Video, FileJson, Search,
    FileText, BarChart, Settings2, Languages, Microscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    mode?: string;
    images?: string[];
    timestamp?: Date;
};

const MODES = [
    { id: 'recon', label: 'RECON_MODE', icon: Search, color: 'text-hyper-cyan', bg: 'bg-hyper-cyan/10', border: 'border-hyper-cyan/30', desc: 'General Image Analysis' },
    { id: 'data', label: 'DATA_EXTRACTION', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'Text & Chart Parsing' },
];

const AI_SERVICES = [
    { id: 'img-gen', label: 'GENERATE_IMAGE', icon: ImageIcon, color: 'text-pink-500' },
    { id: 'vid-gen', label: 'GENERATE_VIDEO', icon: Video, color: 'text-violet-500' },
    { id: 'data-analyze', label: 'ANALYZE_DATA', icon: BarChart, color: 'text-hyper-cyan' },
];

const QUICK_PROMPTS: Record<string, string[]> = {
    recon: [
        'Analyze this image in deep detail',
        'Identify the key components here',
    ],
    data: [
        'Extract all text from this document',
        'Summarize the data in this chart',
    ],
};

export function VisionScout() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: '**VISION SCOUT — ONLINE**\n\nI am Scout, a specialized neural node powered by the **Llama 4 Scout Vision Engine**.\n\nI am engineered specifically for **High-Speed Image-to-Text Intelligence**:\n• Document & Text Extraction\n• Chart & Graph Analysis\n• Component & System Identification\n\nUpload up to 3 visual assets and issue your command.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [currentMode, setCurrentMode] = useState(MODES[0]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedImages.length + files.length > 3) {
            alert("COMMAND_ABORTED: Maximum 3 images per transmission.");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 800;

                    if (width > height && width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                        setSelectedImages(prev => [...prev, compressedBase64]);
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        });
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

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
                case 'img-gen': message = "🎨 **IMAGE_GENERATION_CORE**: Routing to Synthesis Engine..."; break;
                case 'vid-gen': message = "🎬 **VIDEO_SYNTHESIS_ACTIVE**: Routing to Temporal Engine..."; break;
                case 'data-analyze': message = "📊 **DATA_ANALYSIS**: Please upload charts or datasets for immediate extraction."; break;
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
        if ((!userMsg && selectedImages.length === 0) || isTyping) return;

        setInput('');
        const newMsg: Message = { role: 'user', content: userMsg || 'Analyze this image.', mode: currentMode.id, images: selectedImages, timestamp: new Date() };
        setMessages(prev => [...prev, newMsg]);
        setIsTyping(true);
        const imagesToSend = [...selectedImages];
        setSelectedImages([]);

        try {
            const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/ai/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg || 'Analyze this image.',
                    mode: currentMode.id,
                    history,
                    images: imagesToSend
                })
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || "SCOUT_ERROR: Response unavailable.",
                timestamp: new Date()
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "SCOUT_ERROR: Neural link disrupted. Attempting reconnection...",
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
            content: 'SCOUT RESET — Initializing new session. Awaiting visual input.',
            timestamp: new Date()
        }]);
    };

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
                                    className="absolute w-px h-64 bg-gradient-to-b from-transparent via-emerald-400 to-transparent"
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

            <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl border", currentMode.bg, currentMode.border)}>
                            <currentMode.icon size={18} className={currentMode.color} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-widest italic">
                                VISION_SCOUT <span className={cn("text-[10px]", currentMode.color)}>{currentMode.label}</span>
                            </h2>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">{currentMode.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-white/20 font-mono uppercase">LLAMA-4-SCOUT ONLINE</span>
                        <button
                            onClick={clearChat}
                            className="ml-4 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Reset Chat"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                </div>

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

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.length <= 1 && (
                    <div className="grid grid-cols-2 gap-2">
                        {quickPrompts.map((prompt, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setInput(prompt)}
                                className="p-3 text-left bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all leading-relaxed"
                            >
                                <Sparkles size={10} className={cn("inline mr-1.5 mb-0.5", currentMode.color)} />
                                {prompt}
                            </motion.button>
                        ))}
                    </div>
                )}

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

                            <div className={cn("flex-1 space-y-2 max-w-[85%]", msg.role === 'user' ? "text-right" : "")}>
                                {msg.images && msg.images.length > 0 && (
                                    <div className={cn("flex gap-2 flex-wrap", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                        {msg.images.map((img, idx) => (
                                            <div key={idx} className="w-32 h-32 rounded-xl border border-white/10 overflow-hidden">
                                                <img src={img} alt="uploaded" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
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
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Scout Processing...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                {selectedImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                        {selectedImages.map((img, i) => (
                            <div key={i} className="relative group/img w-16 h-16 rounded-lg border border-white/10 overflow-hidden">
                                <img src={img} alt="preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => removeImage(i)}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className={cn(
                    "relative flex items-end gap-3 bg-white/[0.03] border rounded-2xl p-3 transition-all",
                    currentMode.border.replace('/30', '/10'),
                    "focus-within:border-hyper-cyan/40"
                )}>
                    <input 
                        type="file" 
                        ref={imageInputRef} 
                        onChange={handleImageUpload} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => imageInputRef.current?.click()}
                        disabled={selectedImages.length >= 3 || isTyping}
                        className="p-2 text-white/20 hover:text-emerald-400 transition-colors"
                    >
                        <ImageIcon size={20} />
                    </button>

                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="INPUT_VISUAL_COMMAND..."
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-white/10 resize-none py-2 min-h-[40px] max-h-[200px] custom-scrollbar"
                        rows={1}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={(!input.trim() && selectedImages.length === 0) || isTyping}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0",
                            (input.trim() || selectedImages.length > 0) && !isTyping
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
                            <Shield size={10} className="text-emerald-400" />
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">End-to-End Encrypted</span>
                        </div>
                    </div>
                    <span className="text-[8px] font-mono text-white/10">Llama4-Scout | Image-to-Text Mode</span>
                </div>
            </div>
        </div>
    );
}
