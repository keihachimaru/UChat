import Sidebar from '@/components/Sidebar.tsx'
import ProfileDetails from '@/components/ProfileDetails.tsx';
import Settings from '@/components/Settings.tsx';
import Topbar from '@/components/Topbar.tsx';
import Toolbar from '@/components/Toolbar.tsx';
import Forward from '@/components/Forward.tsx';
import Chat from '@/components/Chat.tsx';

import { useState, useEffect } from 'react'
import '../styles/App.css'
import type {
    Message, Model, Profile 
} from '../types/index.ts';
import { aiModels } from '../constants/models.ts';

function App() {
    // Local data
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [editingProfile, setEditingProfile] = useState<number | null>(null);
    const [settings, setSettings] = useState<boolean>(false);
    const [activeProfile, setActiveProfile] = useState<number | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>(aiModels[0]);
    const [forwarding, setForwarding] = useState<number[] | null>(null);
    const [forwardMenu, setForwardMenu] = useState<boolean>(false);
    const [replying, setReplying] = useState<[Message, Profile|Model] | null>(null);


    // Event listeners
    useEffect(() => {
        document.addEventListener('mouseup', (e) => {
            if (!e.target) return;
            
            if (editingProfile && (e.target as HTMLDivElement).classList.contains('overlay')) {
                setEditingProfile(null);
            }
            if (settings && (e.target as HTMLDivElement).classList.contains('overlay')) {
                setSettings(false);
            }
        })
    }, [])

    return (
        <>
            {/* MENUS */}

            <Forward
                forwarding={forwarding}
                setForwarding={setForwarding}
                forwardMenu={forwardMenu}
                setForwardMenu={setForwardMenu}
            />

            <Settings
                settings={settings}
                setSettings={setSettings}
            />
            
            <ProfileDetails 
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
            />

            {/* CONTENT */}

            <Sidebar 
                activeChat={activeChat} 
                setActiveChat={setActiveChat}
            />

            <div
                className="main"
            >
                <Topbar
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                />
                <Chat
                    activeProfile={activeProfile}
                    selectedModel={selectedModel}
                    setForwardMenu={setForwardMenu}
                    forwarding={forwarding}
                    setForwarding={setForwarding}
                    activeChat={activeChat}
                    setActiveChat={setActiveChat}
                    replying={replying}
                    setReplying={setReplying}
                />

            </div>

            <Toolbar
                activeProfile={activeProfile}
                setActiveProfile={setActiveProfile}
                settings={settings}
                setSettings={setSettings}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                setEditingProfile={setEditingProfile}
            />
        </>
    )
}

export default App
