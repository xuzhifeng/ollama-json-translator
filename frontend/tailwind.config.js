/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--background) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                surfaceLight: 'var(--surface-light)',
                text: 'var(--text)',
                textMuted: 'var(--text-muted)',
                border: 'var(--border)',
                primary: '#3b82f6',
                secondary: '#8b5cf6',
                accent: '#06b6d4',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
