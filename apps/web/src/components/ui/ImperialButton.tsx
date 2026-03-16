'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface ImperialButtonProps {
    children: any;
    onClick?: (e: any) => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'emerald';
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    href?: string;
}

export function ImperialButton({
    children,
    onClick,
    variant = 'primary',
    className,
    disabled,
    loading,
    size = 'md',
    type = 'button'
}: ImperialButtonProps) {

    const variants = {
        primary: "bg-neon-blue text-black hover:bg-black hover:text-neon-blue border border-neon-blue/50 shadow-glow-gold",
        secondary: "bg-black border border-neon-blue/20 text-neon-blue/60 hover:bg-neon-blue/5 hover:border-neon-blue/40 hover:text-neon-blue",
        danger: "bg-black border border-rose-500/50 text-rose-500 hover:bg-rose-500/10 hover:border-rose-400 shadow-glow-red",
        ghost: "bg-transparent border border-transparent text-neon-blue/60 hover:text-neon-blue",
        emerald: "bg-black text-sovereign-blue hover:bg-sovereign-blue/5 border border-sovereign-blue/50 shadow-glow-emerald"
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px]",
        md: "px-6 py-3 text-xs",
        lg: "px-8 py-4 text-sm"
    };

    return (
        <motion.button
            whileHover={!disabled && !loading ? { scale: 1.02, x: 2 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            className={cn(
                "relative overflow-hidden font-mono uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3",
                variants[variant],
                sizes[size],
                (disabled || loading) && "opacity-50 grayscale cursor-not-allowed",
                className
            )}
        >
            {/* Terminal decorative corner */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-blue/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-blue/40" />

            {loading ? (
                <span className="flex items-center gap-2 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-current" />
                    PROCESSING_Ω...
                </span>
            ) : (
                children
            )}
        </motion.button>
    );
}
