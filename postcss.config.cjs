const postcssGlobalData = require('@csstools/postcss-global-data');
const postcssLayerWrap = require('./scripts/postcss-layer-wrap.cjs');

module.exports = {
  plugins: [
    // Files for preprocessor (not output as source after build)
    // IMPORTANT: Must be placed BEFORE postcss-custom-media
    postcssGlobalData({
      files: ['./src/styles/settings/_custom-media.scss']
    }),
    require('postcss-custom-media'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'custom-properties': true
      }
    }),
    // Wrap output in @layer based on file path.
    // Order declared in src/styles/settings/_layers.scss.
    postcssLayerWrap(),
  ]
};
