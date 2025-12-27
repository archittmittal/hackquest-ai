import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "@/lib/utils";
export const Badge = React.forwardRef(({ className, variant = "default", children, icon, ...props }, ref) => {
    const variants = {
        default: "bg-blue-500/15 border border-blue-500/30 text-blue-400 dark:bg-blue-950 dark:border-blue-800",
        secondary: "bg-purple-500/15 border border-purple-500/30 text-purple-400 dark:bg-purple-950",
        outline: "bg-transparent border border-white/20 text-gray-300",
        success: "bg-green-500/15 border border-green-500/30 text-green-400 dark:bg-green-950",
        warning: "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 dark:bg-yellow-950",
    };
    return (_jsxs("div", { ref: ref, className: cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all", variants[variant], className), ...props, children: [icon && _jsx("span", { className: "flex-shrink-0", children: icon }), children] }));
});
Badge.displayName = "Badge";
