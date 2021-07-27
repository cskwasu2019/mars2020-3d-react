const colors = require('tailwindcss/colors')

module.exports = {
  purge: [
    './src/**/*.js',
    './src/**/*.jsx',
    './src/**/*.css',
    './public/**/*.html',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      gray: colors.trueGray,
      white: colors.white,
      black: colors.black,
      red: colors.red,
      primary: {
        DEFAULT: '#FFCC99',
        dark: '#E6B88A',
        darker: '#FF9966',
      },
    },
    fontFamily: {
      'nunito-sans': ['Nunito Sans'],
      roboto: ['Roboto'],
      montserrat: ['Montserrat'],
      'bebas-neue': ['Bebas Neue'],
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
