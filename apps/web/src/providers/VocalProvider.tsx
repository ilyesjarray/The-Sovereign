'use client';

import React, { createContext, useContext, useCallback, useRef, useEffect, useState } from 'react';

interface VocalContextType {
    speak: (text: string, priority?: 'high' | 'normal') => void;
    cancel: () => void;
    isSpeaking: boolean;
    isEnabled: boolean;
    toggleVoice: () => void;
}

const VocalContext = createContext<VocalContextType | null>(null);

export const useVocal = () => {
    const context = useContext(VocalContext);
    if (!context) {
        throw new Error('useVocal must be used within a VocalProvider');
    }
    return context;
};

// SSML-style text preprocessor for robotic effect
function preprocessText(text: string): string {
    return text
        .replace(/\./g, '... ')           // pause at periods
        .replace(/,/g, ', ')              // short pause at commas
        .replace(/:/g, ':.. ')            // pause after colons
        .replace(/([A-Z]{2,})/g, (m) => m.split('').join(' '))  // spell out abbreviations
        .replace(/\$/g, 'dollars ')
        .replace(/%/g, ' percent')
        .trim();
}

export const VocalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const synth = useRef<SpeechSynthesis | null>(null);
    const queue = useRef<string[]>([]);
    const isProcessing = useRef(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synth.current = window.speechSynthesis;
        }
        return () => {
            synth.current?.cancel();
        };
    }, []);

    const getBestRoboticVoice = useCallback((): SpeechSynthesisVoice | null => {
        if (!synth.current) return null;
        const voices = synth.current.getVoices();
        // Prefer Microsoft neural voices for most robotic sound
        const preferred = [
            'Microsoft Mark - English (United States)',
            'Microsoft David - English (United States)',
            'Microsoft Zira - English (United States)',
            'Google US English',
            'en-US-Wavenet-D',
        ];
        for (const name of preferred) {
            const v = voices.find(v => v.name === name);
            if (v) return v;
        }
        // Fallback: any English male voice
        return voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female'))
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0]
            || null;
    }, []);

    const processQueue = useCallback(() => {
        if (!synth.current || isProcessing.current || queue.current.length === 0 || !isEnabled) {
            isProcessing.current = false;
            setIsSpeaking(false);
            return;
        }

        isProcessing.current = true;
        const text = queue.current.shift()!;
        const processed = preprocessText(text);

        const utter = new SpeechSynthesisUtterance(processed);
        utter.pitch = 0.6;       // Very low pitch for robotic authority
        utter.rate = 0.82;       // Slightly slower than normal — deliberate
        utter.volume = 0.85;

        // Wait for voices to load
        const assign = () => {
            const voice = getBestRoboticVoice();
            if (voice) utter.voice = voice;
        };
        if (synth.current.getVoices().length > 0) {
            assign();
        } else {
            synth.current.onvoiceschanged = assign;
        }

        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => {
            isProcessing.current = false;
            if (queue.current.length > 0) {
                setTimeout(() => processQueue(), 100); // brief gap between sentences
            } else {
                setIsSpeaking(false);
            }
        };
        utter.onerror = () => {
            isProcessing.current = false;
            setIsSpeaking(false);
        };

        synth.current.speak(utter);
    }, [isEnabled, getBestRoboticVoice]);

    const speak = useCallback((text: string, priority: 'high' | 'normal' = 'normal') => {
        if (!isEnabled || !synth.current) return;

        if (priority === 'high') {
            // High-priority: cancel current and speak immediately
            synth.current.cancel();
            queue.current = [text];
            isProcessing.current = false;
        } else {
            queue.current.push(text);
        }
        setTimeout(() => processQueue(), 50);
    }, [isEnabled, processQueue]);

    const cancel = useCallback(() => {
        queue.current = [];
        isProcessing.current = false;
        synth.current?.cancel();
        setIsSpeaking(false);
    }, []);

    const toggleVoice = useCallback(() => {
        setIsEnabled(prev => {
            if (prev) synth.current?.cancel();
            return !prev;
        });
    }, []);

    return (
        <VocalContext.Provider value={{ speak, cancel, isSpeaking, isEnabled, toggleVoice }}>
            {children}
        </VocalContext.Provider>
    );
};
