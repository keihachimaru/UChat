import { generateID } from "@/utils/general";
import type { Chat } from '@/types/index';
import { API } from "./api";

export async function getChats() {
    if(localStorage.getItem('logged')!=='true') return []

    const res = await fetch(API+'/chat/all', {
        method: 'GET',
        credentials: 'include',
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
            },
            credentials: 'include',
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
        method: 'DELETE',
        credentials: 'include',
    })
    const { success } = await res.json();
    return success;
}

export async function saveChatName(id: string, value: string) {
    if(localStorage.getItem('logged')!=='true') return true
    const res = await fetch(API+'/chat/rename/'+id, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
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
        method: 'PATCH',
        credentials: 'include',
    })

    if(!res.ok) console.error('Failed to pin chat');
    else {
        const { val } = await res.json();
        return val;
    }
}