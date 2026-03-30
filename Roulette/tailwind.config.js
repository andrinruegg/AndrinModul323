/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,tsx,tsx}",
    ],
    theme: {
        extend: {
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
            },
            animation: {
                'spin-slow': 'spin 10s linear infinite',
                'spin-reverse-slow': 'spin-reverse 8s linear infinite',
            },
            keyframes: {
                'spin-reverse': {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                'shimmer': {
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        }
    },
    plugins: [],
}
