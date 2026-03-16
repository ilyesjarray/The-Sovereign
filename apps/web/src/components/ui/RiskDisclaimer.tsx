'use client';

import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export function RiskDisclaimer({ className }: { className?: string }) {
    return (
        <div className={cn("mt-4 p-3 rounded-lg bg-[#050A1F]/40 border border-white/5", className)}>
            <div className="flex gap-2 items-start opacity-50 italic">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <p className="text-[10px] leading-relaxed font-mono">
                    Note: AI predictions are based on probabilistic models and historical data.
                    Market conditions are volatile. This is NOT financial advice.
                    The Sovereign is an intelligence tool; the final decision lies with the Human Commander.
                    Trade at your own risk.
                </p>
            </div>
        </div>
    );
}
