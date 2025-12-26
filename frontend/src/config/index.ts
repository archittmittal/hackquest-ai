/**
 * Environment configuration - centralized config management
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const config = {
    env: {
        isDev,
        isProd,
        isPreview: !isDev && !isProd,
    },
    api: {
        baseUrl:
            (import.meta.env as Record<string, string>).VITE_API_URL ||
            "http://localhost:8000",
        wsUrl:
            (import.meta.env as Record<string, string>).VITE_WS_URL ||
            "ws://localhost:8000",
        timeout: 30000,
    },
    app: {
        name: "HackQuest AI",
        description: "Win your next hackathon with AI-powered insights",
        version: "1.0.0",
    },
    features: {
        enableAnalytics: !isDev,
        enableErrorReporting: !isDev,
        enableDebugPanel: isDev,
    },
};

export default config;
