import nextPlugin from '@next/eslint-plugin-next';
import baseConfig from './index.mjs';

const { flatConfig } = nextPlugin;

export default [
  ...baseConfig,
  flatConfig.coreWebVitals,
  {
    settings: {
      next: {
        rootDir: '.',
      },
    },
  },
];
