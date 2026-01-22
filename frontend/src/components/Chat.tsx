import {
    MdClose,
    MdEdit,
    MdPushPin,
    MdDeleteOutline,
    MdChevronRight,
    MdSend,
    MdReply
} from 'react-icons/md';
import { IoMdShareAlt } from "react-icons/io";
import ReactMarkdown from 'react-markdown';
import { generateID } from '../utils/general.ts';
import { sendMessageToAI } from '../services/aiServices.ts';
import { capitalize } from '../utils/general.ts';
import { useChatStore } from '@/stores/chatStores.ts';
import { useMessageStore } from '@/stores/messageStores.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { useAiStore } from '@/stores/aiStore.ts';
import { useMemo, useState, useRef, useEffect } from 'react';
import { modelDetails } from '@/constants/models.ts';
import type { Rag, Message } from '@/types/index.ts';
import '@/styles/Chat.css';
import { useUiStore } from '@/stores/uiStore.ts';
import { getChats, createChat } from '@/services/chatService.ts';
import { getMessagesFromChat, sendMessageToChat } from '@/services/messageService.ts';

const Chat = () => {
    const activeProfile = useUiStore((s) => s.activeProfile)
    const selectedModel = useUiStore((s) => s.selectedModel)
    const setForwardMenu = useUiStore((s) => s.setForwardMenu)
    const forwarding = useUiStore((s) => s.forwarding)
    const setForwarding = useUiStore((s) => s.setForwarding)
    const activeChat = useUiStore((s) => s.activeChat)
    const setActiveChat = useUiStore((s) => s.setActiveChat)
    const replying = useUiStore((s) => s.replying)
    const setReplying = useUiStore((s) => s.setReplying)

    const chats = useChatStore((s) => s.chats);
    const setChats = useChatStore((s) => s.setChats);
    const addMessageToChat = useChatStore((s) => s.addMessageToChat)

    const messages = useMessageStore((s) => s.messages)
    const setMessages = useMessageStore((s) => s.setMessages)
    const addMessage = useMessageStore((s) => s.addMessage)
    const updateMessageContents = useMessageStore((s) => s.updateMessageContents)
    const pinMessage = useMessageStore((s) => s.pinMessage)

    const profiles = useUserStore((s) => s.profiles)
    const token = useUserStore((s) => s.token)

    const modelsDetails = useAiStore((s) => s.modelsDetails)

    const [messageValue, setMessageValue] = useState('');
    const [messageMenuId, setMessageMenuId] = useState<string>('');

    const messageMenuRef = useRef<any>(null);

    const listenerFunc = (e: MouseEvent) => {
        if (!e.target) return;

        const menu = document.getElementById('message-menu');
        if (menu && messageMenuRef.current) {
            if (
                !menu.contains(e.target as Node) &&
                !messageMenuRef.current.contains(e.target as Node) &&
                e.target !== messageMenuRef.current
            ) {
                menu.classList.remove('visible');
                messageMenuRef.current = null;
                setMessageMenuId('');
                document.removeEventListener("mouseup", listenerFunc)
            }
        }
    }

    const [thinking, setThinking] = useState<boolean>(false);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);

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

    useEffect(() => {
        if(!token) {
            return
        }
        
        const load = async() => {
            const chats = await getChats();
            setChats(chats);
        }

        load();
    }, [ token ])
    
    useEffect(() => {
        if(!activeChat) return
        const chat = chatsById[activeChat];
        if(!chat) return
        const notFetched = chat.messageIds.some(i => !messagesById[i])
        if(notFetched) {
            const load = async () => {
                const msgs = await getMessagesFromChat(activeChat.toString());            
                setMessages([... new Set([...messages, ...msgs])])
            }
            load();
        }
    }, [ activeChat, chats ])

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

    async function sendMessage(
        content: string,
    ) {
        const messageDTO: Message = {
            id: generateID().toString(),
            reply: replying ? replying[0].id : null,
            system: false,
            author: activeProfile,
            content: content,
            pinned: false,
            timestamp: new Date().toString(),
        }

        const message = await sendMessageToChat(activeChat!.toString(), messageDTO);
        
        if(replying) setReplying(null)
        if(!message) return

        addMessage(message);
        addMessageToChat(activeChat!, message.id)

        const profile = profilesById[activeProfile!];

        if (profile.autoReply) triggerAIReply();
    }

    function handleStreamChunk(chunk: string, replyId: string) {
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
                id: generateID().toString(),
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
                id: generateID().toString(),
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

    function showMessageMenu(event: React.MouseEvent, id: string) {
        event.stopPropagation()
        const target = event.currentTarget
        const menu = document.getElementById('message-menu')
        if (!menu) return;

        if (target === messageMenuRef.current) {
            messageMenuRef.current = null
            menu.classList.remove('visible')
            setMessageMenuId('');
        }
        else {
            const rect = target.getBoundingClientRect()
            menu.classList.add('visible')
            menu.style.top = `${rect.bottom + window.scrollY}px`;
            menu.style.left = `${rect.left + window.scrollX}px`;
            setMessageMenuId(id);
            (id);
            messageMenuRef.current = target

            document.addEventListener('mouseup', (e) => listenerFunc(e))
        }
    }

    function getAuthor(id: string) {
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
        setMessageMenuId('');
    }

    function changeForwarding(id: string) {
        if(!forwarding) return
        if(forwarding.includes(id)) {
            setForwarding(forwarding.filter(f => f!==id))
        }
        else {
            setForwarding([...forwarding, id])
        }
    }

    function editMessage() {
        setEditingMessage(messageMenuId)

        const menu = document.getElementById('message-menu');
        if (!menu) return;
        menu.classList.remove('visible');
        messageMenuRef.current = null;
        setMessageMenuId('');
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
        setMessageMenuId('');
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
        setMessageMenuId('');
    }

    return (
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


            {
                activeChat && activeProfile && chatsById[activeChat] &&
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
                                            onChange={()=>changeForwarding(m.id)}
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
                                                    onClick={() => setReplying(null)}
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
                                <textarea
                                    id="chat-input"
                                    placeholder="Ask something ..."
                                    autoFocus
                                    value={messageValue}
                                    onChange={e => setMessageValue(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey && messageValue.trim()) {
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
                activeChat && !activeProfile && chatsById[activeChat] &&
                <div className="no-active-profile">
                    <strong>No active profile</strong>
                    <p>Please activate a profile clicking on the '+' icon on the right toolbar</p>
                </div>
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
    );
};

export default Chat;