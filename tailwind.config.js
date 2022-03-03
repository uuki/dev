const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],
  theme: {
    screens: {
      sm: { max: '1023px' },
      md: { min: '1024px' },
    },
    variants: {
      margin: ['first'],
    },
    fontSize: {
      sm: [
        '0.875rem',
        {
          lineHeight: '1.6',
        },
      ],
      md: [
        '0.9375rem',
        {
          lineHeight: '1.5',
        },
      ],
    },
    extend: {
      // boxShadow: {
      // },
      transitionTimingFunction: {
        // Cubic
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        // Circ
        easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
        easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
        easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
        // Expo
        easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
        easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
        // Quad
        easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
        easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
        // Quart
        easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
        easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
        // Quint
        easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
        easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
        easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
        // Sine
        easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
        easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
        easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
        // Back
        easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
        easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'ヒラギノ角ゴ ProN W3',
          'Meiryo',
          'メイリオ',
          'sans-serif',
        ],
      },
      colors: {
        // theme
        text: {
          100: '#606060',
          400: '#231815',
        },
        // meta: '#9faab5',
        meta: '#707789',
        bg: '#f8fafb',
        shadow: 'rgba(#2a2b2b, 0.15)',
        // border: '#efefef',
        border: '#d6d7d8',
        link: {
          100: '#778aa5',
          400: '#4a5568',
        },
        // palette
        black: {
          400: '#2b2c30',
          800: '#3a3d3d',
        },
        gray: '#eef0f2',
        blue: '#00c2ff',
        navy: {
          400: '#485666',
          600: '#394554',
        },
        green: {
          100: '#0eb376',
          200: '#0a8557',
        },
        // service
        twitter: '#1d9bf0',
        hatena: '#00a5de',
        zenn: '#3ea8ff',
        qiita: '#55c500',
        pocket: '#ef3f56',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.400'),
            fontWeight: '400',
            a: {
              color: theme('colors.green.100'),
              transition: 'color 400ms',
              '&:hover': {
                color: `${theme('colors.green.200')}`,
              },
              code: { color: theme('colors.primary.400') },
            },
            h1: {
              position: 'relative',
              fontSize: '2.2rem',
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.900'),
              '&:hover a': {
                opacity: 1,
              },
            },
            h2: {
              position: 'relative',
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.900'),
              '&:hover a': {
                opacity: 1,
              },
            },
            h3: {
              position: 'relative',
              fontWeight: '600',
              color: theme('colors.gray.900'),
              '&:hover a': {
                opacity: 1,
              },
            },
            'h4,h5,h6': {
              position: 'relative',
              color: theme('colors.gray.900'),
              '&:hover a': {
                opacity: 1,
              },
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
            },
            code: {
              color: theme('colors.pink.500'),
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: '0.25rem',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            details: {
              backgroundColor: theme('colors.gray.100'),
              paddingLeft: '4px',
              paddingRight: '4px',
              paddingTop: '2px',
              paddingBottom: '2px',
              borderRadius: '0.25rem',
            },
            hr: { borderColor: theme('colors.gray.200') },
            'ol li::marker': {
              fontWeight: '600',
              color: theme('colors.gray.500'),
            },
            'ul li::marker': {
              backgroundColor: theme('colors.gray.500'),
            },
            strong: { color: theme('colors.gray.600') },
            blockquote: {
              color: theme('colors.gray.900'),
              borderLeftColor: theme('colors.gray.200'),
            },
            ul: {},
            '.yt-lite': {
              margin: '30px 0',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.400')} !important`,
              },
              code: { color: theme('colors.primary.400') },
            },
            h1: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.100'),
            },
            h2: {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
              color: theme('colors.gray.100'),
            },
            h3: {
              fontWeight: '600',
              color: theme('colors.gray.100'),
            },
            'h4,h5,h6': {
              color: theme('colors.gray.100'),
            },
            pre: {
              backgroundColor: theme('colors.gray.800'),
            },
            code: {
              backgroundColor: theme('colors.gray.800'),
            },
            details: {
              backgroundColor: theme('colors.gray.800'),
            },
            hr: { borderColor: theme('colors.gray.700') },
            'ol li::marker': {
              fontWeight: '600',
              color: theme('colors.gray.400'),
            },
            'ul li::marker': {
              backgroundColor: theme('colors.gray.400'),
            },
            strong: { color: theme('colors.gray.100') },
            thead: {
              th: {
                color: theme('colors.gray.100'),
              },
            },
            tbody: {
              tr: {
                borderBottomColor: theme('colors.gray.700'),
              },
            },
            blockquote: {
              color: theme('colors.gray.100'),
              borderLeftColor: theme('colors.gray.700'),
            },
          },
        },
      }),
    },
  },
}
