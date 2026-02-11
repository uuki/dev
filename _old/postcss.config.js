module.exports = {
  plugins: {
    'postcss-custom-media': {},
    tailwindcss: {},
    'postcss-normalize': {},
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: false,
        grid: true,
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
  },
}
