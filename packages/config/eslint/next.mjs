import { flatConfig } from '@next/eslint-plugin-next';
import baseConfig from './index.mjs';

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
