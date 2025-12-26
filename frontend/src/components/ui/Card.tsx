import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-lg border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm p-6 shadow-lg transition-all hover:shadow-xl hover:border-white/20 dark:bg-slate-950/50",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex flex-col space-y-1.5 pb-6", className)}
            {...props}
        >
            {children}
        </div>
    )
);
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-2xl font-bold tracking-tight text-white", className)}
            {...props}
        >
            {children}
        </h3>
    )
);
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps
    extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: React.ReactNode;
}

export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    CardDescriptionProps
>(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-400 leading-relaxed", className)}
        {...props}
    >
        {children}
    </p>
));
CardDescription.displayName = "CardDescription";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn("pt-0", className)} {...props}>
            {children}
        </div>
    )
);
CardContent.displayName = "CardContent";
