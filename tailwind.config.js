/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        colors: {
            'orange': '#EF6518',
            'red': '#F81A0C',
            'black': {
                100: '#1A1715',
                75: '#535150',
                50: '#8d8b8a',
                25: '#c6c5c5',
                10: '#e8e8e8',
                5: '#f4f3f3',
            },
            'green': '#359302'
        },
        extend: {},
    },
    plugins: [],
}

