import { create } from 'zustand';
import type { Chat } from '@/types/chat'

type ChatStore = {
    chats: Chat[],
    setChats: (c: Chat[]) => void,
    addMessageToChat: (chatId: number, messageId: number) => void,
    updateChatName: (chatId: number, value: string) => void,
    deleteChat: (chatId: number) => void,
    forwardMessagesToChats: (targetChats: number[], sourceMessages: number[]) => void,
}

export const useChatStore = create<ChatStore>((set) => ({
	// data fields
	chats: [],
	// setters
	setChats: (chats: Chat[]) => set({ chats }),
    addMessageToChat: (chatId: number, messageId: number) => 
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id===chatId
                ? { ...chat, messageIds: [ ...chat.messageIds, messageId ]}
                : chat
            )
        })),
    updateChatName: (chatId: number, value: string) =>
        set(state => ({
            chats: state.chats.map(chat =>
                chat.id===chatId
                ? { ...chat, name: value }
                : chat
            )
        })),
    deleteChat: (chatId: number) =>
        set(state => ({
            chats: state.chats.filter(chat => chat.id !== chatId)
        })),
    forwardMessagesToChats: (targetChats: number[], sourceMessages: number[]) =>
        set(state => ({
            chats: state.chats.map(chat =>
                targetChats.includes(chat.id)
                ? { ...chat, messageIds: [...new Set([...chat.messageIds, ...sourceMessages])] }
                : chat
            )
        }))
    
}));