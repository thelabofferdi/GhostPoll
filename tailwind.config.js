/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#f97316", // Orange for the 'void' and accents
                "background-light": "#f8fafc",
                "background-dark": "#020617",
                // Keeping some utilities from previous config if needed, mapping new names
                bg: {
                    DEFAULT: '#020617', // Mapped to background-dark
                    secondary: '#0f172a',
                },
                text: {
                    DEFAULT: '#f8fafc',
                    secondary: '#94a3b8',
                    muted: '#64748b',
                }
            },
            fontFamily: {
                display: ["Instrument Serif", "serif"],
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "1rem",
            },
        },
    },
    plugins: [],
}
