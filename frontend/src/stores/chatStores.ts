import { create } from 'zustand';
import type { Chat } from '@/types/chat'

type ChatStore = {
    chats: Chat[],
    setChats: (c: Chat[]) => void,
    addMessageToChat: (chatId: string, messageId: string) => void,
    updateChatName: (chatId: string, value: string) => void,
    deleteChat: (chatId: string) => void,
    forwardMessagesToChats: (targetChats: string[], sourceMessages: string[]) => void,
    togglePinChat: (chatId: string) => void,
    deleteMessageFromChat: (chatId: string, m: string) => void,
}

export const useChatStore = create<ChatStore>((set) => ({
	// data fields
	chats: [],
	// setters
	setChats: (chats: Chat[]) => set({ chats }),
    addMessageToChat: (chatId: string, messageId: string) => 
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id===chatId
                ? { ...chat, messageIds: [ ...chat.messageIds, messageId ]}
                : chat
            )
        })),
    updateChatName: (chatId: string, value: string) =>
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id===chatId
                ? { ...chat, name: value }
                : chat
            )
        })),
    deleteChat: (chatId: string) =>
        set(state => ({
            chats: state.chats.filter(chat => chat.id !== chatId)
        })),
    forwardMessagesToChats: (targetChats: string[], sourceMessages: string[]) =>
        set(state => ({
            chats: state.chats.map(chat =>
                targetChats.includes(chat.id)
                ? { ...chat, messageIds: [...new Set([...chat.messageIds, ...sourceMessages])] }
                : chat
            )
        })),
    togglePinChat: (chatId: string) =>
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id === chatId
                ? { ...chat, pinned: !chat.pinned }
                : chat
            )
        })),
    deleteMessageFromChat: (chatId: string, m: string) =>
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id === chatId
                ? { ... chat, messageIds: chat.messageIds.filter(msg => msg!=m)}
                : chat
            )
        }))
}));