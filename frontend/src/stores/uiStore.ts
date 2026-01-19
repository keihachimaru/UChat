import { create } from 'zustand';
import type { Message, Profile, Model } from '@/types/index';
import { aiModels } from '@/constants/models';
import { persist } from 'zustand/middleware';

type uiStoreType = {
    activeChat: string | null,
    setActiveChat: (s: string | null) => void,
    editingProfile: number | null, 
    setEditingProfile: (s: number | null) => void,
    settings: boolean,
    setSettings: (s: boolean) => void,
    activeProfile: number | null,
    setActiveProfile: (s: number | null) => void,
    selectedModel: string,
    setSelectedModel: (m: string) => void,    
    forwarding: string[] | null,
    setForwarding: (f: string[] | null) => void,
    forwardMenu: boolean,
    setForwardMenu: (f: boolean) => void,
    replying: [Message, Profile | Model] | null,
    setReplying: (r: [Message, Profile | Model] | null) => void,
}

export const useUiStore = create<uiStoreType>()(
    persist(
        (set)=>({
            activeChat: null,
            setActiveChat: (s: string | null) => set({ activeChat: s }),
            editingProfile: null,
            setEditingProfile: (s: number | null) => set({ editingProfile: s }),
            settings: false,
            setSettings: (s: boolean) => set({ settings: s }),
            activeProfile: null,
            setActiveProfile: (s: number | null) => set({ activeProfile: s }),
            selectedModel: aiModels[0],
            setSelectedModel: (s: string) => set({ selectedModel: s }),
            forwarding: null,
            setForwarding: (s: string[] | null) => set({ forwarding: s }),
            forwardMenu: false,
            setForwardMenu: (s: boolean) => set({ forwardMenu: s}),
            replying: null,
            setReplying: (s: [Message, Profile | Model] | null) => set({ replying: s})
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
          }),
        }
    )
);