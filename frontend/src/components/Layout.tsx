import React from 'react';
import { Header } from './Header';


interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return <LayoutContent>{children}</LayoutContent>;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-text selection:bg-primary/30 selection:text-white overflow-hidden relative transition-colors duration-300">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-100 transition-opacity duration-1000">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full bg-accent/5 blur-[100px]" />
            </div>

            <Header />

            <main className="relative z-10 pt-24 pb-12 container mx-auto px-4 max-w-5xl">
                {children}
            </main>

            <footer className="relative z-10 py-6 text-center text-sm text-textMuted border-t border-border/40 dark:border-white/5 bg-background/30 backdrop-blur-md">
                <p>&copy; {new Date().getFullYear()} <a href="https://github.com/xuzhifeng" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">xuzhifeng</a>. All rights reserved.</p>
            </footer>
        </div>
    );
}
