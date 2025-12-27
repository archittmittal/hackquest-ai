import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { cn } from "@/lib/utils";
/**
 * Skeleton loader with shimmer effect
 */
export const Skeleton = React.forwardRef(({ count = 1, circle = false, className, ...props }, ref) => {
    return (_jsx(_Fragment, { children: Array.from({ length: count }).map((_, i) => (_jsx("div", { ref: i === 0 ? ref : null, className: cn("bg-gradient-to-r from-gray-700/20 via-gray-600/30 to-gray-700/20 animate-pulse rounded-lg", circle && "rounded-full", className), ...props }, i))) }));
});
Skeleton.displayName = "Skeleton";
/**
 * Skeleton for card layouts
 */
export const SkeletonCard = ({ count = 3 }) => (_jsx("div", { className: "space-y-4", children: Array.from({ length: count }).map((_, i) => (_jsxs("div", { className: "p-6 rounded-lg border border-white/5 bg-white/5", children: [_jsx(Skeleton, { className: "h-6 mb-3 w-3/4" }), _jsx(Skeleton, { className: "h-4 mb-2 w-full" }), _jsx(Skeleton, { className: "h-4 w-5/6" })] }, i))) }));
SkeletonCard.displayName = "SkeletonCard";
/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 3 }) => (_jsx("div", { className: "space-y-2", children: Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { className: cn("h-4", i === lines - 1 && "w-5/6") }, i))) }));
SkeletonText.displayName = "SkeletonText";
