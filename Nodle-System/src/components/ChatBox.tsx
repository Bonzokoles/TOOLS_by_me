import { useState, useEffect, useRef, useCallback } from 'react';
import { chatClient, type ChatMessage, type LibraryInfo } from '../api/chatClient';
import './ChatBox.css';

interface ChatBoxProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function ChatBox({ isOpen, onToggle }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [libraries, setLibraries] = useState<LibraryInfo[]>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
    const [useKB, setUseKB] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load libraries on mount
    useEffect(() => {
        chatClient.getLibraries()
            .then(setLibraries)
            .catch((err) => console.warn('Failed to load libraries:', err));
    }, []);

    // Load chat history on mount
    useEffect(() => {
        chatClient.getHistory(50)
            .then((data) => setMessages(data.messages))
            .catch((err) => console.warn('Failed to load history:', err));
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
    };

    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        // Optimistic user message
        const tempUserMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            timestamp: new Date().toISOString(),
            role: 'user',
            message: trimmed,
            library: selectedLibrary,
        };
        setMessages((prev) => [...prev, tempUserMsg]);
        setInput('');
        setIsLoading(true);

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const response = await chatClient.sendMessage(trimmed, selectedLibrary, useKB);
            // Replace temp user msg with real, add assistant msg
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempUserMsg.id),
                response.userMessage,
                response.assistantMessage,
            ]);
        } catch (err) {
            // Add error message
            const errorMsg: ChatMessage = {
                id: `err-${Date.now()}`,
                timestamp: new Date().toISOString(),
                role: 'assistant',
                message: `❌ Błąd połączenia: ${err}`,
                type: 'no_results',
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, selectedLibrary, useKB]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = async () => {
        try {
            await chatClient.clearHistory();
            setMessages([]);
        } catch (err) {
            console.warn('Failed to clear history:', err);
        }
    };

    const formatTime = (ts: string) => {
        try {
            return new Date(ts).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            <button className="chatbox-toggle-btn" onClick={onToggle} title="Knowledge Chat">
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Panel */}
            <div className={`chatbox-panel ${isOpen ? '' : 'collapsed'}`}>
                {/* Header */}
                <div className="chatbox-header">
                    <h3>
                        <span>📚</span>
                        Knowledge Chat
                    </h3>
                    <div className="chatbox-header-actions">
                        <button onClick={clearChat} title="Wyczyść historię">🗑️</button>
                        <button onClick={onToggle} title="Zamknij">✕</button>
                    </div>
                </div>

                {/* Library selector */}
                <div className="chatbox-library-selector">
                    <select
                        value={selectedLibrary || ''}
                        onChange={(e) => setSelectedLibrary(e.target.value || null)}
                    >
                        <option value="">📁 Wszystkie biblioteki</option>
                        {libraries.map((lib) => (
                            <option key={lib.id} value={lib.id} disabled={!lib.exists}>
                                {lib.emoji} {lib.name} {!lib.exists ? '(brak)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Messages */}
                <div className="chatbox-messages">
                    {messages.length === 0 && !isLoading && (
                        <div className="chatbox-empty">
                            <div className="empty-icon">📚</div>
                            <div className="empty-text">
                                Zadaj pytanie o zawartość bibliotek wiedzy
                            </div>
                            <div className="empty-hint">
                                Money Machine • Bucket of Blood • Shadow Boxing • The Now • AI Lab • Tech Vault
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-message ${msg.role}`}>
                            <div className="message-content">{msg.message}</div>

                            {/* Sources */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="chat-sources">
                                    <details>
                                        <summary>📎 {msg.sources.length} źródeł</summary>
                                        {msg.sources.map((src, i) => (
                                            <div key={i} className="chat-source-item">
                                                <div className="source-file">{src.file}</div>
                                                <div className="source-snippet">{src.snippet.slice(0, 120)}...</div>
                                            </div>
                                        ))}
                                    </details>
                                </div>
                            )}

                            <div className="message-time">{formatTime(msg.timestamp)}</div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="chat-loading">
                            <span>Szukam w bibliotekach</span>
                            <div className="dot-pulse">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chatbox-input-area">
                    <div className="chatbox-input-row">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Zapytaj o wiedzę z bibliotek..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbox-send-btn"
                            onClick={sendMessage}
                            disabled={isLoading || !input.trim()}
                        >
                            ➤
                        </button>
                    </div>
                    <div className="chatbox-kb-toggle">
                        <input
                            type="checkbox"
                            id="kb-toggle"
                            checked={useKB}
                            onChange={(e) => setUseKB(e.target.checked)}
                        />
                        <label htmlFor="kb-toggle">Szukaj w Knowledge Base</label>
                        {selectedLibrary && (
                            <span style={{ marginLeft: 'auto', color: '#4a9eff', fontSize: '0.7rem' }}>
                                {libraries.find((l) => l.id === selectedLibrary)?.emoji}{' '}
                                {libraries.find((l) => l.id === selectedLibrary)?.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
