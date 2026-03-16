'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const handleLanguageChange = (code: string) => {
    const newPath = pathname === '/' ? `/${code}/global-ops` : `/${code}${pathname}`;
    window.location.href = newPath;
    setIsOpen(false);
  };

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black border border-neon-blue/10 hover:border-neon-blue/30 transition-all duration-200"
        aria-label="Switch language"
      >
        <Globe className="w-3.5 h-3.5 text-neon-blue" />
        <span className="text-[10px] font-black text-neon-blue/80 tracking-widest uppercase">{currentLang.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 min-w-[180px] bg-black border border-neon-blue/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-[110]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 hover:bg-neon-blue/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base grayscale hover:grayscale-0 transition-all">{lang.flag}</span>
                  <span className="text-[10px] font-black text-neon-blue/60 uppercase tracking-widest">{lang.label}</span>
                </div>
                {locale === lang.code && (
                  <Check className="w-3.5 h-3.5 text-sovereign-blue" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
