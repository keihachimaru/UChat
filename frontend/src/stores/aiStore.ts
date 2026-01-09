import type { Model } from '@/types/chat';
import { create } from 'zustand'

type aiStore = {
    modelsDetails: Model[],
    setModelsDetails: (models: Model[]) => void,
    setModelKey: (model: string, key: string) => void,
}

export const useAiStore = create<aiStore>((set) => ({
    modelsDetails: [],
    setModelsDetails: (models: Model[]) => set({ modelsDetails: models }),
    setModelKey: (model: string, key: string) => set(state => ({
        modelsDetails: state.modelsDetails.map(m =>
            m.name === model
            ? { ...m, key: key }
            : m
        )
    }))
}))