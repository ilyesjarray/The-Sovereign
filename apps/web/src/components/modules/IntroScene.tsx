'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

export function IntroScene({ onComplete }: { onComplete?: () => void }) {
    const [shouldPlay, setShouldPlay] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [requiresTap, setRequiresTap] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        // Check if intro has already been played
        const hasPlayed = localStorage.getItem('sovereign_intro_played');
        if (hasPlayed === 'true') {
            setIsFinished(true);
            if (onComplete) onComplete();
            return;
        }

        setShouldPlay(true);
    }, []);

    useEffect(() => {
        if (!shouldPlay || isFinished) return;

        // Attempt Fullscreen and Landscape lock
        const goFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }

                // @ts-ignore - Some browsers support this
                if (screen.orientation && screen.orientation.lock) {
                    // @ts-ignore
                    await screen.orientation.lock('landscape').catch(() => {
                        // Ignore lock errors (common on desktop or unsupported iOS)
                    });
                }
            } catch (err) {
                console.warn('Fullscreen/Landscape lock failed:', err);
            }
        };

        goFullscreen();

        // Attempt autoplay
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                console.warn('Autoplay blocked, user tap required:', e);
                setRequiresTap(true);
            });
        }
    }, [shouldPlay, isFinished]);

    const handleManualPlay = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setRequiresTap(false);
            }).catch(e => console.error("Still blocked:", e));
        }
    };

    const handleComplete = async () => {
        setIsFinished(true);
        localStorage.setItem('sovereign_intro_played', 'true');

        // Attempt to exit fullscreen if we entered it
        if (document.fullscreenElement) {
            await document.exitFullscreen().catch(() => { });
        }

        // @ts-ignore
        if (screen.orientation && screen.orientation.unlock) {
            // @ts-ignore
            screen.orientation.unlock();
        }

        if (onComplete) onComplete();
    };

    if (isFinished || !shouldPlay) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
            >
                <video
                    ref={videoRef}
                    src="/assets/intro.mp4"
                    playsInline
                    disablePictureInPicture
                    onEnded={handleComplete}
                    className="absolute w-full h-full object-cover portrait:w-[100dvh] portrait:h-[100dvw] portrait:max-w-none portrait:rotate-90 pointer-events-none select-none"
                />

                {requiresTap && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm portrait:w-[100dvh] portrait:h-[100dvw] portrait:rotate-90 portrait:max-w-none"
                    >
                        <button 
                            onClick={handleManualPlay}
                            className="group flex flex-col items-center justify-center gap-6 p-8"
                        >
                            <div className="w-24 h-24 rounded-full border-2 border-[#00c3ff]/30 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all shadow-[0_0_30px_rgba(0,195,255,0.2)]">
                                <Fingerprint className="w-12 h-12 text-[#00c3ff] animate-pulse" />
                            </div>
                            <span className="text-[#00c3ff] font-mono tracking-[0.5em] text-sm uppercase">Tap to Initialize</span>
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
