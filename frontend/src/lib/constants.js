/**
 * Application constants and configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
export const AVAILABLE_SKILLS = [
    "TensorFlow",
    "Solidity",
    "Tailwind",
    "Next.js",
    "PyTorch",
    "Rust",
    "Node.js",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Web3.js",
];
export const STATUS_MAP = {
    analyze_profile: "📊 Reading your GitHub DNA...",
    match_hackathons: "🔍 Scanning global databases...",
    judge_simulation: "⚖️ Simulating judging committee...",
    generate_boilerplate: "🏗️ Architecting winning boilerplate...",
};
export const ANIMATION_DURATION = {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
};
export const Z_INDEX = {
    DROPDOWN: 40,
    STICKY: 20,
    FIXED: 50,
    MODAL: 50,
    TOOLTIP: 50,
};
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    "2XL": 1536,
};
