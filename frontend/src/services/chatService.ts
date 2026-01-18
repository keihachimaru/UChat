import { generateID } from "@/utils/general";

export async function getChats() {
    const res = await fetch('http://localhost:3000/chat/all', {
        method: 'GET',
        credentials: 'include',
    })
    if(res.status === 200) {
        const data = await res.json();
        return data.map((c: any) => ({
           id: c._id,
           name: c.name, 
           messageIds: c.messageIds || [],
           documentIds: c.documentIds || [],
        }));
    }
    else {
        return []
    }
}

export async function createChat(isLoggedIn: boolean, name: string) {
    if(!isLoggedIn) {
        return {
            id: generateID(),
            name: name,
            messageIds: [],
            documentIds: [],
        } 
    }
    else {
        const res = await fetch('http://localhost:3000/chat', {
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
            };
        }
        else {
            return null;
        }
    }
}

export async function deleteChatById(id: string) {
    const res = await fetch('http://localhost:3000/chat/delete/'+id, {
        method: 'DELETE',
        credentials: 'include',
    })
    const { success } = await res.json();
    return success;
}

export async function saveChatName(id: string, value: string) {
    const res = await fetch('http://localhost:3000/chat/update/'+id, {
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