module.exports = {
  plugins: {
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
