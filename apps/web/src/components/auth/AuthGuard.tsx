'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'LOADING' | 'AUTHENTICATED' | 'GUEST'>('LOADING');
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setStatus(session ? 'AUTHENTICATED' : 'GUEST');
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setStatus(session ? 'AUTHENTICATED' : 'GUEST');
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (status === 'LOADING') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]"
                >
                    INITIALIZING_IMPERIAL_LINK...
                </motion.div>
            </div>
        );
    }

    // Always render children, but the children can use the auth status if needed
    return <>{children}</>;
}
