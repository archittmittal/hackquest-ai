import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { cn } from "@/lib/utils";
export const Button = React.forwardRef(({ className, variant = "default", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const variants = {
        default: "bg-white text-black hover:bg-gray-100 active:scale-95 shadow-lg shadow-white/20 font-semibold",
        outline: "border border-white/20 text-white hover:border-white/40 hover:bg-white/5 ",
        ghost: "text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200",
        secondary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm rounded-md",
        md: "px-6 py-2.5 text-base rounded-lg",
        lg: "px-8 py-3.5 text-lg rounded-full font-bold",
    };
    return (_jsx("button", { ref: ref, disabled: disabled || isLoading, className: cn("inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black", variants[variant], sizes[size], className), ...props, children: children }));
});
Button.displayName = "Button";
