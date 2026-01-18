import { MdClose, MdAdd } from 'react-icons/md';
import { useChatStore } from '@/stores/chatStores';
import { createChat } from '@/services/chatService';
import { useEffect, useState } from 'react';
import '@/styles/Topbar.css';
import { useUiStore } from '@/stores/uiStore';

const Topbar = () => {
    const activeChat = useUiStore((s) => s.activeChat);
    const setActiveChat = useUiStore((s) => s.setActiveChat);
    
    const chats = useChatStore((s) => s.chats);
    const setChats = useChatStore((s) => s.setChats);

    const [tabs, setTabs] = useState<number[]>([]);
    
    async function newChat(
        chatName?: string,
    ) {
        const num = chats.filter(c => c.name.startsWith('New chat')).length
        const newChat = await createChat(
            localStorage.getItem('logged')=='true',
            chatName ? chatName : ('New chat' + (num > 0 ? ' ' + num : ''))
        );
        if(newChat) {
            setChats([...chats, newChat]);
            setActiveChat(newChat.id)
        }
    }

    function closeTab(event: React.MouseEvent | null, id: number) {
        if (event) event.stopPropagation();
        let index = tabs.indexOf(id)
        if (tabs[index + 1]) setActiveChat(tabs[index + 1])
        else if (tabs[index - 1]) setActiveChat(tabs[index - 1])
        else setActiveChat(null)

        setTabs(tabs.filter(t => t != id));
    }

    useEffect(()=> {
        setTabs(prev => prev.filter(t => chats.find(c=>c.id==t)))
    }, [chats])

    useEffect(()=> {
        if(tabs.length && !activeChat) {
            setActiveChat(tabs[0])
        }
    }, [tabs])

    useEffect(() => {
        if (activeChat && !tabs.includes(activeChat)) setTabs([...tabs, activeChat])
    }, [activeChat])

    return (
        <div
            className="topbar"
        >
            <button
                className="add"
                onClick={() => newChat()}
            >
                <MdAdd size={20} color="white" />
            </button>
            {
                tabs.map((t) => (
                    <div
                        className={[
                            "tab",
                            t === activeChat ?
                                "active" : ""
                        ].join(" ")}
                        key={t}
                        onClick={() => t == activeChat ? setActiveChat(null) : setActiveChat(t)}
                    >
                        <div
                            className="tabName"
                        >
                            {chats.find(c => c.id === t)?.name}
                        </div>
                        <button
                            className="close"
                            onClick={(e) => closeTab(e, t)}
                        >
                            <MdClose size={16} color="white" />
                        </button>
                    </div>
                ))
            }
        </div>
    );
};

export default Topbar;