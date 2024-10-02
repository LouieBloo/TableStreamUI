/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  safelist: [
    'tooltip-top',
    'tooltip-bottom',
    'tooltip-left',
    'tooltip-right',
    // Include any other dynamically generated classes
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ]
  
}

