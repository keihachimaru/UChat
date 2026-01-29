import type { Profile } from '@/types/index';
import { generateID, randomHex } from '@/utils/general';

export async function createProfile(isLoggedIn: boolean) {
    const newProfile = {
        id: '',
        name: 'New profile',
        color: randomHex(),
        temperature: 1.0,
        stream: true,
        maxTokens: 100,
        autoReply: true,
    }
    if(!isLoggedIn) {
        newProfile.id = generateID().toString();
        return newProfile;
    }
    else {
        const res = await fetch('http://localhost:3000/profile', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProfile)
        })

        if(res.ok) {
            const data = await res.json();
            return { id: data._id, ...data } 
        }
        else {
            newProfile.id = generateID().toString();
            return newProfile;
        }
    }
}

export async function getProfiles() {
    const res = await fetch('http://localhost:3000/profile/me', {
        method: 'GET',
        credentials: 'include',
    })

    if(res.ok) {
        const data = await res.json();
        return data.map((p : Profile & { _id : string }) => ({ ...p, id: p._id}));
    }

    return [];
}

export async function eliminateProfile(id: string) {
    const res = await fetch(`http://localhost:3000/profile/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    const { success } = await res.json();
    console.log(success)
    return success;
}

export async function modifyProfile(profile: Profile) : Promise<Profile | undefined> {
    const res = await fetch(`http://localhost:3000/profile/${profile.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
    })
    if(res.ok) {
        const data = await res.json();
        console.log(data)
        return { ...data, id: data._id };
    }
    else {
        console.log('failed')
    }
}

export async function fetchUser() {
    let status : 'down' | 'ready'  | 'loading' = 'down'
    let resData = null
    
    try {
        const res = await fetch('http://localhost:3000/auth/me', {
            method: 'GET',
            credentials: 'include',
        })
        
        if(res.status === 401) {
            localStorage.setItem('logged', 'false');
            status = 'ready';
        }
        else if(res.status === 200) {
            const data = await res.json();
            localStorage.setItem('logged', 'true');
            status = 'ready'
            resData = data;
        }
        else {
            status = 'down'
            console.warn(`Unexpected status: ${res.status}`);
        }
    }
    catch (error) {
        localStorage.setItem('logged', 'false');
        status = 'down'
    }

    return {
        status: status,
        data: resData
    }
}

export async function login() {
    window.location.href = 'http://localhost:3000/auth/google'
}

