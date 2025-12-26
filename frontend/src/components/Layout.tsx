import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, Menu } from "lucide-react";
import { useTheme } from "@/hooks";
import { useState } from "react";

interface LayoutProps {
    children: React.ReactNode;
    user?: { email: string; username: string; id?: string } | null;
    onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    user,
    onLogout,
}) => {
    const { theme, toggleTheme, mounted } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        );
    }

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: "📊" },
        { path: "/explore", label: "Explore", icon: "🔍" },
        { path: "/matches", label: "Matches", icon: "🎯" },
        { path: "/generate", label: "Generate", icon: "⚙️" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section - Hamburger + Username */}
                        <div className="flex items-center gap-3">
                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <Menu size={20} />
                            </button>

                            {/* User Profile */}
                            {user && (
                                <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">
                                            {user.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">
                                        {user.username}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right Section - Theme & Logout */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Toggle theme"
                                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                            >
                                {theme === "dark" ? (
                                    <Sun size={20} className="text-yellow-400" />
                                ) : (
                                    <Moon size={20} className="text-gray-300" />
                                )}
                            </button>

                            {/* Logout Button */}
                            {user && onLogout && (
                                <button
                                    onClick={onLogout}
                                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-400 transition-colors"
                                    aria-label="Logout"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Side Navigation Menu */}
            {mobileMenuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Slide-in Menu */}
                    <div className="fixed left-0 top-16 h-screen w-64 bg-black/95 backdrop-blur-xl border-r border-white/10 z-40 animate-in slide-in-from-left-96 duration-300">
                        <div className="flex flex-col gap-2 p-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-6 py-4 rounded-lg text-base font-medium transition-all flex items-center gap-3 ${isActive(link.path)
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                        : "text-gray-300 hover:bg-white/10"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="text-2xl">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 pt-16 pb-12">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* About */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">HackQuest AI</h3>
                            <p className="text-sm text-gray-400">
                                Win your next hackathon with AI-powered insights, profile
                                analysis, and winning strategies.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Quick Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        API Docs
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Support</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        Feedback
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
                        <p>&copy; 2025 HackQuest AI. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 sm:mt-0">
                            <a href="#" className="hover:text-white transition-colors">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Terms
                            </a>
                            <a href="#" className="hover:text-white transition-colors">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

Layout.displayName = "Layout";
