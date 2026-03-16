import { cn } from '@/lib/utils';

export function SovereignLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            <defs>
                <linearGradient id="imperial-gradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer Shield/Crown Abstract */}
            <path
                d="M50 5 L85 20 L85 45 C85 70 50 95 50 95 C50 95 15 70 15 45 L15 20 L50 5 Z"
                stroke="url(#imperial-gradient)"
                strokeWidth="2"
                fill="rgba(5, 10, 31, 0.8)"
                filter="url(#glow)"
            />

            {/* Inner S / Infinity Symbol */}
            <path
                d="M35 35 C35 25 65 25 65 35 C65 45 35 55 35 65 C35 75 65 75 65 65"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.9"
            />

            {/* Tech Nodes */}
            <circle cx="35" cy="35" r="3" fill="#22d3ee" />
            <circle cx="65" cy="65" r="3" fill="#22d3ee" />
            <circle cx="50" cy="50" r="2" fill="#fff" className="animate-pulse" />
        </svg>
    );
}
