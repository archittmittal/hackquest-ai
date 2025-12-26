/**
 * Utility function for merging classnames with conditional support
 * Handles undefined, null, false values and merges Tailwind classes intelligently
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes
        .filter((cls) => typeof cls === "string" && cls.length > 0)
        .join(" ");
}

/**
 * Format large numbers with abbreviations (e.g., 1234 -> "1.2k")
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Copy text to clipboard with feedback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
