
type Listener = (data: any) => void;

class WebSocketClient {
    private socket: WebSocket | null = null;
    private url: string;
    private listeners: Map<string, Set<Listener>> = new Map();
    private reconnectTimer: any = null;

    constructor(url: string = 'ws://localhost:8001/api/realtime/ws') {
        this.url = url;
    }

    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log('[WS] Connecting to:', this.url);
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('[WS] Connected');
            this.emit('connect', null);
        };

        this.socket.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                // Expect format { type: "EVENT_NAME", data: ... }
                if (payload.type) {
                    this.emit(payload.type, payload.data);
                }
            } catch (e) {
                console.error('[WS] Failed to parse message:', e);
            }
        };

        this.socket.onclose = () => {
            console.log('[WS] Disconnected');
            this.emit('disconnect', null);
            this.scheduleReconnect();
        };

        this.socket.onerror = (err) => {
            console.error('[WS] Error:', err);
        };
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, 3000);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    on(event: string, callback: Listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: Listener) {
        const set = this.listeners.get(event);
        if (set) {
            set.delete(callback);
        }
    }

    private emit(event: string, data: any) {
        const set = this.listeners.get(event);
        if (set) {
            set.forEach(cb => cb(data));
        }
    }
}

export const wsClient = new WebSocketClient();
export default WebSocketClient;
