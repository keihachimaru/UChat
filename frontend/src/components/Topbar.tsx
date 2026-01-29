import { MdClose, MdAdd } from 'react-icons/md';
import { useChatStore } from '@/stores/chatStores';
import { createChat } from '@/services/chatService';
import { useEffect } from 'react';
import '@/styles/Topbar.css';
import { useUiStore } from '@/stores/uiStore';

const Topbar = () => {
    const activeChat = useUiStore((s) => s.activeChat);
    const setActiveChat = useUiStore((s) => s.setActiveChat);
    const tabs = useUiStore((s) => s.tabs);
    const addTab = useUiStore((s) => s.addTab);
    const removeTab = useUiStore((s) => s.removeTab);
    
    const chats = useChatStore((s) => s.chats);
    const setChats = useChatStore((s) => s.setChats);
    
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

    function closeTab(event: React.MouseEvent | null, id: string) {
        if (event) event.stopPropagation();
        let index = tabs.indexOf(id)
        if (tabs[index + 1]) setActiveChat(tabs[index + 1])
        else if (tabs[index - 1]) setActiveChat(tabs[index - 1])
        else setActiveChat(null)

        removeTab(id)
    }

    useEffect(()=> {
        if(tabs.length && !activeChat) {
            setActiveChat(tabs[0])
        }
    }, [tabs])

    useEffect(() => {
        if (activeChat && !tabs.includes(activeChat)) addTab(activeChat)
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