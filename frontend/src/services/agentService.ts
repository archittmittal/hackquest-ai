/**
 * Agent service - handles WebSocket communication with backend
 */

import { WebSocketMessage, AgentRequest, AgentResult } from "@/types";
import { WS_BASE_URL } from "@/lib/constants";

export class AgentService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private reconnectDelay = 2000;

    connect(
        onMessage: (msg: WebSocketMessage) => void,
        onError: (error: string) => void,
        onClose: () => void
    ): void {
        try {
            this.ws = new WebSocket(`${WS_BASE_URL}/ws/agent`);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data) as WebSocketMessage;
                    onMessage(msg);
                } catch (e) {
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
        } catch (error) {
            onError("Failed to establish connection");
        }
    }

    send(request: AgentRequest): boolean {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(request));
            return true;
        }
        return false;
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    generateMatch(request: AgentRequest): boolean {
        return this.send(request);
    }

    private attemptReconnect(
        onMessage: (msg: WebSocketMessage) => void,
        onError: (error: string) => void,
        onClose: () => void
    ): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(
                () => this.connect(onMessage, onError, onClose),
                this.reconnectDelay
            );
        }
    }
}

// Export singleton instance
export const agentService = new AgentService();
