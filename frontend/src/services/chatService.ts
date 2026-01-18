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