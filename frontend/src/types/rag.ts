export type Rag = {
    source: string;
    chunkIds: number[];
    vectorIds: number[];
}

export type Vector = {
    id: number;
    value: number;
    chunkId: number;
}

export type Chunk = {
    id: number;
    text: string;
    position: string;
    documentId: number;
    tags: string[];
}

export type Document = {
    id: number;
    source: string;
}
