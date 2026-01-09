export type SidebarType = {
    activeChat: number |  null,
    setActiveChat: (c : number | null) => void
}

export type ProfileDetailsType = {
    editingProfile: number | null,
    setEditingProfile: (c: number | null) => void
}

export type SettingsType = {
    settings: boolean,
    setSettings: (s: boolean) => void
}