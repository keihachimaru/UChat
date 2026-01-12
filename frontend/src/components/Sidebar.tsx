import { useState, useRef } from 'react'
import { BsLayoutSidebar } from 'react-icons/bs';
import { 
    MdOutlineMoreHoriz, 
    MdEdit, 
    MdFileDownload, 
    MdInfoOutline, 
    MdArchive,
    MdDeleteOutline,
    MdPushPin
} from 'react-icons/md';
import { useChatStore } from '@/stores/chatStores.ts';
import type { SidebarType } from '@/types';
import { useMessageStore } from '@/stores/messageStores';
import '@/styles/Sidebar.css'

const Sidebar = ({ 
    activeChat, setActiveChat, 
}: SidebarType) => {
    const chats = useChatStore((s) => s.chats);
    const updateChatName = useChatStore((s) => s.updateChatName)
    const deleteChat = useChatStore((s) => s.deleteChat)
    const deleteMessages = useMessageStore((s) => s.deleteMessages)

    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const [editingChatName, setEditingChatName] = useState<number>(0);
    const [chatMenuId, setChatMenuId] = useState<number>(0);

    const chatMenuRef = useRef<HTMLElement>(null);

    const listenerFunc = (e: MouseEvent) => {
        if (!e.target) return;

        const menu = document.getElementById('chat-menu');
        if (menu && chatMenuRef.current) {
            if (
                !menu.contains(e.target as Node) &&
                !chatMenuRef.current.contains(e.target as Node) &&
                e.target !== chatMenuRef.current
            ) {
                menu.classList.remove('visible');
                chatMenuRef.current = null;
                setChatMenuId(0);
                document.removeEventListener("mouseup", listenerFunc)
            }
        }
    }

    function showMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement
        const menu = document.getElementById('chat-menu')

        if (!menu || !target) return;
        if (target === chatMenuRef.current) {
            chatMenuRef.current = null
            menu.classList.remove('visible')
            setChatMenuId(0);
        }
        else {
            const rect = target.getBoundingClientRect()
            menu.classList.add('visible')
            menu.style.top = `${rect.bottom + window.scrollY}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            setChatMenuId(id);
            chatMenuRef.current = target

            document.addEventListener('mouseup', (e) => listenerFunc(e))
        }
    }

    function editChatName() {
        setEditingChatName(chatMenuId)
        const chatInput = document.getElementById(chatMenuId + '-chat-input') as HTMLInputElement;
        if (!chatInput) return;

        chatInput.select()

        const menu = document.getElementById('chat-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        chatMenuRef.current = null;
        setChatMenuId(0);
    }

    function handleDeleteChat() {
        const chat = chats.find(c=>c.id===chatMenuId)
        if(!chat) return

        deleteMessages(chat.messageIds)
        deleteChat(chatMenuId)

        if(chatMenuId===activeChat) setActiveChat(null);
        
        const menu = document.getElementById('chat-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        chatMenuRef.current = null;
        setChatMenuId(0);
    }

    return (
    <div className={["sidebar", showSidebar?"":"hidden"].join(" ")}>
        <div id="chat-menu">
            <div className="option" onClick={() => editChatName()}>
                <MdEdit size={20} color="#ffffff" />
                Rename
            </div>

            <div className="option disabled">
                <MdFileDownload size={20} color="#ffffff" />
                Export
            </div>

            <div className="option disabled">
                <MdInfoOutline size={20} color="#ffffff" />
                View Details
            </div>

            <div className="option disabled">
                <MdArchive size={20} color="#ffffff" />
                Archive
            </div>

            <div className="option disabled">
                <MdPushPin size={20} color="#ffffff" />
                Pin
            </div>

            <div
                className="option"
                style={{ color: '#ea4335', fontWeight: 'bold' }}
                onClick={() => handleDeleteChat()}
            >
                <MdDeleteOutline size={20} color="#ea4335" />
                Delete
            </div>
        </div>
        <div
            className="sidebar-nav"
        >
            <button
                className="toggle-sidebar"
                onClick={() => setShowSidebar(!showSidebar)}
            >
                <BsLayoutSidebar size={24} color="#fff" />
            </button>
        </div>
        <div
            className="search"
        >
            <input
                placeholder="Search ..."
            />
        </div>
        <div
            className="chatList"
        >
            {
                chats.map((c) => (
                    <div
                        className={[
                            "chatCard",
                            c.id === activeChat ?
                                "active" : ""
                        ].join(" ")}
                        key={c.id}
                        onClick={() => c.id == activeChat ? setActiveChat(null) : setActiveChat(c.id)}
                    >
                        <div>
                            <input
                                id={c.id + '-chat-input'}
                                value={c.name}
                                readOnly={c.id !== editingChatName}
                                onChange={(e) => updateChatName(c.id, e.target.value)}
                                onBlur={() => {
                                    setEditingChatName(0)
                                }}
                            />
                        </div>
                        <button
                            className="more"
                            onClick={(e) => showMenu(e, c.id)}
                        >
                            <MdOutlineMoreHoriz size={20} color="white" />
                        </button>
                    </div>
                ))
            }
        </div>
    </div>
    );
}

export default Sidebar;