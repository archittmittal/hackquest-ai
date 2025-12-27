import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { create3DLogo } from "@/lib/logo-3d";
export const Logo3D = () => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current) {
            console.warn("Logo container ref not available");
            return;
        }
        try {
            console.log("Initializing 3D logo...");
            const cleanup = create3DLogo(containerRef.current);
            console.log("3D logo initialized successfully");
            return () => {
                if (cleanup) {
                    cleanup();
                }
            };
        }
        catch (error) {
            console.error("3D logo failed to initialize:", error);
        }
    }, []);
    return (_jsx("div", { ref: containerRef, style: {
            width: "100%",
            height: "200px",
            position: "relative",
        } }));
};
export default Logo3D;
