'use client';

import { motion } from 'framer-motion';

interface LoadingStateProps {
    variant?: 'card' | 'list' | 'chart' | 'table';
    count?: number;
    className?: string;
}

export function LoadingState({ variant = 'card', count = 1, className = '' }: LoadingStateProps) {
    const items = Array.from({ length: count }, (_, i) => i);

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return items.map((i) => <CardSkeleton key={i} />);
            case 'list':
                return items.map((i) => <ListItemSkeleton key={i} />);
            case 'chart':
                return <ChartSkeleton />;
            case 'table':
                return <TableSkeleton />;
            default:
                return <CardSkeleton />;
        }
    };

    return <div className={className}>{renderSkeleton()}</div>;
}

// Card Skeleton
function CardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-6 rounded-xl"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse-slow" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse-slow" />
                    <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse-slow" />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="h-3 bg-white/5 rounded w-full animate-pulse-slow" />
                <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse-slow" />
                <div className="h-3 bg-white/5 rounded w-4/6 animate-pulse-slow" />
            </div>

            {/* Footer */}
            <div className="mt-6 flex gap-2">
                <div className="h-8 bg-white/5 rounded w-20 animate-pulse-slow" />
                <div className="h-8 bg-white/5 rounded w-20 animate-pulse-slow" />
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </motion.div>
    );
}

// List Item Skeleton
function ListItemSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-white/5 mb-2"
        >
            <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse-slow" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse-slow" />
                <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse-slow" />
            </div>
            <div className="w-16 h-8 bg-white/10 rounded animate-pulse-slow" />
        </motion.div>
    );
}

// Chart Skeleton
function ChartSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-6 rounded-xl h-64"
        >
            {/* Chart Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="h-5 bg-white/5 rounded w-1/4 animate-pulse-slow" />
                <div className="flex gap-2">
                    <div className="h-6 w-12 bg-white/5 rounded animate-pulse-slow" />
                    <div className="h-6 w-12 bg-white/5 rounded animate-pulse-slow" />
                </div>
            </div>

            {/* Chart Bars */}
            <div className="flex items-end justify-between h-40 gap-2">
                {[60, 80, 45, 90, 70, 85, 55, 75].map((height, i) => (
                    <motion.div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-sovereign-accent-cyan/20 to-sovereign-accent-cyan/5 rounded-t"
                        style={{ height: `${height}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    />
                ))}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-2 bg-white/5 rounded w-8 animate-pulse-slow" />
                ))}
            </div>
        </motion.div>
    );
}

// Table Skeleton
function TableSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel rounded-xl overflow-hidden"
        >
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-4 bg-white/5 rounded animate-pulse-slow" />
                ))}
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b border-white/5">
                    {Array.from({ length: 4 }).map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className="h-3 bg-white/5 rounded animate-pulse-slow"
                            style={{ animationDelay: `${(rowIndex * 4 + colIndex) * 0.05}s` }}
                        />
                    ))}
                </div>
            ))}
        </motion.div>
    );
}

// Inline Loading Spinner (for buttons, etc.)
export function InlineLoader({ size = 'sm', className = '' }: { size?: 'sm' | 'md'; className?: string }) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
    };

    return (
        <div className={`${sizeClasses[size]} border-white/20 border-t-white rounded-full animate-spin ${className}`} />
    );
}
