const webpack = require('webpack')
const WebpackPWAManifest = require('webpack-pwa-manifest')
const path = require('path')
const package = require('./package.json')
const colors = require('tailwindcss/colors')

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('postcss-import'),
        require('tailwindcss'),
        require('postcss-nesting'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    plugins: {
      add: [
        new webpack.DefinePlugin({
          APP_VERSION: JSON.stringify(package.version),
        }),
        new WebpackPWAManifest({
          name: package.name,
          short_name: 'Mars2020',
          description: package.description,
          background_color: colors.trueGray[700],
          theme_color: colors.trueGray[800],
          inject: true,
          ios: true,
          icons: [
            {
              sizes: ['192', '256', '512'],
              ios: true,
              src: path.join(__dirname, 'src', 'icon.png'),
            },
            {
              size: '512x512',
              src: path.join(__dirname, 'src', 'icon.png'),
              purpose: 'maskable',
            },
          ],
        }),
      ],
    },
  },
}
