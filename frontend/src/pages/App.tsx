import Sidebar from '@/components/Sidebar.tsx'
import ProfileDetails from '@/components/ProfileDetails.tsx';
import Settings from '@/components/Settings.tsx';
import Topbar from '@/components/Topbar.tsx';
import Toolbar from '@/components/Toolbar.tsx';
import Forward from '@/components/Forward.tsx';
import ChatArea from '@/components/Chat';
import Welcome from '@/components/Welcome.tsx';
import Notification from '@/components/Notification';
import Loading from '@/components/Loading';
import BackendDown from '@/components/BackendDown';

import { useEffect } from 'react'
import '../styles/App.css'
import { useUiStore } from '@/stores/uiStore';
import { createProfile, fetchUser, getProfiles } from '@/services/userService';
import { useUserStore } from '@/stores/userStore';

function App() {
    // Local data
    const editingProfile = useUiStore((s) => s.editingProfile);
    const setEditingProfile = useUiStore((s) => s.setEditingProfile);

    const settings = useUiStore((s) => s.settings);
    const setSettings = useUiStore((s) => s.setSettings);
    const backendStatus = useUiStore((s) => s.backendStatus);
    const setActiveProfile = useUiStore((s) => s.setActiveProfile);
    const setBackendStatus = useUiStore((s) => s.setBackendStatus);
    const activeProfile = useUiStore((s) => s.activeProfile)
    
    const addProfile = useUserStore((s) => s.addProfile)
    const setProfiles = useUserStore((s) => s.setProfiles)
    const setToken = useUserStore((s) => s.setToken)
    const setAvatar = useUserStore((s) => s.setAvatar)

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

    useEffect(() => {
      const loadProfile = async () => {
        const res = await fetchUser();
        setBackendStatus(res.status)

        const localProfiles = JSON.parse(localStorage.getItem('profiles')||'[]');
        const savedProfiles = res.data ? await getProfiles() : localProfiles;
        

        if (savedProfiles.length === 0) {
            const newProfile = await createProfile(localStorage.getItem('logged')==='true');
            addProfile(newProfile)
            setActiveProfile(newProfile.id)
        }
        else {
            if(res.data) {
                setAvatar(res.data.avatar)
                setToken(res.data.providerId)
            }
            setProfiles(savedProfiles)
            if(activeProfile &&
                !savedProfiles.find((p: { id: string}) => p.id===activeProfile)
            ) {
                setActiveProfile(savedProfiles[0].id || null)
            }
        }
      };

      setTimeout(() => { loadProfile() }, 1000)
    }, []); 

    if(backendStatus==='loading') {
        return (
            <>
                <Loading/>
            </>
        )
    }
    if(backendStatus==='down') {
        return (
            <>
                <BackendDown/>
            </>
        )
    }
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
                <ChatArea/>

            </div>

            <Toolbar/>
        </>
    )
}

export default App
