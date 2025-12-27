import { useEffect, useRef, useState } from "react";
/**
 * Hook for managing WebSocket connections with automatic reconnection
 */
export function useWebSocket(url, options = {}) {
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef(null);
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
                }
                catch (e) {
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
        }
        catch (error) {
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
    const send = (data) => {
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
