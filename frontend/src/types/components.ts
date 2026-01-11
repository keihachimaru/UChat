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

export type TopbarType = {
    activeChat: number | null,
    setActiveChat: (c : number | null) => void
}

export type ToolbarType = {
    activeProfile: number | null,
    setActiveProfile: (c: number | null) => void,
    settings: boolean,
    setSettings: (s: boolean) => void,
    selectedModel: string,
    setSelectedModel: (m: string) => void,
    setEditingProfile: (c: number | null) => void,
}

export type ForwardType = {
    forwarding: number[] | null,
    setForwarding: (f: number[] | null) => void,
    forwardMenu: boolean,
    setForwardMenu: (s: boolean) => void,
}