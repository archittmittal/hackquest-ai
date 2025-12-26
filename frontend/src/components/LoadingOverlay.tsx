import React from "react";
import { motion } from "framer-motion";

interface LoadingOverlayProps {
    isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/0 backdrop-blur-0"
        >
            {/* Logo Container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{
                    scale: isVisible ? 1 : 0.8,
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : -20,
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.2,
                }}
                className="flex flex-col items-center gap-4"
            >
                {/* Logo Icon */}
                <motion.div
                    animate={{
                        y: isVisible ? [0, -8, 0] : 0,
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: isVisible ? Infinity : 0,
                        ease: "easeInOut",
                    }}
                    className="w-20 h-20 bg-gradient-to-br from-white to-gray-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20"
                >
                    <span className="text-4xl font-black">⚡</span>
                </motion.div>

                {/* Branding Text */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">
                        HackQuest <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">AI</span>
                    </h1>
                    <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase">Pro Agent</p>
                </div>

                {/* Loading Indicator */}
                <motion.div
                    className="flex gap-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isVisible ? 1 : 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{
                                scale: isVisible ? [1, 1.5, 1] : 1,
                                opacity: isVisible ? [0.6, 1, 0.6] : 0.6,
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.2,
                                repeat: isVisible ? Infinity : 0,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Tagline */}
                <motion.p
                    className="text-xs text-gray-500 mt-4 font-light"
                    animate={{ opacity: isVisible ? [0.5, 1, 0.5] : 0 }}
                    transition={{
                        duration: 2,
                        repeat: isVisible ? Infinity : 0,
                        delay: 0.3,
                    }}
                >
                    Discovering your hackathon match...
                </motion.p>
            </motion.div>
        </motion.div>
    );
};
