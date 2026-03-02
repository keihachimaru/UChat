import { generateID } from "@/utils/general";
import type { Chat } from '@/types/index';
import { API } from "./api";

export async function getChats() {
    if(localStorage.getItem('logged')!=='true') return []

    const res = await fetch(API+'/chat/all', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        method: 'GET',
    })
    if(res.status === 200) {
        const data = await res.json();
        return data.map((c: any) : Chat => ({
           id: c._id,
           name: c.name, 
           messageIds: c.messageIds || [],
           documentIds: c.documentIds || [],
           pinned: c.pinned,
        }));
    }
    else {
        return []
    }
}

export async function createChat(isLoggedIn: boolean, name: string) {
    if(!isLoggedIn) {
        return {
            id: generateID().toString(),
            name: name,
            messageIds: [],
            documentIds: [],
            pinned: false,
        } 
    }
    else {
        const res = await fetch(API+'/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify({ name })
        })
        if(res.ok) {
            const data = await res.json();
            return {
                id: data.id,
                name: data.name,
                messageIds: [],
                documentIds: [],
                pinned: false,
            };
        }
        else {
            return null;
        }
    }
}

export async function deleteChatById(id: string) {
    if(localStorage.getItem('logged')!=='true') return true
    const res = await fetch(API+'/chat/delete/'+id, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        method: 'DELETE',
    })
    const { success } = await res.json();
    return success;
}

export async function saveChatName(id: string, value: string) {
    if(localStorage.getItem('logged')!=='true') return true
    const res = await fetch(API+'/chat/rename/'+id, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({ value })
    })

    if (!res.ok) console.error('Failed to update chat name');
    else { 
        const { success } = await res.json();
        return success;
    }
}

export async function pinChat(id: string) {
    if(localStorage.getItem('logged')!=='true') return true
    const res = await fetch(API+'/chat/pin/'+id, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        method: 'PATCH',
    })

    if(!res.ok) console.error('Failed to pin chat');
    else {
        const { val } = await res.json();
        return val;
    }
}