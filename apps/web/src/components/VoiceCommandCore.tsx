'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOracleStore } from '@/store/oracle-store';
import { AutomataService } from '@/lib/services/automata-service';
import { toast } from 'sonner';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceCommandCore() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const router = useRouter();
    const { setGhostMode, ghostMode } = useOracleStore();

    const processCommand = useCallback(async (command: string) => {
        toast.info(`VOICE_COMMAND: "${command}"`, { duration: 2000 });

        // Ghost Protocol
        if (command.includes('ghost') || command.includes('phantom')) {
            setGhostMode(!ghostMode);
            toast.success(ghostMode ? 'Ghost Protocol DEACTIVATED' : 'Ghost Protocol ACTIVATED');
        }
        // Navigation
        else if (command.includes('dashboard') || command.includes('command center')) {
            router.push('/en/terminal');
            toast.success('Navigating to Command Center');
        }
        else if (command.includes('oracle') || command.includes('intelligence')) {
            router.push('/en/terminal/oracle');
            toast.success('Accessing Oracle Neural Link');
        }
        else if (command.includes('war room') || command.includes('command hub')) {
            router.push('/en/terminal/command');
            toast.success('Entering War Room');
        }
        // Automata
        else if (command.includes('hedge') || command.includes('defense')) {
            await AutomataService.getInstance().executeSmartHedge();
        }
        else {
            toast.error('COMMAND_UNRECOGNIZED: Try "Activate Ghost Protocol" or "Execute Smart Hedge"');
        }
    }, [ghostMode, setGhostMode, router]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Voice commands not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.toLowerCase().trim();
            setTranscript(command);
            processCommand(command);
        };

        recognition.onerror = (event: any) => {
            console.error('Voice recognition error:', event.error);
            setIsListening(false);
        };

        if (isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }

        return () => recognition.stop();
    }, [isListening, processCommand]);

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <motion.button
                onClick={() => setIsListening(!isListening)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening
                    ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                    : 'bg-white/10 backdrop-blur-xl text-white/60 hover:bg-white/20'
                    }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isListening ? <Mic className="w-6 h-6 animate-pulse" /> : <MicOff className="w-6 h-6" />}
            </motion.button>

            <AnimatePresence>
                {transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-20 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 min-w-[200px] shadow-2xl"
                    >
                        <div className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Last Command</div>
                        <div className="text-xs text-white font-mono italic">&ldquo;{transcript}&rdquo;</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
