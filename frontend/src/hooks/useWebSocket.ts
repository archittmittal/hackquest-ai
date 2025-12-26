import { useEffect, useRef, useState } from "react";

interface WebSocketMessage {
    event: string;
    node?: string;
    data?: any;
    message?: string;
}

interface UseWebSocketOptions {
    onMessage?: (msg: WebSocketMessage) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
    onOpen?: () => void;
}

/**
 * Hook for managing WebSocket connections with automatic reconnection
 */
export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = () => {
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                options.onOpen?.();
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    options.onMessage?.(msg);
                } catch (e) {
                    console.error("Failed to parse WebSocket message:", e);
                }
            };

            ws.onerror = (error) => {
                setIsConnected(false);
                options.onError?.(error);
            };

            ws.onclose = () => {
                setIsConnected(false);
                options.onClose?.();
                // Attempt reconnection after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            wsRef.current = ws;
        } catch (error) {
            console.error("WebSocket connection failed:", error);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url]);

    const send = (data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    };

    const close = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
    };

    return { isConnected, send, close };
}
