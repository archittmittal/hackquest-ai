import { useState, useEffect } from "react";
/**
 * Hook for managing light/dark theme with localStorage persistence
 */
export function useTheme() {
    const [theme, setTheme] = useState("dark");
    const [mounted, setMounted] = useState(false);
    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = stored || (prefersDark ? "dark" : "light");
        setTheme(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);
    const applyTheme = (newTheme) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        }
        else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme);
    };
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        applyTheme(newTheme);
    };
    return { theme, toggleTheme, mounted };
}
