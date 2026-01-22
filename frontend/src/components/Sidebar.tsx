import { useState, useRef, useMemo } from 'react'
import { BsLayoutSidebar } from 'react-icons/bs';
import { 
    MdOutlineMoreHoriz, 
    MdEdit, 
    MdFileDownload, 
    MdInfoOutline, 
    MdArchive,
    MdDeleteOutline,
    MdPushPin,
    MdClose,
} from 'react-icons/md';
import { useChatStore } from '@/stores/chatStores.ts';
import { useMessageStore } from '@/stores/messageStores';
import '@/styles/Sidebar.css'
import { useUiStore } from '@/stores/uiStore';
import { deleteChatById, saveChatName, pinChat } from '@/services/chatService';
import { useUserStore } from '@/stores/userStore';
import type { Chat, Message } from '@/types/index';
import { modelDetails } from '@/constants/models.ts';

const Sidebar = () => {
    const activeChat = useUiStore((s) => s.activeChat);
    const setActiveChat = useUiStore((s) => s.setActiveChat);
    
    const token = useUserStore((s) => s.token);

    const chats = useChatStore((s) => s.chats);
    const updateChatName = useChatStore((s) => s.updateChatName)
    const deleteChat = useChatStore((s) => s.deleteChat)
    const togglePinChat = useChatStore((s) => s.togglePinChat)
    const deleteMessages = useMessageStore((s) => s.deleteMessages)

    const messages = useMessageStore((s) => s.messages);
    const profiles = useUserStore((s) => s.profiles)

    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    const [editingChatName, setEditingChatName] = useState<string>('');
    const [chatMenuId, setChatMenuId] = useState<string>('');

    const chatMenuRef = useRef<HTMLElement>(null);
    const [ query, setQuery ] = useState<string>('');

    const profilesById = useMemo(
        () => Object.fromEntries(profiles.map(p => [p.id, p])),
        [profiles]
    );

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
                setChatMenuId('');
                document.removeEventListener("mouseup", listenerFunc)
            }
        }
    }

    function showMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) {
        event.stopPropagation();
        const target = event.currentTarget as HTMLElement
        const menu = document.getElementById('chat-menu')

        if (!menu || !target) return;
        if (target === chatMenuRef.current) {
            chatMenuRef.current = null
            menu.classList.remove('visible')
            setChatMenuId('');
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
        setChatMenuId('');
    }

    async function handleDeleteChat() {
        const chat = chats.find(c=>c.id===chatMenuId)
        if(!chat) return

        const success = await deleteChatById(chatMenuId.toString());

        if(success) {
            deleteMessages(chat.messageIds)
            deleteChat(chatMenuId)

            if(chatMenuId===activeChat) setActiveChat(null);
            
            const menu = document.getElementById('chat-menu');
            if (!menu) return;
            menu.classList.remove('visible');
            chatMenuRef.current = null;
            setChatMenuId('');
        }
    }
    
    function queryMatch(name: string) {
        return name.toLowerCase().startsWith(query.toLowerCase()) || name.includes(query);
    }
    
    function handlePinChat() {
        togglePinChat(chatMenuId)
        if(token) pinChat(chatMenuId)

        const menu = document.getElementById('chat-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        chatMenuRef.current = null;
        setChatMenuId('');
    }
    
    function chatToText(chat: Chat) {
        const chatMessages = chat.messageIds.map(id => messages.find(m => m.id===id) || null)
        let res = "# "+chat.name+"\n\n";
        chatMessages.forEach((msg : Message | null) => {
            if(msg) res += `[${new Date(msg.timestamp).toLocaleTimeString()}] ${getAuthor(msg)} : ${msg.content}\n`
        })
        return res;
    }

    function getAuthor(message: Message) {
        const author = message.system ? modelDetails[message.model!] : profilesById[message.author!]
        
        return author.name.trim()
    }

    function downloadChat() {
        const chat = chats.find(c => c.id === chatMenuId);
        if(!chat) return;

        const blob = new Blob([chatToText(chat)], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${chat.name || "chat"}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const menu = document.getElementById('chat-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        chatMenuRef.current = null;
        setChatMenuId('');
    }

    return (
    <div className={["sidebar", showSidebar?"":"hidden"].join(" ")}>
        <div id="chat-menu">
            <div 
                className="option" 
                onClick={() => editChatName()}
            >
                <MdEdit size={20} color="#ffffff" />
                Rename
            </div>

            <div 
                className={["option", token?"":"disabled"].join(" ")}
                onClick={() => downloadChat()}
            >
                <MdFileDownload size={20} color="#ffffff" />
                Export
            </div>

            <div className={["option", token?"":"disabled"].join(" ")}>
                <MdInfoOutline size={20} color="#ffffff" />
                View Details
            </div>

            <div className={["option", token?"":"disabled"].join(" ")}>
                <MdArchive size={20} color="#ffffff" />
                Archive
            </div>

            {
                chats.find(c => c.id===chatMenuId)?.pinned ?
                <div 
                    className="option" 
                    style={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    onClick={() => { handlePinChat()}}
                >
                    <MdPushPin size={20} color="var(--primary)" />
                    Unpin
                </div>
                :
                <div className="option" onClick={() => { handlePinChat()}}>
                    <MdPushPin size={20} color="#ffffff" />
                    Pin
                </div>
            }

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            { query.length>0 && 
                <button
                    className="close"
                    onClick={()=>{setQuery('')}}
                >
                    <MdClose size={20} color="fff"/>
                </button>
            }
        </div>
        <div
            className="chatList"
        >
            {
                chats
                    .filter((c) => queryMatch(c.name))
                    .sort((a, b) => Number(b.name.startsWith(query)) + Number(b.pinned)*10 - Number(a.name.startsWith(query)) -  Number(a.pinned)*10)
                    .map((c) => (
                    <div
                        className={[
                            "chatCard",
                            c.id === activeChat ? "active" : "",
                            c.pinned ? "pinned" : ""
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
                                onBlur={(e) => {
                                    setEditingChatName('');
                                    saveChatName(c.id.toString(), e.target.value);
                                }}
                                onKeyDown={(e) => e.key==='Enter' && e.currentTarget.blur()}   
                            />
                        </div>
                        <button
                            className="more"
                            onClick={(e) => showMenu(e, c.id)}
                        >
                            <MdOutlineMoreHoriz size={20} color="white" />
                            { c.pinned && <MdPushPin size={18} color="var(--primary)"/> }
                        </button>
                    </div>
                ))
            }
        </div>
    </div>
    );
}

export default Sidebar;