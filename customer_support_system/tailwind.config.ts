//const flowbite = require("flowbite-react/tailwind");
 import flowbite from 'flowbite-react/tailwind'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}",    flowbite.content(),],
  theme: {
    extend: {},
  },
  plugins: [
       flowbite.plugin(),
  ],
};
