/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0ea5e9', // Sky Blue - keeping as base but adding teal options
                    dark: '#0284c7',
                    teal: '#14b8a6', // Teal 500
                    'teal-dark': '#0f766e', // Teal 700
                    'teal-light': '#ccfbf1', // Teal 100
                    /** @type {import('tailwindcss').Config} */
                    export default {
                        content: [
                            "./index.html",
                            "./src/**/*.{js,ts,jsx,tsx}",
                        ],
                        theme: {
                            extend: {
                                colors: {
                                    primary: {
                                        DEFAULT: '#1F6E8C', // Deep Teal / Petrol Blue
                                        light: '#2E84A6',
                                        dark: '#0E5E6F',
                                    },
                                    secondary: '#64748B', // Cool Grey for body text
                                    accent: '#0E5E6F',
                                    surface: {
                                        DEFAULT: '#FFFFFF',
                                        dark: '#1e293b',
                                    },
                                    background: {
                                        DEFAULT: '#F8F9FB', // Very Light Grey / Off-White
                                        dark: '#0f172a',
                                    },
                                    text: {
                                        main: '#1E293B', // Dark Slate for headings
                                        secondary: '#64748B', // Cool Grey for body
                                        light: '#94a3b8',
                                    },
                                    status: {
                                        info: { bg: '#E0F2FE', text: '#0369A1' },
                                        warning: { bg: '#FFEDD5', text: '#C2410C' },
                                        danger: { bg: '#FEE2E2', text: '#B91C1C' },
                                        success: { bg: '#D1FAE5', text: '#15803D' },
                                    }
                                },
                                fontFamily: {
                                    sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                                },
                                boxShadow: {
                                    'soft': '0 4px 20px rgba(0, 0, 0, 0.05)', // Very diffused, soft shadow
                                    'card': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                                },
                                borderRadius: {
                                    'xl': '12px',
                                    '2xl': '16px',
                                },
                            },
                        },
                        darkMode: 'class',
                        plugins: [],
                    }
