import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    count?: number;
    circle?: boolean;
    className?: string;
}

/**
 * Skeleton loader with shimmer effect
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ count = 1, circle = false, className, ...props }, ref) => {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        ref={i === 0 ? ref : null}
                        className={cn(
                            "bg-gradient-to-r from-gray-700/20 via-gray-600/30 to-gray-700/20 animate-pulse rounded-lg",
                            circle && "rounded-full",
                            className
                        )}
                        {...props}
                    />
                ))}
            </>
        );
    }
);
Skeleton.displayName = "Skeleton";

/**
 * Skeleton for card layouts
 */
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-6 rounded-lg border border-white/5 bg-white/5">
                <Skeleton className="h-6 mb-3 w-3/4" />
                <Skeleton className="h-4 mb-2 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        ))}
    </div>
);
SkeletonCard.displayName = "SkeletonCard";

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                className={cn("h-4", i === lines - 1 && "w-5/6")}
            />
        ))}
    </div>
);
SkeletonText.displayName = "SkeletonText";
