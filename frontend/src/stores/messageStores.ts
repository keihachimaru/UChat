import { create } from 'zustand';
import type { Message } from '@/types/chat';

type MessageStore = {
    messages: Message[],
    setMessages: (m: Message[]) => void,
    addMessage: (m: Message) => void,
    deleteMessages: (m: string[]) => void,
    updateMessageContents: (m: string, content: string, replace: boolean) => void,
    pinMessage: (m: string) => void,
}

export const useMessageStore = create<MessageStore>((set) => ({
    messages: [],
    setMessages: (messages: Message[]) => set({
        messages
    }),
    addMessage: (message: Message) => set(state => ({
        messages: [...state.messages, message]
    })),
    deleteMessages: (messageIds: string[]) => set(state =>({
        messages: state.messages
            .filter(m=> !messageIds.includes(m.id))
            .map(m => ({
                ...m,
                reply: m.reply&&messageIds.includes(m.reply)?null:m.reply
            }))
    })),
    updateMessageContents: (id: string, value: string, replace: boolean) => set(state => ({
        messages: state.messages.map(m =>
            m.id===id
            ?{...m, content: replace?value:m.content+value}
            :m
        )
    })),
    pinMessage: (id: string) => set(state => ({
        messages: state.messages.map(m =>
            m.id === id
            ? { ... m, pinned: !m.pinned}
            :m
        )
    }))
}))
