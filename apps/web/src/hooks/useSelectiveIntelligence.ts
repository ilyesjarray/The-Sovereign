'use client';

import { useState, useEffect } from 'react';
import { IntelligenceItem, filterIntelligence, mockIntelligence } from '@/lib/intelligence/selectiveIntelligence';

export function useSelectiveIntelligence() {
    const [intelligence, setIntelligence] = useState<IntelligenceItem[]>([]);
    const [level, setLevel] = useState<'ALL_IMPORTANT' | 'SECURITY_THREAT'>('ALL_IMPORTANT');
    const [activeAlert, setActiveAlert] = useState<IntelligenceItem | null>(null);

    useEffect(() => {
        // Simulate real-time fetch
        const filtered = filterIntelligence(mockIntelligence, level);
        setIntelligence(filtered);

        // Periodically "discover" new news
        const timer = setInterval(() => {
            // Randomly trigger an alert for visual feedback demo
            if (filtered.length > 0 && Math.random() > 0.7) {
                setActiveAlert(filtered[Math.floor(Math.random() * filtered.length)]);
            }
        }, 15000);

        return () => clearInterval(timer);
    }, [level]);

    return {
        intelligence,
        level,
        setLevel,
        activeAlert,
        clearAlert: () => setActiveAlert(null)
    };
}
