# UChat
Tool to use AI assistants better and more conviniently.

# Feature List 

A. Core Chat System

- Create / rename / delete chats
- Persist chats locally
- Deterministic message ordering
- Resume chats after restart
- Open same chat in multiple tabs/windows (state sync)

B. Model & Provider Layer

- Select chat engine per chat
- Provider abstraction (OpenAI / DeepSeek / etc.)
- User-supplied API keys (premium/local config)
- Streaming responses
- Cancel generation

C. Message Controls

- Pin messages
- Edit user messages
- Fork conversation from pinned message (optional but strong)

D. Document & Knowledge Management

- Import documents (txt / md)
- Tag documents
- Enable / disable documents per chat
- Re-index documents on change

E. Local RAG System (Core Differentiator)

- Chunk documents into segments
- Generate embeddings for chunks
- Store embeddings locally
- Similarity search on user prompt
- Inject retrieved context into prompt
- Token-budget aware context assembly

F. Observability & Limits

- Token usage estimation
- Per-chat token counters
- Optional hard token limits
- Debug view (show retrieved chunks)
