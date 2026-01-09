import { create } from 'zustand'
import type { Profile } from '@/types/user'

type UserStore = {
    profiles: Profile[],
    addProfile: (profile: Profile) => void,
    deleteProfile: (profile: number) => void,
    updateProfileField: (id: number, field: string, value: any) => void,
    setProfiles: (profiles: Profile[]) => void,
}

export const useUserStore = create<UserStore>((set) => ({
    profiles: [],
    addProfile: (p: Profile) => set(state => ({
        profiles: [...state.profiles, p]
    })),
    deleteProfile: (pId: number) => set(state => ({
        profiles: state.profiles.filter(p => p.id !== pId)
    })),
    updateProfileField: (id: number, field: string, value: any) => set(state => ({
        profiles: state.profiles.map(p =>
            p.id === id
            ? { ...p, [field]: value}
            : p
        )
    })),
    setProfiles: (profiles: Profile[]) => set({ profiles })
}))