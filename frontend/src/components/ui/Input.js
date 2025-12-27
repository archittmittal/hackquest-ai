import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef(({ className, label, error, icon, ...props }, ref) => {
    return (_jsxs("div", { className: "w-full space-y-2", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-300", children: label })), _jsxs("div", { className: "relative group", children: [icon && (_jsx("div", { className: "absolute inset-y-0 left-4 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors pointer-events-none", children: icon })), _jsx("input", { ref: ref, className: cn("w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder:text-gray-600", "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all", "disabled:opacity-50 disabled:cursor-not-allowed", icon ? "pl-12" : "", error ? "border-red-500/50 focus:ring-red-500/50" : "", className), ...props })] }), error && _jsx("p", { className: "text-sm text-red-400/80", children: error })] }));
});
Input.displayName = "Input";
