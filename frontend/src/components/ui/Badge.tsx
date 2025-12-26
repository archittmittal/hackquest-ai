import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "outline" | "success" | "warning";
    children?: React.ReactNode;
    icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", children, icon, ...props }, ref) => {
        const variants = {
            default:
                "bg-blue-500/15 border border-blue-500/30 text-blue-400 dark:bg-blue-950 dark:border-blue-800",
            secondary:
                "bg-purple-500/15 border border-purple-500/30 text-purple-400 dark:bg-purple-950",
            outline: "bg-transparent border border-white/20 text-gray-300",
            success:
                "bg-green-500/15 border border-green-500/30 text-green-400 dark:bg-green-950",
            warning:
                "bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 dark:bg-yellow-950",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
            </div>
        );
    }
);
Badge.displayName = "Badge";
