'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface SoundContextType {
    playClick: () => void;
    toggleMusic: () => void;
    isMusicPlaying: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const clickRefs = useRef<(HTMLAudioElement | null)[]>([]);

    useEffect(() => {
        // Initialize music
        musicRef.current = new Audio('/assets/theme-music.mp3');
        musicRef.current.loop = true;
        musicRef.current.volume = 0.3;

        // Initialize click sounds
        const sounds = ['/assets/click-sound1.wav', '/assets/click-sound2.wav'];
        clickRefs.current = sounds.map(src => {
            const audio = new Audio(src);
            audio.volume = 0.2;
            return audio;
        });

        return () => {
            musicRef.current?.pause();
            musicRef.current = null;
        };
    }, []);

    const ensureMusicStarted = () => {
        if (musicRef.current && !isMusicPlaying) {
            musicRef.current.play().then(() => {
                setIsMusicPlaying(true);
            }).catch(() => {
                // Interaction still required
            });
        }
    };

    const playClick = () => {
        ensureMusicStarted(); // Try to start music on first click
        const randomIndex = Math.floor(Math.random() * clickRefs.current.length);
        const sound = clickRefs.current[randomIndex];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    };

    const toggleMusic = () => {
        if (!musicRef.current) return;

        if (isMusicPlaying) {
            musicRef.current.pause();
            setIsMusicPlaying(false);
        } else {
            musicRef.current.play().then(() => {
                setIsMusicPlaying(true);
            }).catch(() => {
                console.warn('Audio playback failed - interaction required');
            });
        }
    };

    return (
        <SoundContext.Provider value={{ playClick, toggleMusic, isMusicPlaying }}>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};
