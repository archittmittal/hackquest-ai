/**
 * Agent service - handles WebSocket communication with backend
 */
import { WS_BASE_URL } from "@/lib/constants";
export class AgentService {
    ws = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 3;
    reconnectDelay = 2000;
    connect(onMessage, onError, onClose) {
        try {
            this.ws = new WebSocket(`${WS_BASE_URL}/ws/agent`);
            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
            };
            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    onMessage(msg);
                }
                catch (e) {
                    console.error("Failed to parse WebSocket message:", e);
                    onError("Invalid server response");
                }
            };
            this.ws.onerror = () => {
                onError("WebSocket connection failed");
            };
            this.ws.onclose = () => {
                this.ws = null;
                onClose();
                this.attemptReconnect(onMessage, onError, onClose);
            };
        }
        catch (error) {
            onError("Failed to establish connection");
        }
    }
    send(request) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(request));
            return true;
        }
        return false;
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
    generateMatch(request) {
        return this.send(request);
    }
    attemptReconnect(onMessage, onError, onClose) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(onMessage, onError, onClose), this.reconnectDelay);
        }
    }
}
// Export singleton instance
export const agentService = new AgentService();
