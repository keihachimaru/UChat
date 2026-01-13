import { create } from 'zustand'
import type { Profile } from '@/types/user'

type UserStore = {
    profiles: Profile[],
    token: string | null,
    avatar: string | null,
    setToken: (t: string) => void,
    setAvatar: (a: string | null) => void,
    addProfile: (profile: Profile) => void,
    deleteProfile: (profile: number) => void,
    updateProfileField: (id: number, field: string, value: any) => void,
    setProfiles: (profiles: Profile[]) => void,
}

export const useUserStore = create<UserStore>((set) => ({
    profiles: [],
    token: null,
    avatar: null,
    setToken: (t: string | null) => set({ token : t }),
    setAvatar: (a: string | null) => set({ avatar: a }),
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
    setProfiles: (profiles: Profile[]) => set({ profiles }),

}))