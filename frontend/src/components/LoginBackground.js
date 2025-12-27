import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { createLoginBackgroundScene } from "@/lib/login-background";
export const LoginBackground = () => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current) {
            console.warn("Container ref not available");
            return;
        }
        try {
            console.log("Initializing Login Three.js background...");
            const cleanup = createLoginBackgroundScene(containerRef.current);
            console.log("Login Three.js background initialized successfully");
            return () => {
                if (cleanup) {
                    cleanup();
                }
            };
        }
        catch (error) {
            console.error("Login Three.js background failed to initialize:", error);
        }
    }, []);
    return (_jsx("div", { ref: containerRef, style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#000000",
            zIndex: 0
        } }));
};
export default LoginBackground;
