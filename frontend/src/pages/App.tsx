import Sidebar from '@/components/Sidebar.tsx'
import ProfileDetails from '@/components/ProfileDetails.tsx';
import Settings from '@/components/Settings.tsx';
import Topbar from '@/components/Topbar.tsx';
import Toolbar from '@/components/Toolbar.tsx';
import Forward from '@/components/Forward.tsx';
import Chat from '@/components/Chat.tsx';
import Welcome from '@/components/Welcome.tsx';
import Notification from '@/components/Notification';

import { useEffect } from 'react'
import '../styles/App.css'
import { useUiStore } from '@/stores/uiStore';

function App() {
    // Local data
    const editingProfile = useUiStore((s) => s.editingProfile);
    const setEditingProfile = useUiStore((s) => s.setEditingProfile);

    const settings = useUiStore((s) => s.settings);
    const setSettings = useUiStore((s) => s.setSettings);

    // Event listeners
    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            if (!e.target) return;
            
            if (editingProfile && (e.target as HTMLDivElement).classList.contains('overlay')) {
                setEditingProfile(null);
            }
            if (settings && (e.target as HTMLDivElement).classList.contains('overlay')) {
                setSettings(false);
            }
        }
        document.addEventListener('mouseup', handleMouseUp)

        return () => document.removeEventListener('mouseup', handleMouseUp)

    }, [editingProfile, settings])

    return (
        <>  
            { /* WARNINGS */ }
            <Welcome/>
            <Notification/>
            
            {/* MENUS */}

            <Forward/>

            <Settings/>
            
            <ProfileDetails />

            {/* CONTENT */}

            <Sidebar/>

            <div
                className="main"
            >
                <Topbar/>
                <Chat/>

            </div>

            <Toolbar/>
        </>
    )
}

export default App
