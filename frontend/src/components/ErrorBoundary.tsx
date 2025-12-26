import React from "react";

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white flex items-center justify-center">
                    <div className="max-w-md text-center space-y-6">
                        <div className="text-5xl">⚠️</div>
                        <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                        <p className="text-gray-400">
                            We encountered an unexpected error. Please refresh the page and
                            try again.
                        </p>
                        {this.state.error && (
                            <details className="text-left bg-white/5 rounded-lg p-4 border border-white/10">
                                <summary className="cursor-pointer font-mono text-sm text-gray-300 hover:text-white">
                                    Error details
                                </summary>
                                <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
