import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const projects = [
  ['apps/web/vercel.json', '@luminol/web'],
  ['apps/admin/vercel.json', '@luminol/admin'],
  ['apps/portal/vercel.json', '@luminol/portal'],
] as const;

type VercelConfig = {
  git?: {
    deploymentEnabled?: Record<string, boolean>;
  };
  ignoreCommand?: string;
};

describe('Vercel Git deployment controls', () => {
  it.each(projects)(
    '%s disables every unmatched branch, including refs that contain slashes',
    (path, workspace) => {
      const config = JSON.parse(
        readFileSync(join(process.cwd(), path), 'utf8'),
      ) as VercelConfig;
      const deploymentEnabled = config.git?.deploymentEnabled;

      expect(deploymentEnabled).toMatchObject({
        '**': false,
        main: true,
        'preview-*': true,
      });
      expect(deploymentEnabled).not.toHaveProperty('*');
      expect(config.ignoreCommand).toContain(
        'if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then exit 1; fi;',
      );
      expect(config.ignoreCommand).toContain(
        `--packages ${workspace} --exit-code`,
      );
    },
  );
});
