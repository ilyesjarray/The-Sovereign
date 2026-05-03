'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroScene() {
    const [shouldPlay, setShouldPlay] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if intro has already been played
        const hasPlayed = localStorage.getItem('sovereign_intro_played');
        if (hasPlayed === 'true') {
            setIsFinished(true);
            return;
        }

        setShouldPlay(true);
    }, []);

    useEffect(() => {
        if (!shouldPlay || isFinished) return;

        // Play audio
        if (audioRef.current) {
            audioRef.current.volume = 1.0;
            audioRef.current.play().catch(e => console.warn('Audio play failed (gesture required):', e));
        }

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

        // No timer needed - we rely on the video's onEnded event
    }, [shouldPlay, isFinished]);

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
    };

    if (isFinished || !shouldPlay) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
            >
                <video
                    src="/assets/intro.mp4"
                    autoPlay
                    playsInline
                    disablePictureInPicture
                    onEnded={handleComplete}
                    className="w-full h-full object-cover portrait:object-contain landscape:object-cover pointer-events-none select-none"
                />
            </motion.div>
        </AnimatePresence>
    );
}
