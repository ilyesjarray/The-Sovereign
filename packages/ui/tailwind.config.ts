import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                sovereign: {
                    bg: '#050508', // Deep space black/blue
                    card: 'rgba(12, 12, 20, 0.7)', // Glassmorphic dark
                    border: 'rgba(50, 200, 255, 0.15)', // Subtle cyan border
                    text: {
                        primary: '#e2e8f0', // Crisp white-blue
                        secondary: '#94a3b8', // Muted slate
                        accent: '#22d3ee', // Electric Cyan
                    },
                    accent: {
                        cyan: '#22d3ee',
                        purple: '#a78bfa',
                        emerald: '#34d399',
                        red: '#f87171',
                    }
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'], // For data
                sans: ['"Inter"', 'sans-serif'], // For UI
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #22d3ee05 1px, transparent 1px), linear-gradient(to bottom, #22d3ee05 1px, transparent 1px)",
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'grid-move': 'gridMove 20s linear infinite',
            },
            keyframes: {
                gridMove: {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(20px)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
