import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-textMuted mb-1.5 ml-1">{label}</label>}
            <input
                className={cn(
                    "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-textMuted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    error && "border-red-500/50 focus:ring-red-500/20",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export function Select({ className, label, options, ...props }: SelectProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-textMuted mb-1.5 ml-1">{label}</label>}
            <div className="relative">
                <select
                    className={cn(
                        "flex h-10 w-full appearance-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 pr-8",
                        className
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface text-text">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
            </div>
        </div>
    );
}
