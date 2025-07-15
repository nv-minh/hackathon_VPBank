/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'vp-green': '#008848',
                'vp-green-dark': '#00733b',
                'vp-lime': '#c0df40',
                'vp-lime-dark': '#a3d026',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}