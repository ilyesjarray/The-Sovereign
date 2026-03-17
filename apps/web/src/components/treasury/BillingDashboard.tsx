'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Download, Globe, Shield, Zap, Crown, Landmark, History, FileText } from 'lucide-react';
import { InvoiceEngine } from '@/lib/services/invoice-engine';
import { toast } from 'sonner';

export function BillingDashboard() {
    const [currentLang] = useState<'EN'>('EN');
    const [activeTier, setActiveTier] = useState<string>('ELITE');

    const tiers = [
        { id: 'ELITE', name: 'ELITE', price: 19, icon: Zap, color: 'text-green-500' },
        { id: 'SOVEREIGN', name: 'SOVEREIGN', price: 49, icon: Crown, color: 'text-neon-blue' },
        { id: 'EMPIRE', name: 'EMPIRE', price: 120, icon: Landmark, color: 'text-red-500' },
    ];

    const history = [
        { id: 'INV-001', date: '2026.02.01', amount: 19.00, status: 'PAID' },
        { id: 'INV-002', date: '2026.01.01', amount: 19.00, status: 'PAID' },
    ];

    const handleDownload = (invoiceId: string) => {
        const mockData = {
            invoiceId,
            clientId: 'USER_778',
            clientName: 'SOVEREIGN_HOLDER',
            date: new Date().toLocaleDateString(),
            items: [{ description: 'Monthly Subscription - ' + activeTier, amount: 19, quantity: 1 }],
            totalAmount: 19,
            currency: 'USD'
        };
        const url = InvoiceEngine.generateMockPDF(mockData, currentLang);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sovereign_Invoice_${invoiceId}.txt`;
        link.click();
        toast.success('DOCUMENT_GENERATED', { description: `Invoice ${invoiceId} generated successfully.` });
    };

    return (
        <div className="flex flex-col h-full gap-8">
            {/* Tier Selector */}
            <div className="grid grid-cols-3 gap-4">
                {tiers.map((tier) => (
                    <button
                        key={tier.id}
                        onClick={() => setActiveTier(tier.id)}
                        className={`
                            hud-border p-4 flex flex-col items-center gap-2 transition-all group
                            ${activeTier === tier.id ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(0,255,65,0.3)]' : 'bg-white/[0.02] opacity-40 hover:opacity-100'}
                        `}
                    >
                        <tier.icon className={`w-6 h-6 ${tier.color}`} />
                        <span className="text-[10px] font-black tracking-widest uppercase">{tier.name}</span>
                        <span className="text-lg font-mono">${tier.price}</span>
                    </button>
                ))}
            </div>

            {/* Language Selection - DEPRECATED for v-Series Kernel */}
            <div className="flex items-center justify-between border-b border-green-500/20 pb-4">
                <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-radar" />
                    <span className="text-[10px] font-mono tracking-widest text-green-500/60 uppercase">LOCALIZATION_PROTOCOL: FIXED_ENGLISH</span>
                </div>
            </div>

            {/* Billing History */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-radar opacity-40" />
                    <span className="text-[10px] font-mono tracking-widest text-green-500/40 uppercase">LEDGER_HISTORY</span>
                </div>
                <div className="space-y-2">
                    {history.map((inv) => (
                        <div key={inv.id} className="hud-border bg-white/[0.01] p-4 flex items-center justify-between group hover:bg-green-500/5 transition-all">
                            <div className="flex items-center gap-4">
                                <FileText className="w-6 h-6 text-radar/20 group-hover:text-radar/60" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-mono text-white/80">{inv.id}</span>
                                    <span className="text-[8px] font-mono text-green-500/30">{inv.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-xs font-mono">${inv.amount}</span>
                                <button
                                    onClick={() => handleDownload(inv.id)}
                                    className="p-2 hud-border hover:bg-radar hover:text-black transition-all"
                                >
                                    <Download className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Gateway Mock */}
            <div className="mt-auto border-t border-green-500/10 pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-40">
                        <CreditCard className="w-4 h-4 text-radar" />
                        <span className="text-[10px] font-mono text-green-500 uppercase">Gateway_Nexus_Active</span>
                    </div>
                    <div className="flex gap-4">
                        <Shield className="w-4 h-4 text-green-500/20" />
                        <Zap className="w-4 h-4 text-green-500/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
