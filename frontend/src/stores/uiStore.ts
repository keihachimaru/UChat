import { create } from 'zustand';
import type { Message, Profile, Model } from '@/types/index';
import { aiModels } from '@/constants/models';
import { persist } from 'zustand/middleware';

type Notification = {
    type: string;
    message: string;   
}

type uiStoreType = {
    activeChat: string | null,
    setActiveChat: (s: string | null) => void,
    editingProfile: string | null, 
    setEditingProfile: (s: string | null) => void,
    settings: boolean,
    setSettings: (s: boolean) => void,
    activeProfile: string | null,
    setActiveProfile: (s: string | null) => void,
    selectedModel: string,
    setSelectedModel: (m: string) => void,    
    forwarding: string[] | null,
    setForwarding: (f: string[] | null) => void,
    forwardMenu: boolean,
    setForwardMenu: (f: boolean) => void,
    replying: [Message, Profile | Model] | null,
    setReplying: (r: [Message, Profile | Model] | null) => void,
    reset: () => void,
    tabs: string[],
    setTabs: (tabs: string[]) => void,
    removeTab: (t: string) => void,
    addTab: (t:string) => void,
    globalNotifications: Notification[];
    addNotification: (n: Notification) => void,
    backendStatus: 'down' | 'loading' | 'ready',
    setBackendStatus: (s: 'down' | 'loading' | 'ready') => void,
}

const getDefaultUiState = () => ({
    activeChat: null,
    editingProfile: null,
    settings: false,
    activeProfile: null,
    selectedModel: aiModels[0],
    forwarding: null,
    forwardMenu: false,
    replying: null,
    tabs: [],
    profiles: [],
});

export const useUiStore = create<uiStoreType>()(
    persist(
        (set)=>({
            activeChat: null,
            setActiveChat: (s: string | null) => set({ activeChat: s }),
            editingProfile: null,
            setEditingProfile: (s: string| null) => set({ editingProfile: s }),
            settings: false,
            setSettings: (s: boolean) => set({ settings: s }),
            activeProfile: null,
            setActiveProfile: (s: string | null) => set({ activeProfile: s }),
            selectedModel: aiModels[0],
            setSelectedModel: (s: string) => set({ selectedModel: s }),
            forwarding: null,
            setForwarding: (s: string[] | null) => set({ forwarding: s }),
            forwardMenu: false,
            setForwardMenu: (s: boolean) => set({ forwardMenu: s}),
            replying: null,
            setReplying: (s: [Message, Profile | Model] | null) => set({ replying: s}),
            reset: () => {
                localStorage.removeItem("uiStore");
                set(getDefaultUiState())
            },
            tabs: [],
            setTabs: (t: string[]) => set({ tabs: t }),
            removeTab: (tab: string) => set((state) => ({
                tabs: state.tabs.filter(t => t!==tab)
            })),
            addTab: (tab: string) => set((state) => ({
                tabs: [...state.tabs, tab]
            })),
            globalNotifications: [],
            addNotification: (n : Notification) => set((state) => ({
                globalNotifications: [...state.globalNotifications, n],
            })),
            backendStatus: 'loading',
            setBackendStatus: (s: 'loading' | 'ready' | 'down') => set({ backendStatus: s })
        }),
        {
          name: "uiStore",
          partialize: (state: uiStoreType) => ({
            activeChat: state.activeChat,
            editingProfile: state.editingProfile,
            settings: state.settings,
            activeProfile: state.activeProfile,
            selectedModel: state.selectedModel,
            forwarding: state.forwarding,
            forwardMenu: state.forwardMenu,
            tabs: state.tabs,
          }),
        }
    )
);