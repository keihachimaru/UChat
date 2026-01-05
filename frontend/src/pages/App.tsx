import { useState, useRef, useEffect, useMemo, type MouseEvent } from 'react'
import {
    MdClose, MdOutlineMoreHoriz, MdAdd,
    MdEdit,
    MdFileDownload,
    MdInfoOutline,
    MdArchive,
    MdPushPin,
    MdDeleteOutline,
    MdChevronRight,
    MdSend,
    MdReply
} from 'react-icons/md';
import { IoMdShareAlt } from "react-icons/io";
import { BsLayoutSidebar, BsLayoutSidebarReverse } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import '../styles/App.css'
import type {
    Chat, Message, Model, Profile, Rag
} from '../types/index.ts';
import { generateID, createChat, capitalize, randomHex } from '../utils/general.ts';
import { aiModels, modelDetails } from '../constants/models.ts';
import { sendMessageToAI } from '../services/aiServices.ts';
import ReactMarkdown from 'react-markdown';

function App() {
    // Global data
    const [chats, setChats] = useState<Chat[]>([
    ]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    // Local data
    const [tabs, setTabs] = useState<number[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>(aiModels[0]);
    const [activeProfile, setActiveProfile] = useState<number | null>(null);
    const [editingChatName, setEditingChatName] = useState<number>(0);
    const [chatMenuId, setChatMenuId] = useState<number>(0);
    const [messageMenuId, setMessageMenuId] = useState<number>(0);
    const [editingProfile, setEditingProfile] = useState<number | null>(null);
    const [modelsDetails, setModelsDetails] = useState<Model[]>(aiModels.map(m => modelDetails[m]));
    const [editingMessage, setEditingMessage] = useState<number | null>(null);

    // Utils
    const [sidebar, setSidebar] = useState<boolean>(true);
    const [toolbar, setToolbar] = useState<boolean>(true);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [messageValue, setMessageValue] = useState('');
    const [thinking, setThinking] = useState<boolean>(false);
    const [settings, setSettings] = useState<boolean>(false);
    const [replying, setReplying] = useState<[Message, Profile|Model] | null>(null);

    // Refs
    const chatMenuRef = useRef<any>(null);
    const messageMenuRef = useRef<any>(null);

    // Functions
    function closeTab(event: MouseEvent | null, id: number) {
        if (event) event.stopPropagation();
        let index = tabs.indexOf(id)
        if (tabs[index + 1]) setActiveChat(tabs[index + 1])
        else if (tabs[index - 1]) setActiveChat(tabs[index - 1])
        else setActiveChat(null)

        setTabs(tabs.filter(t => t != id));
    }

    function newChat(
        chatName?: string,
    ) {
        const num = chats.filter(c => c.name.startsWith('New chat')).length
        const newChat = createChat(
            chatName ? chatName : ('New chat' + (num > 0 ? ' ' + num : ''))
        );
        setChats([...chats, newChat]);
        setActiveChat(newChat.id)
    }

    async function sendMessage(
        content: string,
    ) {
        const message: Message = {
            id: generateID(),
            reply: replying ? replying[0].id : null,
            system: false,
            author: activeProfile,
            content: content,
            pinned: false,
            timestamp: new Date().toString(),
        }

        if(replying) setReplying(null)

        setMessages(prev => [...prev, message]);
        setChats(prev =>
            prev.map(c =>
                c.id === activeChat
                    ? { ...c, messageIds: [...c.messageIds, message.id] }
                    : c
            )
        )

        const profile = profilesById[activeProfile!];

        if (profile.autoReply) triggerAIReply();
    }

    function handleStreamChunk(chunk: string, replyId: number) {
        const lines = chunk.split("\n");

        for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") return;

            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content;
            if (!token) continue;

            setMessages(prev =>
                prev.map(m =>
                    m.id === replyId
                        ? { ...m, content: m.content + token }
                        : m
                )
            );
        }
    }

    async function triggerAIReply() {
        setThinking(true)
        if (messages.length === 0 || !selectedModel) return;
        const model = selectedModel
        const messagesArray = [messages[messages.length - 1]]

        const conversation = messagesArray.map(m => ({
            "role": m.system ? "system" : "user",
            "content": m.content
        }))
        const temperature = profilesById[activeProfile!].temperature
        const maxTokens = profilesById[activeProfile!].maxTokens
        const stream = profilesById[activeProfile!].stream

        const context: Rag | null = null;
        const request = {
            model: model,
            conversation: conversation,
            temperature: temperature,
            maxTokens: maxTokens,
            stream: stream,
            rag: context
        }

        const key = modelsDetails.find(m => m.name === model)!.key
        if (!key) {
            alert('No key set')
            return
        }

        const response = await sendMessageToAI(request, key)

        if (stream) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            const reply: Message = {
                id: generateID(),
                system: true,
                reply: null,
                content: '',
                model: selectedModel,
                pinned: false,
                timestamp: new Date().toString(),
            }
            setMessages(prev => [...prev, reply])
            setChats(prev =>
                prev.map(c =>
                    c.id === activeChat
                        ? { ...c, messageIds: [...c.messageIds, reply.id] }
                        : c
                )
            )
            setThinking(false);

            let done = false;
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;

                const chunk = decoder.decode(value, { stream: true });

                handleStreamChunk(chunk, reply.id);
            }
        }
        else {
            const reply: Message = {
                id: generateID(),
                system: true,
                reply: null,
                content: response.choices[0].message.content,
                model: selectedModel,
                pinned: false,
                timestamp: new Date().toString(),
            }

            setMessages(prev => [...prev, reply])
            setChats(prev =>
                prev.map(c =>
                    c.id === activeChat
                        ? { ...c, messageIds: [...c.messageIds, reply.id] }
                        : c
                )
            )
            setThinking(false);
        }
    }

    function showMenu(event: MouseEvent, id: number) {
        event.stopPropagation();
        const target = event.currentTarget
        const menu = document.getElementById('chat-menu')

        if (!menu) return;
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
        }
    }

    function showMessageMenu(event: MouseEvent, id: number) {
        event.stopPropagation()
        const target = event.currentTarget
        const menu = document.getElementById('message-menu')

        if (!menu) return;

        if (target === messageMenuRef.current) {
            messageMenuRef.current = null
            menu.classList.remove('visible')
            setMessageMenuId(0);
        }
        else {
            const rect = target.getBoundingClientRect()
            menu.classList.add('visible')
            menu.style.top = `${rect.bottom + window.scrollY}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            setMessageMenuId(id);
            messageMenuRef.current = target
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

    function updateChatName(id: number, value: string) {
        setChats(prev =>
            prev.map(c =>
                c.id === id ?
                    { ...c, name: value }
                    : c
            )
        )
    }

    function updateProfileField(id: number, field: string, value: any) {
        setProfiles(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, [field]: value }
                    : p
            )
        );
    }

    function deleteChat() {
        const chat = chatsById[chatMenuId]

        closeTab(null, chatMenuId);
        setMessages(prev =>
            prev.filter(m => !chat.messageIds.includes(m.id))
        );
        setChats(prev =>
            prev.filter(c => c.id != chatMenuId)
        );

        const menu = document.getElementById('chat-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        chatMenuRef.current = null;
        setChatMenuId(0);
    }

    function deleteProfile(id: null | number) {
        if (activeProfile === id) setActiveProfile(null)
        setProfiles(prev =>
            prev.filter(p => p.id != id)
        )
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
        setProfiles([...profiles, newProfile])
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

    function saveKeys() {
        for (const model of aiModels) {
            localStorage.setItem(model, modelsDetails.find(m => m.name === model)!.key || '')
        }
    }

    function setKey(model: string, key: string) {
        setModelsDetails(prev =>
            prev.map(m =>
                m.name === model ?
                    { ...m, key: key }
                    : m
            ))

    }

    function replyTo() {
        const message = messagesById[messageMenuId];
        const author = message.system ? modelDetails[message.model!] : profilesById[message.author!]
        setReplying([message, author]);

        document.getElementById("chat-input")?.focus()

        const menu = document.getElementById('message-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        messageMenuRef.current = null;
        setMessageMenuId(0);
    }

    function getAuthor(id: number) {
        const message =  messagesById[id];
        const author = message.system ? modelDetails[message.model!] : profilesById[message.author!]
        
        return author
    }

    function forward() {
        console.log("Forward")
    }

    function editMessage() {
        setEditingMessage(messageMenuId)

        const menu = document.getElementById('message-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        messageMenuRef.current = null;
        setMessageMenuId(0);
    }

    function autoResize(textarea: HTMLTextAreaElement) {
      // Reset so shrinking works
      textarea.style.height = "auto";
      textarea.style.width = "auto";

      // Grow to fit content
      textarea.style.height = textarea.scrollHeight + "px";
      textarea.style.width = textarea.scrollWidth + "px";
    }

    function saveEditedMessage() {
        const contents = (document.getElementById("message-"+editingMessage) as HTMLInputElement).value
        setMessages(prev =>
            prev.map( m  =>
                m.id === editingMessage ?
                { ...m, content: contents }
                : m
            )
        )
        setEditingMessage(null)
    }

    function pinMessage() {
        setMessages(prev =>
            prev.map(m =>
                m.id === messageMenuId?
                { ...m, pinned: !m.pinned}
                : m
            )
        )
        const menu = document.getElementById('message-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        messageMenuRef.current = null;
        setMessageMenuId(0);
    }

    // Hooks
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
        for (const model of aiModels) {
            const key = localStorage.getItem(model)
            if (key) {
                setModelsDetails(prev =>
                    prev.map(m =>
                        m.name === model ?
                            { ...m, key: key }
                            : m
                    )
                )
            }
        }
    }, [])

    useEffect(() => {
        if (activeChat && !tabs.includes(activeChat)) setTabs([...tabs, activeChat])
    }, [activeChat])

    useEffect(() => {
        const contents = document.querySelector('.contents');
        if (contents) {
            contents.scrollTo({
                top: contents.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, thinking])

    useEffect(() => {
        if(editingMessage) {
            const el = document.getElementById("message-"+editingMessage) as HTMLTextAreaElement 
            if(!el) return
            autoResize(el)
            el.focus()
            const pos = el.value.length
            el.setSelectionRange(pos, pos)

        } 
    }, [editingMessage])

    const messagesById = useMemo(
        () => Object.fromEntries(messages.map(m => [m.id, m])),
        [messages]
    );

    const chatsById = useMemo(
        () => Object.fromEntries(chats.map(c => [c.id, c])),
        [chats]
    );

    const profilesById = useMemo(
        () => Object.fromEntries(profiles.map(p => [p.id, p])),
        [profiles]
    );

    // Event listeners
    document.addEventListener('mouseup', (e) => {
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
            }
        }
        const messsageMenu = document.getElementById('message-menu')
        if (messsageMenu && messageMenuRef.current) {
            if (
                !messsageMenu.contains(e.target as Node) &&
                !messageMenuRef.current.contains(e.target as Node) &&
                e.target !== messageMenuRef.current
            ) {
                messsageMenu.classList.remove('visible');
                messageMenuRef.current = null;
                setMessageMenuId(0);
            }
        }
        
        if (editingProfile && (e.target as HTMLDivElement).classList.contains('overlay')) {
            setEditingProfile(null);
        }
        if (settings && (e.target as HTMLDivElement).classList.contains('overlay')) {
            setSettings(false);
        }
    })

    return (
        <>
            <div
                className={["sidebar", sidebar ? "" : "hidden"].join(" ")}
            >
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
                        onClick={() => deleteChat()}
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
                        onClick={() => setSidebar(!sidebar)}
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
            <div
                className="main"
            >
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
                <div
                    className="chat-frame"
                >
                    <div id="message-menu">
                        <div className="option" onClick={() => replyTo()}>
                            <MdReply size={20} color="#ffffff" />
                            Reply 
                        </div>

                        <div className="option disabled" onClick={() => forward()}>
                            <IoMdShareAlt size={20} color="#ffffff" />
                            Forward
                        </div>

                        <div className="option" onClick={() => editMessage()}>
                            <MdEdit size={20} color="#ffffff" />
                            Edit 
                        </div>

                        {
                            messagesById[messageMenuId]?.pinned ?
                            (<div 
                                className="option" 
                                style={{ color: '#ea4335', fontWeight: 'bold' }}
                                onClick={() => pinMessage()}
                            >
                                <MdPushPin size={20} color="#ea4335" />
                                Unpin
                            </div>)
                            :(<div className="option" onClick={() => pinMessage()}>
                                <MdPushPin size={20} color="#ffffff" />
                                Pin
                            </div>)
                        }

                        <div
                            className="option"
                            style={{ color: '#ea4335', fontWeight: 'bold' }}
                            onClick={() => deleteChat()}
                        >
                            <MdDeleteOutline size={20} color="#ea4335" />
                            Delete
                        </div>
                    </div>

                    {settings &&
                        <div
                            className="overlay"
                        >
                            <div
                                className="settings"
                            >
                                <div
                                    className="title"
                                >
                                    Settings
                                </div>
                                <div
                                    className="section-title"
                                >
                                    API keys
                                </div>
                                {
                                    modelsDetails.map(m =>
                                        <div
                                            className="field"
                                            key={m.name}
                                        >
                                            <img src={m.logo} />
                                            <input
                                                key={m.name}
                                                type="text"
                                                value={m.key || ''}
                                                onChange={(e) => setKey(m.name, e.target.value)}
                                            />
                                        </div>
                                    )
                                }
                                <div style={{ flex: 1 }}></div>
                                <div
                                    className="button-row"
                                >
                                    <button
                                        className="save-solid"
                                        onClick={() => saveKeys()}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="close-solid"
                                        onClick={() => setSettings(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        editingProfile &&
                        <div
                            className="overlay"
                        >
                            <div
                                className="edit-profile"
                            >
                                <div
                                    className="title"
                                >
                                    Editing
                                    <span
                                        style={{ color: profilesById[editingProfile].color, fontWeight: 'bold', filter: 'brightness(2)' }}
                                    >
                                        {profilesById[editingProfile].name + ' '}
                                    </span>
                                </div>
                                <div className="field">
                                    <label htmlFor="profile-name">Profile name</label>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        value={profilesById[editingProfile].name}
                                        onChange={e =>
                                            updateProfileField(editingProfile, 'name', e.target.value)
                                        }
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="temperature">
                                        Temperature
                                    </label>
                                    <div
                                        className="inner-field"
                                    >
                                        <input
                                            id="temperature"
                                            type="range"
                                            min={0}
                                            max={2}
                                            step={0.1}
                                            value={profilesById[editingProfile].temperature}
                                            onChange={e =>
                                                updateProfileField(
                                                    editingProfile,
                                                    'temperature',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                        <span className="value">
                                            {profilesById[editingProfile].temperature.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="field checkbox">
                                    <label htmlFor="stream">Streaming responses</label>
                                    <input
                                        id="stream"
                                        type="checkbox"
                                        checked={profilesById[editingProfile].stream}
                                        onChange={e =>
                                            updateProfileField(
                                                editingProfile,
                                                'stream',
                                                e.target.checked
                                            )
                                        }
                                    />
                                </div>

                                <div className="field checkbox">
                                    <label htmlFor="autoreply">Auto reply</label>
                                    <input
                                        id="autoreply"
                                        type="checkbox"
                                        checked={profilesById[editingProfile].autoReply}
                                        onChange={e =>
                                            updateProfileField(
                                                editingProfile,
                                                'autoReply',
                                                e.target.checked
                                            )
                                        }
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="max-tokens">Max tokens</label>
                                    <input
                                        id="max-tokens"
                                        type="number"
                                        step="1"
                                        min={1}
                                        value={profilesById[editingProfile].maxTokens}
                                        onChange={e =>
                                            updateProfileField(
                                                editingProfile,
                                                'maxTokens',
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <button
                                    className="close-solid"
                                    onClick={() => setEditingProfile(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    }
                    {
                        activeChat && activeProfile &&
                        <>
                            <div
                                className="contents"
                            >
                                {
                                    chatsById[activeChat].messageIds.map(id => {
                                        const m: Message = messagesById[id]
                                        return (
                                            <div
                                                key={m.id}
                                                className={[
                                                    "message",
                                                    m.system || m.author != activeProfile ? "left" : "right",
                                                    m.pinned? "pinned" : ""
                                                ].join(" ")}
                                            >
                                                <div
                                                    className="messageTopbar"
                                                    style={{
                                                        'color': m.system ? modelDetails[m.model!].color : profilesById[m.author!]?.color
                                                    }}
                                                >
                                                    {m.system ? capitalize(m.model || 'no model') : profilesById[m.author!].name}
                                                    <button
                                                        className="message-menu"
                                                        onClick={(e) => showMessageMenu(e, m.id)}
                                                    >
                                                        <MdChevronRight size={20} color="white" />
                                                    </button>
                                                </div>
                                                { m.reply && <div className="messageReplybar"
                                                >
                                                    <div 
                                                        className="message"
                                                    >
                                                        <div
                                                            style={{
                                                                'backgroundColor': getAuthor(m.reply).color
                                                            }}
                                                            className="quote"
                                                        >
                                                        </div>
                                                        <div
                                                            className="messageTopbar"
                                                            style={{
                                                                'color' : getAuthor(m.reply).color
                                                            }}
                                                        >
                                                            { getAuthor(m.reply).name }
                                                        </div>
                                                        <div
                                                            className="messageContents"
                                                        >
                                                            { messagesById[m.reply].content }
                                                        </div>
                                                    </div>
                                                </div>}
                                                <div
                                                    className="messageContents"
                                                >
                                                    { editingMessage === m.id ?
                                                        (
                                                            <>
                                                                <textarea
                                                                 id={"message-"+m.id}
                                                                 defaultValue={m.content}
                                                                 onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
                                                                 spellCheck="false"
                                                                >
                                                                </textarea>
                                                                <div
                                                                    className="buttonBar"
                                                                >
                                                                    <button
                                                                        style={{ background: '#EA4335' }}
                                                                        onClick={() => setEditingMessage(null)}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        style={{ background: '#34A853' }}
                                                                        onClick={() => saveEditedMessage()}
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )
                                                        :(<ReactMarkdown>
                                                            {m.content}
                                                        </ReactMarkdown>)
                                                    }
                                                </div>
                                                <div
                                                    className="messageMetadata"
                                                >
                                                    {new Date(m.timestamp).getHours().toString().padStart(2, '0')
                                                        + ':' +
                                                        new Date(m.timestamp).getMinutes().toString().padStart(2, '0')
                                                    }
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    thinking &&
                                    <div className="typing">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                }
                            </div>
                            <div
                                className="input"
                            >   
                                <div className="upper">
                                    {
                                        replying && (
                                            <>
                                                <div
                                                    style={{
                                                        'backgroundColor': replying[1].color
                                                    }}
                                                    className="quote"
                                                >
                                                </div>
                                                <div 
                                                    className="message"
                                                >
                                                    <div
                                                        className="messageTopbar"
                                                        style={{
                                                            'color' : replying[1].color
                                                        }}
                                                    >
                                                        { replying[1].name }
                                                        <button
                                                            className="message-menu"
                                                            onClick={(e) => setReplying(null)}
                                                        >
                                                            <MdClose size={20} color="white" />
                                                        </button>
                                                    </div>
                                                    <div
                                                        className="messageContents"
                                                    >
                                                        { replying[0].content }
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                                <div className="lower">
                                    <input
                                        id="chat-input"
                                        placeholder="Ask something ..."
                                        autoFocus
                                        value={messageValue}
                                        onChange={e => setMessageValue(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && messageValue.trim()) {
                                                sendMessage(messageValue);
                                                setMessageValue('');
                                            }
                                        }}
                                    />
                                    <button
                                        className="reply"
                                        onClick={() => triggerAIReply()}
                                    >
                                        <MdSend size={24} color="fff" />
                                    </button>
                                </div>
                            </div>
                        </>
                    }
                    {
                        !activeChat &&
                        <div
                            className="no-chat"
                        >
                            <button
                                className="new-chat"
                                onClick={() => newChat()}
                            >
                                New chat
                            </button>
                        </div>
                    }
                </div>
            </div>
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
                                                onClick={() => deleteProfile(p.id)}
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
        </>
    )
}

export default App
