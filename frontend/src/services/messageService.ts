import type { Message, Chat } from '@/types'
import { API } from './api';

export async function getMessagesFromChat(id: string) {
    const res = await fetch(API + `/chat/${id}/messages`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
    })
    if(res.ok) {
        const data = await res.json();
        return data.map((m : Chat & { 
            _id : string, 
            createdAt: string,
            aimodel?: string,
         }) => ({ ...m, 
            id: m._id, 
            timestamp: m.createdAt,
            model: m.aimodel
        }))
    }
    return []
}

export async function sendMessageToChat(id: string, message: Message) {
    if(localStorage.getItem('logged')!=='true') return message
    const res = await fetch(API + `/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
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

export async function deleteMessage(id: string) {
    const res = await fetch(API + `/message/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
    })
    if(res.ok) {
        const { success } = await res.json();
        return success;
    }
}