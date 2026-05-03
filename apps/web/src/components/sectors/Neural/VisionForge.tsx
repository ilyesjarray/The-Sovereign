'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Image as ImageIcon, Settings2, Loader2, AlertTriangle, Layers, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        puter: any;
    }
}

const MODELS = [
    { id: 'black-forest-labs/flux-1.1-pro', name: 'Flux 1.1 Pro', group: 'Black Forest Labs' },
    { id: 'black-forest-labs/flux-schnell', name: 'Flux.1 Schnell', group: 'Black Forest Labs' },
    { id: 'stabilityai/stable-diffusion-3-medium', name: 'Stable Diffusion 3', group: 'Stability AI' },
    { id: 'dall-e-3', name: 'DALL-E 3', group: 'OpenAI' },
    { id: 'gpt-image-2', name: 'GPT Image 2', group: 'OpenAI' },
    { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', group: 'Google' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', group: 'Google' },
    { id: 'google/imagen-4.0-ultra', name: 'Imagen 4.0 Ultra', group: 'Google' },
    { id: 'ideogram/ideogram-3.0', name: 'Ideogram 3.0', group: 'Ideogram' },
    { id: 'RunDiffusion/Juggernaut-pro-flux', name: 'Juggernaut Pro Flux', group: 'RunDiffusion' },
    { id: 'Lykon/DreamShaper', name: 'DreamShaper', group: 'Lykon' },
];

export function VisionForge() {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
    const [quality, setQuality] = useState('standard');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<{ url: string; prompt: string; model: string }[]>([]);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        if (typeof window === 'undefined' || !window.puter) {
            setError('VISION_CORE_OFFLINE: Engine not loaded.');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const options: any = { model: selectedModel };
            
            // Add quality settings if supported by the model
            if (selectedModel.startsWith('dall-e-3')) {
                options.quality = quality === 'high' ? 'hd' : 'standard';
            } else if (selectedModel.startsWith('gpt-image')) {
                options.quality = quality === 'high' ? 'high' : quality === 'low' ? 'low' : 'medium';
            }

            const imageElement = await window.puter.ai.txt2img(prompt, options);
            
            // Convert the returned HTMLImageElement to a data URL so we can save and display it in our React state
            const canvas = document.createElement('canvas');
            canvas.width = imageElement.naturalWidth || imageElement.width;
            canvas.height = imageElement.naturalHeight || imageElement.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(imageElement, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                setGeneratedImages(prev => [{ url: dataUrl, prompt, model: selectedModel }, ...prev]);
            } else {
                // Fallback if canvas fails
                setGeneratedImages(prev => [{ url: imageElement.src, prompt, model: selectedModel }, ...prev]);
            }
            
        } catch (err: any) {
            console.error('Generation Error:', err);
            setError(err.message || 'SYNTHESIS_FAILED: Unable to generate image.');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = (url: string, promptText: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `VISION_FORGE_${promptText.slice(0, 15).replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex flex-col h-full bg-carbon-black p-4 lg:p-10 font-sans overflow-hidden relative">
            <div className="max-w-6xl mx-auto w-full h-full flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                            <ImageIcon className="text-hyper-cyan" />
                            Vision_Forge
                        </h1>
                        <p className="text-[10px] text-hyper-cyan uppercase tracking-[0.4em] font-mono mt-1">Neural_Image_Synthesis // Level_9</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                    
                    {/* Left Panel: Controls */}
                    <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
                        
                        {/* Prompt Input */}
                        <div className="glass-v-series p-6 rounded-[2rem] border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="text-hyper-cyan" />
                                    Visual_Directive
                                </label>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the visual parameters for synthesis..."
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 resize-none outline-none focus:border-hyper-cyan/50 transition-colors custom-scrollbar"
                            />
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className={cn(
                                    "w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                                    isGenerating || !prompt.trim() 
                                        ? "bg-white/5 text-white/20 cursor-not-allowed" 
                                        : "bg-hyper-cyan text-carbon-black hover:shadow-neon-cyan"
                                )}
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                                {isGenerating ? 'Synthesizing...' : 'Initialize_Render'}
                            </motion.button>
                        </div>

                        {/* Configuration */}
                        <div className="glass-v-series p-6 rounded-[2rem] border border-white/5 space-y-6">
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest pb-4 border-b border-white/5">
                                <Settings2 size={12} className="text-hyper-cyan" />
                                Render_Engine_Config
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Neural_Model</label>
                                <select 
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white outline-none focus:border-hyper-cyan/50 appearance-none cursor-pointer"
                                >
                                    {MODELS.map(model => (
                                        <option key={model.id} value={model.id} className="bg-carbon-black text-white">
                                            {model.group}: {model.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {(selectedModel.startsWith('dall-e-3') || selectedModel.startsWith('gpt-image')) && (
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Render_Quality</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['low', 'standard', 'high'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setQuality(q)}
                                                className={cn(
                                                    "py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                                                    quality === q 
                                                        ? "bg-hyper-cyan/10 border-hyper-cyan text-hyper-cyan" 
                                                        : "bg-black/40 border-white/5 text-white/30 hover:border-white/20"
                                                )}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex gap-3 text-rose-500 text-xs font-medium">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Gallery */}
                    <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest mb-6">
                            <Layers size={12} className="text-hyper-cyan" />
                            Render_Archive
                        </div>

                        {generatedImages.length === 0 && !isGenerating ? (
                            <div className="h-64 flex flex-col items-center justify-center text-white/20 border-2 border-dashed border-white/5 rounded-2xl">
                                <ImageIcon size={32} className="mb-4 opacity-50" />
                                <p className="text-xs font-medium uppercase tracking-widest">Archive_Empty</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AnimatePresence>
                                    {isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-hyper-cyan relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-hyper-cyan/10 to-transparent animate-pulse" />
                                            <Loader2 className="animate-spin mb-4" size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Rendering...</span>
                                        </motion.div>
                                    )}
                                    {generatedImages.map((img, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group relative aspect-square rounded-2xl bg-black/40 border border-white/10 overflow-hidden"
                                        >
                                            <img src={img.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                <p className="text-xs text-white line-clamp-2 font-medium mb-1">{img.prompt}</p>
                                                <p className="text-[8px] text-hyper-cyan uppercase tracking-widest font-mono mb-4">{img.model}</p>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setFullscreenImage(img.url)}
                                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Maximize size={12} /> View
                                                    </button>
                                                    <button 
                                                        onClick={() => downloadImage(img.url, img.prompt)}
                                                        className="flex-1 bg-hyper-cyan/20 hover:bg-hyper-cyan text-hyper-cyan hover:text-black border border-hyper-cyan/30 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <Download size={12} /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {fullscreenImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setFullscreenImage(null)}
                    >
                        <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
