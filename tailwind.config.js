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
    extend: {
      animation: {
        flipToHeads: 'flipToHeads 1.5s forwards',
        flipToTails: 'flipToTails 1.5s forwards',
      },
      keyframes: {
        flipToHeads: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(1800deg)' }, // 5 full rotations
        },
        flipToTails: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(1980deg)' }, // 5 full rotations + 180 degrees
        },
      },
    },
  },
  plugins: [
    require('daisyui')
  ]
  
}

