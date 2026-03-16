import { create } from 'zustand';

export type AppId = 'vault' | 'nexus' | 'market' | 'map' | 'settings' | 'terminal';

interface WindowState {
    id: string;
    appId: AppId;
    title: string;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

interface OSState {
    windows: Record<string, WindowState>;
    activeWindowId: string | null;
    launcherOpen: boolean;

    // Actions
    openApp: (appId: AppId, title: string) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    toggleLauncher: () => void;
}

export const useOSStore = create<OSState>()((set: any, get: any) => ({
    windows: {},
    activeWindowId: null,
    launcherOpen: false,

    openApp: (appId: AppId, title: string) => {
        const id = `${appId}-${Date.now()}`;
        const maxZ = Math.max(0, ...Object.values(get().windows).map((w: any) => w.zIndex));

        set((state: any) => ({
            windows: {
                ...state.windows,
                [id]: {
                    id,
                    appId,
                    title,
                    isOpen: true,
                    isMinimized: false,
                    isMaximized: false,
                    zIndex: maxZ + 1,
                    position: { x: 100, y: 50 }, // Default spawn position
                    size: { width: 800, height: 600 }
                }
            },
            activeWindowId: id,
            launcherOpen: false
        }));
    },

    closeWindow: (id: string) => {
        set((state: any) => {
            const newWindows = { ...state.windows };
            delete newWindows[id];
            return { windows: newWindows, activeWindowId: null };
        });
    },

    focusWindow: (id: string) => {
        const maxZ = Math.max(0, ...Object.values(get().windows).map((w: any) => w.zIndex));
        set((state: any) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id], zIndex: maxZ + 1, isMinimized: false }
            },
            activeWindowId: id
        }));
    },

    minimizeWindow: (id: string) => {
        set((state: any) => ({
            windows: {
                ...state.windows,
                [id]: { ...state.windows[id], isMinimized: true }
            },
            activeWindowId: null
        }));
    },

    toggleLauncher: () => set((state: any) => ({ launcherOpen: !state.launcherOpen })),
}));
