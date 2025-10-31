/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",   // EJS files
    "./public/**/*.js"    // JS files (agar Tailwind classes use ho rahi hain)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
