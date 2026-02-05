import { useEffect, useState } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline, MdAccountCircle } from 'react-icons/md';
import { BsLayoutSidebarReverse } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { aiModels, modelDetails } from '@/constants/models';
import { useUserStore } from '@/stores/userStore';
import '@/styles/Toolbar.css';
import { useUiStore } from '@/stores/uiStore';
import { 
    createProfile, 
    eliminateProfile, 
    login
} from '@/services/userService';
import { useChatStore } from '@/stores/chatStores';
import { API } from '@/services/api';

const toolbar = () => {
    const  activeProfile = useUiStore((s) => s.activeProfile);
    const  setActiveProfile = useUiStore((s) => s.setActiveProfile);
    const  settings = useUiStore((s) => s.settings);
    const  setSettings = useUiStore((s) => s.setSettings);
    const  selectedModel = useUiStore((s) => s.selectedModel);
    const  setSelectedModel = useUiStore((s) => s.setSelectedModel);
    const  setEditingProfile = useUiStore((s) => s.setEditingProfile);
    const reset = useUiStore((s) => s.reset);

    const [toolbar, setToolbar] = useState<boolean>(true);

    const profiles = useUserStore((s) => s.profiles)
    const addProfile = useUserStore((s) => s.addProfile)
    const deleteProfile = useUserStore((s) => s.deleteProfile)
    const setProfiles = useUserStore((s) => s.setProfiles)
    const token = useUserStore((s) => s.token);
    const setToken = useUserStore((s) => s.setToken);
    const avatar = useUserStore((s) => s.avatar);
    const setAvatar = useUserStore((s) => s.setAvatar);

    const setChats = useChatStore((s) => s.setChats);

    async function handleDeleteProfile(id: string) {
        if (activeProfile === id) setActiveProfile(null)
        const success = await eliminateProfile(id);
        if (success) deleteProfile(id)
    }

    function handleLogin() {
        if(token) logout()
        else login()
    }

    async function newProfile() {
        const newProfile = await createProfile(localStorage.getItem('logged')==='true');
        addProfile(newProfile)
        setActiveProfile(newProfile.id)

        requestAnimationFrame(() => {
            const contents = document.querySelector('.profiles');
            if (contents) {
                contents.scrollTo({
                    top: contents.scrollHeight,
                    behavior: 'smooth',
                });
            }
        });
    }

    async function logout() {
        await fetch(API + '/auth/logout', {
            method: 'GET',
            credentials: 'include',
        })
        localStorage.setItem('logged', 'false');
        setToken('');
        setAvatar(null);
        reset();
        setProfiles([]);
        setChats([])
    }

    useEffect(()=>{
      if (localStorage.getItem('logged') !== 'true' && profiles.length) {
        localStorage.setItem('profiles', JSON.stringify(profiles));
      }
    }, [profiles])


    return (
        <div
            className={["toolbar", toolbar ? "" : "visible"].join(" ")}
        >
            <button
                className="toggle-sidebar"
                onClick={() => setToolbar(!toolbar)}
            >
                <BsLayoutSidebarReverse size={24} color="#fff" />
            </button>
            <div
                className="models"
            >
                {
                    toolbar ?
                        aiModels.map(i =>
                            <button
                                key={i}
                                className={["aiModel", i === selectedModel ? "active" : ""].join(" ")}
                                onClick={() => setSelectedModel(i)}
                            >
                                <img src={modelDetails[i].logo} />
                            </button>
                        ) :
                        aiModels.map(i =>
                            <button
                                key={i}
                                className={["aiModel", i === selectedModel ? "active" : ""].join(" ")}
                                onClick={() => setSelectedModel(i)}
                            >
                                <img src={modelDetails[i].logo} />
                            </button>
                        )
                }
            </div>

            <button
                className={["add", toolbar ? "" : "long"].join(" ")}
                onClick={() => newProfile()}
            >
                <MdAdd size={20} color="white" />
            </button>

            <div
                className="profiles"
            >   {
                    toolbar ?
                        <>
                            {profiles.map(p =>
                                <button
                                    key={p.id}
                                    className={["profile", p.id === activeProfile ? "active" : ""].join(" ")}
                                    onClick={() => setActiveProfile(p.id)}
                                    onDoubleClick={() => setEditingProfile(p.id)}
                                    style={{ 'background': p.color }}
                                >
                                    {p.name[0]}
                                </button>
                            )}
                        </>
                        :
                        <>
                            {profiles.map(p =>
                                <div
                                    key={p.id}
                                    className={["long-row", p.id === activeProfile ? "active" : ""].join(" ")}
                                >
                                    <button
                                        className="profile long"
                                        onClick={() => setActiveProfile(p.id)}
                                        onDoubleClick={() => setEditingProfile(p.id)}
                                        style={{ 'background': p.color }}
                                    >
                                        {p.name}
                                    </button>


                                    <div
                                        className="utilities"
                                    >
                                        <button
                                            className="utility"
                                            onClick={() => setEditingProfile(p.id)}
                                        >
                                            <MdEdit size={20} color="#fff" />
                                        </button>

                                        <button
                                            className="utility"
                                            onClick={() => handleDeleteProfile(p.id)}
                                        >
                                            <MdDeleteOutline size={20} color="#ea4335" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                }
            </div>
            <div style={{ flex: 1 }}></div>
            <button
                className="toggle-sidebar end"
                style={{ marginBottom: '10px' }}
                onClick={() => handleLogin()}
            >
                { 
                    avatar
                    ?<img 
                        className="avatar"
                        src={avatar} 
                        height="30" 
                        width="30"
                    />
                    :<MdAccountCircle size={30} color="#fff" />
                }
            </button>
            <button
                className="toggle-sidebar end"
                onClick={() => setSettings(!settings)}
            >
                <IoSettingsOutline size={30} color="#fff" />
            </button>
        </div>
    );
};

export default toolbar;
