'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('System Error:', error);
    }, [error]);

    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-black/50 backdrop-blur-xl rounded-2xl border border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">System Malfunction</h2>
            <p className="text-gray-400 text-sm font-mono mb-8 max-w-md">
                An unhandled exception occurred in the Sovereign Intelligence Layer.
                Safety protocols initiated.
            </p>
            <button
                onClick={() => reset()}
                className="px-8 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest"
            >
                Reinitialize System
            </button>
        </div>
    );
}
