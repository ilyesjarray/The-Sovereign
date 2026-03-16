'use client';

import { useCallback, useRef } from 'react';

// Institutional Grade Synthetic UI Sounds
// Note: In a real prod env, these would be high-quality WAV/MP3 files.
// Here we use the web audio API for procedural generation (keeping it "light").

export const useSovereignSound = () => {
    const audioCtx = useRef<AudioContext | null>(null);

    const initAudio = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    };

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, volume: number) => {
        initAudio();
        if (!audioCtx.current) return;

        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);

        gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.current.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.current.destination);

        osc.start();
        osc.stop(audioCtx.current.currentTime + duration);
    }, []);

    const playHover = useCallback(() => {
        playTone(440, 'sine', 0.1, 0.05);
    }, [playTone]);

    const playClick = useCallback(() => {
        playTone(880, 'sine', 0.1, 0.1);
    }, [playTone]);

    const playTransition = useCallback(() => {
        playTone(220, 'sine', 0.5, 0.1);
    }, [playTone]);

    const playAlert = useCallback(() => {
        playTone(110, 'square', 0.3, 0.05);
    }, [playTone]);

    return { playHover, playClick, playTransition, playAlert };
};
