/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#1c74e9",
                "background-light": "#f6f7f8",
                "background-dark": "#111821",
                "sidebar-light": "#F8F9FA",
            },
            fontFamily: {
                "display": ["Inter", "Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "full": "9999px"
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
