import { useState, useEffect } from "react";

type Theme = "light" | "dark";

/**
 * Hook for managing light/dark theme with localStorage persistence
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = stored || (prefersDark ? "dark" : "light");

        setTheme(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
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
