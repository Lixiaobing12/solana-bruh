/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,vue,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                themeText: '#FAB707',
                themeBtn: '#F6C72F'
            }
        },
    },
    plugins: [
        require('daisyui'),
    ],
    mode: 'jit'
}