import { create } from 'zustand'
import type { Profile } from '@/types/user'

type UserStore = {
    profiles: Profile[],
    token: string | null,
    avatar: string | null,
    setToken: (t: string) => void,
    setAvatar: (a: string | null) => void,
    addProfile: (profile: Profile) => void,
    deleteProfile: (profile: string) => void,
    updateProfileField: (id: string, field: string, value: any) => void,
    setProfiles: (profiles: Profile[]) => void,
    updateProfile: (updated: Profile) => void,
    dummyProfile: () => Profile,
}

export const useUserStore = create<UserStore>((set) => ({
    profiles: [],
    token: null,
    avatar: null,
    dummyProfile: () => {
        const dummy : Profile = {
            id: '', 
            name: 'Default',
            color: '#fff',
            temperature: 1,
            stream: true,
            maxTokens: 100,
            autoReply: true,
        }
        return dummy;
    },
    setToken: (t: string | null) => set({ token : t }),
    setAvatar: (a: string | null) => set({ avatar: a }),
    addProfile: (p: Profile) => set(state => ({
        profiles: [...state.profiles, p]
    })),
    deleteProfile: (pId: string) => set(state => ({
        profiles: state.profiles.filter(p => p.id !== pId)
    })),
    updateProfileField: (id: string, field: string, value: any) => set(state => ({
        profiles: state.profiles.map(p =>
            p.id === id
            ? { ...p, [field]: value}
            : p
        )
    })),
    setProfiles: (profiles: Profile[]) => set({ profiles }),
    updateProfile: (updated: Profile) => set(state => ({
        profiles: state.profiles.map(p =>
            p.id===updated.id
            ? updated
            : p
        )
    }))
}))