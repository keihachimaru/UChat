import type { Chat } from '../types/index';

export function generateID() {
    return Math.floor(Math.random()*1000000);
}

export function createChat(
    chatName: string,
) : Chat {
    return {
        id: generateID(),
        name: chatName,
        messageIds: [],
        documentIds: [],
    } 
}
export function capitalize(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
export function randomHex() {
    // Generate each color channel separately (0 to 100)
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);

    // Convert to hex and pad with zeros if needed
    const hex = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    return `#${hex}`;
}
   
