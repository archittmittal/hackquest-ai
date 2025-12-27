import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center", children: _jsxs("div", { className: "max-w-md text-center space-y-6", children: [_jsx("div", { className: "text-5xl", children: "\u26A0\uFE0F" }), _jsx("h1", { className: "text-2xl font-bold", children: "Oops! Something went wrong" }), _jsx("p", { className: "text-gray-400", children: "We encountered an unexpected error. Please refresh the page and try again." }), this.state.error && (_jsxs("details", { className: "text-left bg-white/5 rounded-lg p-4 border border-white/10", children: [_jsx("summary", { className: "cursor-pointer font-mono text-sm text-gray-300 hover:text-white", children: "Error details" }), _jsx("pre", { className: "mt-2 text-xs text-gray-400 overflow-auto", children: this.state.error.toString() })] })), _jsx("button", { onClick: () => window.location.reload(), className: "mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors", children: "Refresh Page" })] }) }));
        }
        return this.props.children;
    }
}
