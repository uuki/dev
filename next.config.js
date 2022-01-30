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
}

module.exports = nextConfig
