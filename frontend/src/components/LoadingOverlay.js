import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
export const LoadingOverlay = ({ isVisible }) => {
    return (_jsx(motion.div, { initial: { opacity: 1 }, animate: { opacity: isVisible ? 1 : 0 }, exit: { opacity: 0 }, transition: { duration: 0.8, ease: "easeInOut" }, style: { pointerEvents: isVisible ? "auto" : "none" }, className: "fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/0 backdrop-blur-0", children: _jsxs(motion.div, { initial: { scale: 0.8, opacity: 0, y: -20 }, animate: {
                scale: isVisible ? 1 : 0.8,
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : -20,
            }, transition: {
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2,
            }, className: "flex flex-col items-center gap-4", children: [_jsx(motion.div, { animate: {
                        y: isVisible ? [0, -8, 0] : 0,
                    }, transition: {
                        duration: 2.5,
                        repeat: isVisible ? Infinity : 0,
                        ease: "easeInOut",
                    }, className: "w-20 h-20 bg-gradient-to-br from-white to-gray-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20", children: _jsx("span", { className: "text-4xl font-black", children: "\u26A1" }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsxs("h1", { className: "text-4xl font-black tracking-tight", children: ["HackQuest ", _jsx("span", { className: "bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent", children: "AI" })] }), _jsx("p", { className: "text-sm font-semibold text-gray-400 tracking-widest uppercase", children: "Pro Agent" })] }), _jsx(motion.div, { className: "flex gap-2 mt-6", initial: { opacity: 0 }, animate: { opacity: isVisible ? 1 : 0 }, transition: { delay: 0.5 }, children: [0, 1, 2].map((i) => (_jsx(motion.div, { className: "w-2 h-2 bg-white rounded-full", animate: {
                            scale: isVisible ? [1, 1.5, 1] : 1,
                            opacity: isVisible ? [0.6, 1, 0.6] : 0.6,
                        }, transition: {
                            duration: 1.5,
                            delay: i * 0.2,
                            repeat: isVisible ? Infinity : 0,
                        } }, i))) }), _jsx(motion.p, { className: "text-xs text-gray-500 mt-4 font-light", animate: { opacity: isVisible ? [0.5, 1, 0.5] : 0 }, transition: {
                        duration: 2,
                        repeat: isVisible ? Infinity : 0,
                        delay: 0.3,
                    }, children: "Discovering your hackathon match..." })] }) }));
};
