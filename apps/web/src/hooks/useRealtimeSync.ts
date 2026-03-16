'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useRealtimeSync(table: string, callback: (payload: any) => void) {
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel(`realtime-${table}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: table },
                (payload) => {
                    console.log(`[Realtime Update] ${table}:`, payload);
                    callback(payload);

                    // Optionally show a toast for certain events
                    if (payload.eventType === 'INSERT' && table === 'trades') {
                        toast.success(`New Trade Executed: ${payload.new.asset} @ $${payload.new.price}`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, callback, supabase]);
}
