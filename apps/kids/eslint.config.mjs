import base from '@luminol/config/eslint';

export default [
  ...base,
  {
    ignores: ['.expo/**', 'expo-env.d.ts', 'babel.config.js', 'jest.config.js'],
  },
];
