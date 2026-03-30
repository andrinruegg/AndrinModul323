/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,tsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
            colors: {
                gold: {
                    50: '#fffdf0',
                    100: '#fff9d6',
                    200: '#fff0ad',
                    300: '#ffe075',
                    400: '#ffcc3d',
                    500: '#ffab0a',
                    600: '#e68a00',
                    700: '#bf6a00',
                    800: '#995100',
                    900: '#7d4303',
                    950: '#472100',
                },
                casino: {
                    bg: '#08090e',
                    surface: '#0f1320',
                    panel: '#0c0e16',
                    border: 'rgba(255,171,10,0.12)',
                },
            },
            animation: {
                'spin-slow': 'spin 12s linear infinite',
                'spin-reverse-slow': 'spin-reverse 10s linear infinite',
                'pulse-gold': 'pulse-gold 2.5s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'float': 'float 4s ease-in-out infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                'shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'pulse-gold': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(255,171,10,0.3)' },
                    '50%': { boxShadow: '0 0 50px rgba(255,171,10,0.7)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
            },
            boxShadow: {
                'gold': '0 0 30px rgba(255,171,10,0.4)',
                'gold-lg': '0 0 60px rgba(255,171,10,0.6)',
            },
        }
    },
    plugins: [],
}
