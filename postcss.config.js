module.exports = {
  plugins: {
    'postcss-normalize': {},
    'postcss-custom-media': {},
    'postcss-flexbugs-fixes': {},
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
