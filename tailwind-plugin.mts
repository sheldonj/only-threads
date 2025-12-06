/* eslint-disable @typescript-eslint/no-explicit-any */
import svgToDataUri from 'mini-svg-data-uri';
import { type Config } from 'tailwindcss';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

export default {
  plugins: [
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          'bg-dot': (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
            )}")`,
          }),
          'bg-grid': (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
          'bg-grid-small': (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
        },
        {
          type: 'color',
          values: flattenColorPalette(theme('backgroundColor')),
        },
      );
    },
    ({ addBase, theme }: any) => {
      const allColors = flattenColorPalette(theme('colors'));
      const newVariables = Object.fromEntries(
        Object.entries(allColors).map(([key, value]) => [`--${key}`, value]),
      );

      addBase({
        ':root': newVariables,
      });
    },
  ],
} satisfies Config;
