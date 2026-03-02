# UChat

A unified AI chat interface that makes conversing with multiple AI assistants more convenient and efficient.

**Live Demo**: [https://u-chat-theta.vercel.app](https://u-chat-theta.vercel.app)

## Overview

UChat is a full-stack chat application that lets you interact with multiple AI models (DeepSeek, Google Gemini) through a unified interface. It offers flexible authentication, multi-profile support, and powerful message management—all while keeping your data synchronized across browser tabs.

---

## Key Features

### Core Chat System

- **Create, rename, and delete chats** - Organize conversations easily
- **Persistent local storage** - Chat history survives browser restarts
- **State synchronization** - Open the same chat in multiple tabs and stay in sync
- **Chat pinning** - Keep frequently-used conversations at the top
- **Deterministic message ordering** - Messages always display in the correct sequence

### Multi-Model Support

- **Dual AI models** - Chat with DeepSeek or Google Gemini
- **Per-chat model selection** - Choose different models for different conversations
- **User-supplied API keys** - Use your own credentials for each model
- **Streaming responses** - Real-time message streaming for faster feedback

### Profile Management

- **Multiple profiles** - Create and switch between different chat personas
- **Profile customization** - Set custom colors, temperature, and token limits for each profile
- **Auto-reply settings** - Configure automatic response behavior per profile
- **Authentication support** - Sync profiles across devices with Google OAuth
- **Local fallback** - Use profiles offline without authentication

### Advanced Message Controls

- **Pin messages** - Keep important messages visible at the top
- **Edit sent messages** - Correct or modify your chat history
- **Forward messages** - Send messages to multiple chats at once
- **Reply-to functionality** - Quote specific messages in conversations
- **Message deletion** - Remove messages from chat history

### Authentication & Multi-Device Support

- **Google OAuth integration** - Sign in with your Google account
- **JWT token-based sessions** - Secure, stateless authentication
- **Cross-device synchronization** - Access your chats and profiles from any device
- **Guest mode** - Chat without logging in (local storage only)

### User Configuration

- **Temperature control** - Adjust model creativity per profile (0.0 to 2.0)
- **Token limits** - Set maximum tokens for each response
- **Streaming toggle** - Enable/disable real-time response streaming
- **Model-specific settings** - Fine-tune parameters per AI assistant

### UI/UX Features

- **Clean interface** - Intuitive navigation with sidebar and toolbars
- **Responsive design** - Works on desktop and tablet screens
- **Dark-friendly UI** - Easy on the eyes with modern color schemes
- **Settings panel** - Quick access to profile and application settings
- **Notification system** - Real-time feedback on actions and errors
- **Backend health monitoring** - Visual indicator for API connectivity status

---

## Tech Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Zustand** - Lightweight state management with persistence
- **Vite** - Fast build tool and dev server
- **React Markdown** - Render AI responses as formatted markdown
- **React Icons** - Beautiful, consistent iconography

### Backend
- **NestJS** - Scalable Node.js framework
- **MongoDB** - Document database for chat/profile storage
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication (Google OAuth + JWT)
- **JWT** - Secure token-based authentication
- **CORS** - Cross-origin resource sharing

### Deployment
- **Frontend**: Vercel (automatic deployment from git)
- **Backend**: Node.js server with MongoDB connection
- **Database**: MongoDB Atlas or self-hosted

---

## Project Structure

```
UChat/
├── backend/                          # NestJS API server
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                # Google OAuth & JWT authentication
│   │   │   ├── users/               # User account management
│   │   │   ├── profile/             # User profile CRUD operations
│   │   │   ├── chat/                # Chat conversation management
│   │   │   └── message/             # Message storage and retrieval
│   │   ├── database/
│   │   │   └── mongodb.ts           # MongoDB connection setup
│   │   ├── app.module.ts            # Main app module
│   │   └── main.ts                  # Application entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                         # React Vite application
    ├── src/
    │   ├── components/              # Reusable React components
    │   │   ├── Chat.tsx             # Main chat interface
    │   │   ├── Sidebar.tsx          # Chat list sidebar
    │   │   ├── Toolbar.tsx          # Profile and model selection
    │   │   ├── Forward.tsx          # Forward message dialog
    │   │   ├── ProfileDetails.tsx   # Profile editor
    │   │   ├── Settings.tsx         # App settings
    │   │   └── ...
    │   ├── pages/
    │   │   └── App.tsx              # Main app layout
    │   ├── services/                # API communication
    │   │   ├── chatService.ts       # Chat API calls
    │   │   ├── messageService.ts    # Message API calls
    │   │   ├── userService.ts       # User/profile API calls
    │   │   └── aiServices.ts        # AI model API calls
    │   ├── stores/                  # Zustand state management
    │   │   ├── uiStore.ts           # UI state (active chat, settings, etc)
    │   │   ├── chatStores.ts        # Chat state
    │   │   ├── messageStores.ts     # Message state
    │   │   ├── userStore.ts         # User/profile state
    │   │   └── aiStore.ts           # AI model state
    │   ├── types/                   # TypeScript type definitions
    │   ├── constants/               # App constants (models, colors)
    │   ├── styles/                  # CSS stylesheets
    │   └── utils/                   # Utility functions
    ├── package.json
    └── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB (local or Atlas cloud)
- Google OAuth credentials (for authentication feature)
- API keys for DeepSeek and/or Google Gemini

### Installation

#### Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/uchat" > .env
echo "PORT=3000" >> .env
echo "NODE_ENV=development" >> .env
echo "GOOGLE_CLIENT_ID=your_google_client_id" >> .env
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env

# Start the server
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install

# Start the dev server
npm run dev
# App will be available at http://localhost:5173
```

### Configuration

**Frontend API Endpoints** (in service files):
- Change `http://localhost:3000` to your backend URL
- Update Google OAuth redirect URI in auth controller

**Backend CORS** (src/main.ts):
- Update allowed origins for production deployment
- Adjust cookie settings for your domain

---

## Usage

### Without Authentication
1. Start the app in guest mode
2. Create local profiles (stored in browser)
3. Create and manage chats locally
4. All data persists in browser storage

### With Authentication (Google OAuth)
1. Click login button in the toolbar
2. Authenticate with Google account
3. Profiles and chats sync with MongoDB
4. Access from any device with your Google account

### Creating a Chat
1. Click "New Chat" button
2. Select AI model (DeepSeek or Gemini)
3. Enter your API key for the model
4. Start typing your message

### Managing Messages
- **Pin**: Click pin icon to keep important messages at top
- **Edit**: Click edit icon to modify your message
- **Reply**: Click reply icon to quote a message
- **Delete**: Click delete icon to remove message
- **Forward**: Select multiple messages and forward to other chats

### Customizing Profiles
1. Click profile card in toolbar
2. Edit name, color, temperature, and token limits
3. Changes apply to new messages from that profile

---

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - OAuth callback (handled automatically)
- `GET /auth/me` - Get current user profile
- `GET /auth/logout` - Logout and clear session

### Profiles
- `POST /profile` - Create new profile
- `GET /profile/me` - Get all user profiles
- `PATCH /profile/:id` - Update profile
- `DELETE /profile/:id` - Delete profile

### Chats
- `POST /chat` - Create new chat
- `GET /chat/all` - Get all user chats
- `DELETE /chat/delete/:id` - Delete chat
- `PATCH /chat/rename/:id` - Rename chat
- `PATCH /chat/pin/:id` - Pin/unpin chat
- `GET /chat/:id/messages` - Get messages in chat

### Messages
- `POST /message` - Create and send message
- `DELETE /message/:id` - Delete message

---

## External AI Services

### DeepSeek
- **API**: `https://api.deepseek.com/chat/completions`
- **Model**: `deepseek-chat`
- **Docs**: [api.deepseek.com](https://api.deepseek.com)
- **Get API Key**: [platform.deepseek.com](https://platform.deepseek.com)

### Google Gemini
- **API**: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- **Model**: `gemini-2.5-flash`
- **Docs**: [ai.google.dev](https://ai.google.dev)
- **Get API Key**: [aistudio.google.com](https://aistudio.google.com)

---

## Future Enhancements

### Planned Features
- **RAG (Retrieval-Augmented Generation)**
  - Import documents (PDF, TXT, MD)
  - Automatic chunking and embedding generation
  - Semantic search over documents
  - Context injection into prompts
  
- **Document Management**
  - Tag and organize documents
  - Per-chat document configuration
  - Re-indexing on updates

- **Token Management**
  - Per-chat token counters
  - Token usage estimation
  - Hard token limits with warnings

- **Additional AI Models**
  - OpenAI integration
  - Anthropic Claude support
  - Local model support (Ollama, etc.)

- **Advanced Features**
  - Chat export (PDF, JSON)
  - Message search and filtering
  - Chat branching (experimental conversations)
  - Conversation templates
  - Custom system prompts

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

This project is licensed under the UNLICENSED license - see the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

## Roadmap

- ✅ Multi-model support (DeepSeek, Gemini)
- ✅ Authentication (Google OAuth)
- ✅ Profile management
- ✅ Message controls (pin, edit, forward, delete)
- ✅ Local persistence with Zustand
- 🚧 RAG system
- ⏳ Document management
- ⏳ Token usage tracking
- ⏳ Chat export functionality
- ⏳ More AI model integrations
