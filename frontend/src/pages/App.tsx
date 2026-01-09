import Sidebar from '@/components/Sidebar.tsx'
import ProfileDetails from '@/components/ProfileDetails.tsx';

import { useState, useRef, useEffect, useMemo, type MouseEvent } from 'react'
import {
    MdClose, MdAdd,
    MdEdit,
    MdPushPin,
    MdDeleteOutline,
    MdChevronRight,
    MdSend,
    MdReply
} from 'react-icons/md';
import { IoMdShareAlt } from "react-icons/io";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import '../styles/App.css'
import type {
    Message, Model, Profile, Rag
} from '../types/index.ts';
import { generateID, createChat, capitalize, randomHex } from '../utils/general.ts';
import { aiModels, modelDetails } from '../constants/models.ts';
import { sendMessageToAI } from '../services/aiServices.ts';
import ReactMarkdown from 'react-markdown';

import { useChatStore } from '@/stores/chatStores.ts';
import { useMessageStore } from '@/stores/messageStores.ts';
import { useUserStore } from '@/stores/userStore.ts';


function App() {
    // Chat Store
    const chats = useChatStore((s) => s.chats);
    const setChats = useChatStore((s) => s.setChats)
    const addMessageToChat = useChatStore((s) => s.addMessageToChat)
    const forwardMessagesToChats = useChatStore((s) => s.forwardMessagesToChats)
    
    // Message Store
    const messages = useMessageStore((s) => s.messages)
    const addMessage = useMessageStore((s) => s.addMessage)
    const updateMessageContents = useMessageStore((s) => s.updateMessageContents)
    const pinMessage = useMessageStore((s) => s.pinMessage)
    
    // Profile Store
    const profiles = useUserStore((s) => s.profiles)
    const setProfiles = useUserStore((s) => s.setProfiles)
    const addProfile = useUserStore((s) => s.addProfile)
    const deleteProfile = useUserStore((s) => s.deleteProfile)

    // Local data
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [editingProfile, setEditingProfile] = useState<number | null>(null);

    const [tabs, setTabs] = useState<number[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>(aiModels[0]);
    const [activeProfile, setActiveProfile] = useState<number | null>(null);
    const [messageMenuId, setMessageMenuId] = useState<number>(0);
    const [editingMessage, setEditingMessage] = useState<number | null>(null);
    const [forwardMenu, setForwardMenu] = useState<boolean>(false);
    const [forwardTo, setForwardTo] = useState<number[]>([]);

    const [modelsDetails, setModelsDetails] = useState<Model[]>(aiModels.map(m => modelDetails[m]));

    // Utils
    const [toolbar, setToolbar] = useState<boolean>(true);
    const [messageValue, setMessageValue] = useState('');
    const [thinking, setThinking] = useState<boolean>(false);
    const [settings, setSettings] = useState<boolean>(false);
    const [replying, setReplying] = useState<[Message, Profile|Model] | null>(null);
    const [forwarding, setForwarding] = useState<number[] | null>(null);

    // Refs
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

        addMessage(message);
        addMessageToChat(activeChat!, message.id)

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
            
            updateMessageContents(replyId, token, false)
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
            addMessage(reply)
            addMessageToChat(activeChat!, reply.id)
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

            addMessage(reply)
            addMessageToChat(activeChat!, reply.id)
            setThinking(false);
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
        setForwarding([messageMenuId])

        const menu = document.getElementById('message-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        messageMenuRef.current = null;
        setMessageMenuId(0);
    }

    function changeForwarding(id: number) {
        if(!forwarding) return
        if(forwarding.includes(id)) {
            setForwarding(prev => prev!.filter(f => f!==id))
        }
        else {
            setForwarding([...forwarding, id])
        }
    }

    function changeForwardTo(id: number) {
        if(forwardTo.includes(id)) {
            setForwardTo(prev => prev!.filter(f => f!==id))
        }
        else {
            setForwardTo([...forwardTo, id])
        }
    }
    function forwardMessages(check: boolean) {
        if(check) {
            forwardMessagesToChats(forwardTo, forwarding!)
            setTabs([... new Set([...tabs, ...forwardTo])])
            setActiveChat(tabs[tabs.length-1])
            setForwardTo([])
            setForwarding(null)
        }
        else {
            setForwarding(null);
        }
        setForwardMenu(false);
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
        updateMessageContents(editingMessage!, contents, true)
        setEditingMessage(null)
    }

    function handlePinMessage() {
        pinMessage(messageMenuId)
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
    useEffect(() => {
        document.addEventListener('mouseup', (e) => {
            if (!e.target) return;

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
    }, [])

    return (
        <>
            <Sidebar 
                activeChat={activeChat} 
                setActiveChat={setActiveChat}
            />

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

                        <div className="option" onClick={() => forward()}>
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
                                onClick={() => handlePinMessage()}
                            >
                                <MdPushPin size={20} color="#ea4335" />
                                Unpin
                            </div>)
                            :(<div className="option" onClick={() => handlePinMessage()}>
                                <MdPushPin size={20} color="#ffffff" />
                                Pin
                            </div>)
                        }

                        <div
                            className="option"
                            style={{ color: '#ea4335', fontWeight: 'bold' }}
                            onClick={() => handlePinMessage()}
                        >
                            <MdDeleteOutline size={20} color="#ea4335" />
                            Delete
                        </div>
                    </div>

                    {forwardMenu &&
                        <div
                            className="overlay"
                        >
                            <div
                                className="forward-menu"
                            >
                                <div
                                    className="title"
                                >
                                    Forward to
                                </div>
                                <br></br>
                                <div
                                    className="forward-chats-container"
                                >
                                    {
                                        chats.map(c =>
                                            <div
                                                className="forward-chat"
                                            >
                                                { c.name }
                                                <input
                                                    className="forwardTick"
                                                    type="checkbox"
                                                    checked={forwardTo.includes(c.id)}
                                                    onChange={()=>changeForwardTo(c.id)}
                                                ></input>
                                            </div>
                                        )
                                    }
                                </div>
                                <div
                                    className="button-row"
                                >
                                    <button
                                        className="save-solid"
                                        onClick={() => forwardMessages(true)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="close-solid"
                                        onClick={() => forwardMessages(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    }

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
                    <ProfileDetails 
                        editingProfile={editingProfile}
                        setEditingProfile={setEditingProfile}
                    />
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
                                            <div className="message-row" key={id}>
                                                <div
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
                                                {forwarding &&
                                                <input
                                                    className="forwardTick"
                                                    type="checkbox"
                                                    checked={forwarding.includes(m.id)}
                                                    onChange={(e)=>changeForwarding(m.id)}
                                                ></input>}
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
                                {
                                    forwarding?
                                    (<div className="forwarding">
                                        <button
                                            className="close"
                                            onClick={() => setForwarding(null)}
                                        >
                                            <MdClose size={20} color="white" />
                                        </button>
                                        <p>
                                            { `${forwarding.length} selected` }
                                        </p>
                                        <div style={{ flex: 1}}></div>
                                        <button className="close" onClick={() => setForwardMenu(true)}>
                                            <IoMdShareAlt size={24} color="#ffffff" />
                                        </button>
                                    </div>)
                                    :(<div className="lower">
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
                                    </div>)
                                }
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
        </>
    )
}

export default App
