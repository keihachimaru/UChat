import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline } from 'react-icons/md';
import { BsLayoutSidebarReverse } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { aiModels, modelDetails } from '@/constants/models';
import { useUserStore } from '@/stores/userStore';
import { generateID, randomHex } from '@/utils/general';
import '@/styles/Toolbar.css';
import { useUiStore } from '@/stores/uiStore';

const toolbar = () => {
    const  activeProfile = useUiStore((s) => s.activeProfile);
    const  setActiveProfile = useUiStore((s) => s.setActiveProfile);
    const  settings = useUiStore((s) => s.settings);
    const  setSettings = useUiStore((s) => s.setSettings);
    const  selectedModel = useUiStore((s) => s.selectedModel);
    const  setSelectedModel = useUiStore((s) => s.setSelectedModel);
    const  setEditingProfile = useUiStore((s) => s.setEditingProfile);

    const [toolbar, setToolbar] = useState<boolean>(true);

    const profiles = useUserStore((s) => s.profiles)
    const setProfiles = useUserStore((s) => s.setProfiles)
    const addProfile = useUserStore((s) => s.addProfile)
    const deleteProfile = useUserStore((s) => s.deleteProfile)

    function handleDeleteProfile(id: number) {
        if (activeProfile === id) setActiveProfile(null)
        deleteProfile(id)
    }

    function newProfile() {
        const newProfile = {
            id: generateID(),
            name: 'New profile',
            color: randomHex(),
            temperature: 1.0,
            stream: true,
            maxTokens: 100,
            autoReply: false,
        }
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

    useEffect(() => {
        if (profiles.length === 0) {
            const newProfile = {
                id: generateID(),
                name: 'New profile',
                color: randomHex(),
                temperature: 1.0,
                stream: true,
                maxTokens: 100,
                autoReply: false,
            }
            setProfiles([newProfile])
            setActiveProfile(newProfile.id)
        }
    }, [])

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
                                    onDoubleClick={() => setToolbar(!toolbar)}
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
                onClick={() => setSettings(!settings)}
            >
                <IoSettingsOutline size={30} color="#fff" />
            </button>
        </div>
    );
};

export default toolbar;
