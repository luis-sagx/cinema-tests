/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'cinema-dark': '#0a0a0f',
                'cinema-darker': '#05050a',
                'cinema-light': '#1a1a2e',
                'cinema-accent': '#16213e',
                'cinema-blue': '#1e3a8a',
                'cinema-purple': '#581c87',
                'gold': '#ffd700',
                'gold-dark': '#ccaa00',
                'gold-light': '#ffe44d',
                'red-cinema': '#dc2626',
                'red-cinema-dark': '#991b1b',
                'purple-neon': '#a855f7',
                'blue-neon': '#3b82f6',
                'cyan-neon': '#06b6d4',
            },
        },
    },
    plugins: [],
}
