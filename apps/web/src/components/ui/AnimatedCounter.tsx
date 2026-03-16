'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    className?: string;
}

export function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
    decimals = 0,
    duration = 1200,
    className = '',
}: AnimatedCounterProps) {
    const [display, setDisplay] = useState(0);
    const startRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);
    const rafRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const from = startRef.current;
        const to = value;
        startTimeRef.current = null;

        const step = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: ease-out-cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = from + (to - from) * eased;
            setDisplay(current);

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                startRef.current = to;
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [value, duration]);

    const formatted = display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <span className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
