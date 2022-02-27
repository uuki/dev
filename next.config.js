/** @type {import('next').NextConfig} */
const path = require('path')
// *The syntax used in this project is dart-sass.
const globImporter = require('node-sass-glob-importer')

const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    importer: globImporter(),
    includePaths: [path.join(__dirname, './src/styles/app.scss')],
  },
  webpack: (webpackConfig) => {
    webpackConfig.module.rules.push({
      test: /\.ya?ml$/,
      use: 'js-yaml-loader',
    })

    webpackConfig.resolve = {
      ...webpackConfig.resolve,
      symlinks: false,
      alias: {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      },
    }

    return webpackConfig
  },
}

module.exports = nextConfig
