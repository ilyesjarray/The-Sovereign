'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';

type StoryItem = {
    id: string;
    user_id: string;
    media_url: string;
    media_type?: string;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string } | null;
};

interface StoryViewerProps {
    stories: StoryItem[];
    startIndex: number;
    onClose: () => void;
}

export function StoryViewer({ stories, startIndex, onClose }: StoryViewerProps) {
    const [idx, setIdx] = useState(startIndex);
    const [touchStart, setTouchStart] = useState(0);
    const story = stories[idx];

    const goNext = useCallback(() => {
        if (idx < stories.length - 1) setIdx(idx + 1);
        else onClose();
    }, [idx, stories.length, onClose]);

    const goPrev = useCallback(() => {
        if (idx > 0) setIdx(idx - 1);
    }, [idx]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNext, goPrev, onClose]);

    // Auto-advance after 8s for images
    useEffect(() => {
        if (story?.media_type !== 'VIDEO') {
            const t = setTimeout(goNext, 8000);
            return () => clearTimeout(t);
        }
    }, [idx, story, goNext]);

    if (!story) return null;

    const name = story.profiles?.full_name || 'COMMANDER';
    const avatar = story.profiles?.avatar_url;
    const ago = getTimeAgo(story.created_at);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
            onTouchStart={(e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e: React.TouchEvent) => {
                const diff = e.changedTouches[0].clientX - touchStart;
                if (diff < -50) goNext();
                else if (diff > 50) goPrev();
            }}
        >
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3 px-4">
                {stories.map((_, i) => (
                    <div key={i} className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${i < idx ? 'bg-white w-full' : i === idx ? 'bg-white w-full animate-[grow_8s_linear]' : 'w-0'}`} />
                    </div>
                ))}
            </div>

            {/* User info */}
            <div className="absolute top-8 left-4 z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden bg-white/10 flex items-center justify-center">
                    {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User size={18} className="text-white/40" />}
                </div>
                <div>
                    <div className="text-sm font-black text-white uppercase tracking-wide">{name}</div>
                    <div className="text-[10px] text-white/40 font-mono">{ago}</div>
                </div>
            </div>

            {/* Close */}
            <button onClick={onClose} className="absolute top-8 right-4 z-10 p-2 text-white/60 hover:text-white">
                <X size={24} />
            </button>

            {/* Nav arrows (desktop) */}
            {idx > 0 && (
                <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/40 rounded-full text-white/60 hover:text-white hidden md:flex">
                    <ChevronLeft size={24} />
                </button>
            )}
            {idx < stories.length - 1 && (
                <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/40 rounded-full text-white/60 hover:text-white hidden md:flex">
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Media */}
            <AnimatePresence mode="wait">
                <motion.div key={story.id} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center">
                    {story.media_type === 'VIDEO' ? (
                        <video src={story.media_url} autoPlay playsInline className="max-w-full max-h-full object-contain" onEnded={goNext} />
                    ) : (
                        <img src={story.media_url} alt="story" className="max-w-full max-h-full object-contain" />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
}
