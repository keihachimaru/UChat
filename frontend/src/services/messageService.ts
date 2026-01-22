import type { Message, Chat } from '@/types'

export async function getMessagesFromChat(id: string) {
    const res = await fetch(`http://localhost:3000/chat/${id}/messages`, {
        method: 'GET',
        credentials: 'include'
    })
    if(res.ok) {
        const data = await res.json();
        return data.map((m : Chat & { _id : string }) => ({ ...m, id: m._id}))
    }
    return []
}

export async function sendMessageToChat(id: string, message: Message) {
    const res = await fetch(`http://localhost:3000/message`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            chat: id,
            ...message
        })
    })
    if(res.ok) {
        const data = await res.json();
        return {
            id: data._id,
            reply: data.reply,
            system: data.system,
            author: data.author,
            content: data.content,
            pinned: data.pinned,
            timestamp: data.timestamp,
        } 
    }
}