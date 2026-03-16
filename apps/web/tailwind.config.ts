import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'carbon-black': '#000000',
        'deep-space': '#000000',
        'hyper-cyan': '#00F0FF',
        'electric-violet': '#0400ffff', // Transitioned to deep blue
        'glass-white': 'rgba(255, 255, 255, 0.03)',
        sovereign: {
          bg: '#000000',
          accent: '#00F0FF',
          muted: '#0A0A0A',
          card: 'rgba(0, 0, 0, 0.8)',
          border: 'rgba(0, 240, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glitch': 'glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.8)',
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-violet': '0 0 20px rgba(138, 43, 226, 0.3)',
      }
    }
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        '.glass-v-series': {
          'background': 'rgba(0, 0, 0, 0.8)',
          'backdrop-filter': 'blur(30px) saturate(180%)',
          'border': '1px solid rgba(0, 240, 255, 0.1)',
        },
        '.text-gradient-cyan': {
          'background': 'linear-gradient(180deg, #FFFFFF 0%, #00F0FF 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        }
      })
    }
  ],
};
export default config;

