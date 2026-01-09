import deepseek from '../assets/deepseek.png';
import gemini from '../assets/gemini.png';
import type { Model } from '@/types/chat';

export const aiModels : string[] = ["deepseek", "gemini"];
export const modelDetails : { [key: string]: Model } = {
    "deepseek" : {
        name: "deepseek",
        color: '#4D6BFE',
        logo: deepseek,
        key: null,
    },
    "gemini" : {
        name: "gemini",
        color: '#9177C7', 
        logo: gemini,
        key: null,
    },
}
