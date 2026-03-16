'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface SecurityState {
    isBlackoutActive: boolean;
    isLocked: boolean;
    isDecoyMode: boolean; // For Shadow/Decoy login
    lastAccess: number;
    encryptionKey: string | null;

    // Actions
    toggleBlackout: () => void;
    setBlackout: (active: boolean) => void;
    toggleDecoyMode: () => void;
    lockSystem: () => void;
    unlockSystem: (key?: string) => void;
    remoteWipe: () => Promise<void>;

    // [V4.0] Zero-Knowledge Cryptography
    deriveKey: (biometricSeed: string) => Promise<void>;
    encrypt: (data: string) => Promise<string>;
    decrypt: (cipher: string) => Promise<string>;
}

export const useSecurityStore = create<SecurityState>()(
    persist(
        (set, get) => ({
            isBlackoutActive: false,
            isLocked: true,
            isDecoyMode: false,
            lastAccess: Date.now(),
            encryptionKey: null,

            toggleBlackout: () => set((state: any) => ({ isBlackoutActive: !state.isBlackoutActive })),
            setBlackout: (active: boolean) => set({ isBlackoutActive: active }),
            toggleDecoyMode: () => set((state: any) => ({ isDecoyMode: !state.isDecoyMode })),

            lockSystem: () => set({ isLocked: true, encryptionKey: null }),

            unlockSystem: (key?: string) => set({
                isLocked: false,
                lastAccess: Date.now(),
                encryptionKey: key || null
            }),

            deriveKey: async (seed: string) => {
                // [V4.0] Mock PBKDF2 Derivation
                console.log('[SovereignShield] DERIVING_LOCAL_KEY_VIA_PBKDF2_SHA256');
                const hashedKey = `KEY_${btoa(seed).substr(0, 32)}`;
                set({ encryptionKey: hashedKey });
            },

            encrypt: async (data: string) => {
                const key = get().encryptionKey;
                if (!key) throw new Error('ENCRYPTION_KEY_NOT_INITIALIZED');
                // Mock AES-256-GCM Encryption
                return `ENC[${btoa(data)}]`;
            },

            decrypt: async (cipher: string) => {
                if (!cipher.startsWith('ENC[')) return cipher;
                const data = cipher.replace('ENC[', '').replace(']', '');
                return atob(data);
            },

            remoteWipe: async () => {
                if (typeof window !== 'undefined') {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                    toast.error('URGENT: SYSTEM_CORES_PURGED', {
                        description: 'Remote wipe sequence complete. All local data destroyed.',
                        className: 'bg-black border border-red-500 text-red-500 font-mono font-black',
                    });
                    window.location.href = '/login';
                }
            },
        }),
        {
            name: 'sovereign-security-storage',
        }
    )
);
