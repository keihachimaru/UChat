import { create } from 'zustand';
import type { Message } from '@/types/chat';

type MessageStore = {
    messages: Message[],
    setMessages: (m: Message[]) => void,
    addMessage: (m: Message) => void,
    deleteMessages: (m: number[]) => void,
    updateMessageContents: (m: number, content: string, replace: boolean) => void,
    pinMessage: (m: number) => void,
}

export const useMessageStore = create<MessageStore>((set) => ({
    messages: [],
    setMessages: (messages: Message[]) => set({
        messages
    }),
    addMessage: (message: Message) => set(state => ({
        messages: [...state.messages, message]
    })),
    deleteMessages: (messageIds: number[]) => set(state =>({
        messages: state.messages.filter(m=> !messageIds.includes(m.id))
    })),
    updateMessageContents: (id: number, value: string, replace: boolean) => set(state => ({
        messages: state.messages.map(m =>
            m.id===id
            ?{...m, content: replace?value:m.content+value}
            :m
        )
    })),
    pinMessage: (id: number) => set(state => ({
        messages: state.messages.map(m =>
            m.id === id
            ? { ... m, pinned: !m.pinned}
            :m
        )
    }))
}))
