'use client';

import * as React from 'react';
import { SovereignThemeProvider } from '@/context/SovereignThemeContext';
import { Toaster } from 'sonner';

export interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SovereignThemeProvider>
            {children}
            <Toaster position="top-right" expand={false} richColors />
        </SovereignThemeProvider>
    );
}
