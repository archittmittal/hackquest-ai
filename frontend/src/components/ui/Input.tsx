import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute inset-y-0 left-4 flex items-center text-gray-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-white placeholder:text-gray-600",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            icon ? "pl-12" : "",
                            error ? "border-red-500/50 focus:ring-red-500/50" : "",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-400/80">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
