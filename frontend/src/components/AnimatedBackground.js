import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { createBackgroundScene } from "@/lib/three-background";
export const AnimatedBackground = () => {
    const containerRef = useRef(null);
    const animationFrameRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current) {
            console.warn("Container ref not available");
            return;
        }
        try {
            console.log("Initializing Three.js background...");
            const cleanup = createBackgroundScene(containerRef.current);
            console.log("Three.js background initialized successfully");
            return () => {
                if (cleanup) {
                    cleanup();
                }
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
        catch (error) {
            console.error("Three.js background failed to initialize:", error);
        }
    }, []);
    return (_jsx("div", { ref: containerRef, className: "w-full h-full", style: {
            width: "100%",
            height: "100%",
            overflow: "hidden"
        } }));
};
