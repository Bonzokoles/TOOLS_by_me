import axios, { type AxiosInstance } from 'axios';

// ── Types ──

export interface ChatMessage {
    id: string;
    timestamp: string;
    role: 'user' | 'assistant';
    message: string;
    library?: string | null;
    sources?: KBSearchResult[];
    type?: 'kb_retrieval' | 'no_results';
}

export interface KBSearchResult {
    file: string;
    library: string;
    library_name: string;
    score: number;
    snippet: string;
    size: number;
}

export interface LibraryInfo {
    id: string;
    name: string;
    emoji: string;
    description: string;
    exists: boolean;
}

export interface ChatResponse {
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
}

export interface SearchResponse {
    query: string;
    library: string | null;
    results: KBSearchResult[];
    total: number;
}

export interface ChatHistoryResponse {
    messages: ChatMessage[];
    total: number;
}

// ── Client ──

class ChatClient {
    private api: AxiosInstance;

    constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:8001/api') {
        // Remove /api suffix if present, since we add routes manually
        const base = baseURL.replace(/\/api\/?$/, '');
        this.api = axios.create({
            baseURL: `${base}/api`,
            timeout: 30000,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    /** Send chat message with optional KB context */
    async sendMessage(message: string, library?: string | null, useKB = true): Promise<ChatResponse> {
        const response = await this.api.post('/chat', {
            message,
            library: library || null,
            useKB,
        });
        return response.data;
    }

    /** Search knowledge base directly */
    async searchKB(query: string, library?: string | null, limit = 10): Promise<SearchResponse> {
        const response = await this.api.post('/chat/search', {
            query,
            library: library || null,
            limit,
        });
        return response.data;
    }

    /** Get available libraries */
    async getLibraries(): Promise<LibraryInfo[]> {
        const response = await this.api.get('/chat/libraries');
        return response.data.libraries;
    }

    /** Get chat history */
    async getHistory(limit = 50): Promise<ChatHistoryResponse> {
        const response = await this.api.get('/chat/history', { params: { limit } });
        return response.data;
    }

    /** Clear chat history */
    async clearHistory(): Promise<void> {
        await this.api.post('/chat/clear');
    }
}

export const chatClient = new ChatClient();
export default ChatClient;
