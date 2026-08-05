import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  decideBuild,
  getChangedFiles,
  isValidSha,
  normalizePath,
} from './vercel-ignore-build.mjs';

const projectIds = {
  web: 'prj_HtkY27LjPLMO0uRoMcZHFDF0h36J',
  portal: 'prj_NOUhe9K3m1QDvCpo3WIqjZaVMSVy',
  admin: 'prj_R9pQi9j8KjaNEYiVyjXE2TS5hvBt',
};

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function builds(project, changedFiles, environment = {}) {
  return decideBuild({
    env: {
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'feat/test-deploy-rule',
      VERCEL_PROJECT_ID: projectIds[project],
      ...environment,
    },
    changedFiles,
  }).build;
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0 || result.error) {
    throw new Error(
      `git ${args.join(' ')} failed: ${result.error?.message ?? result.stderr}`,
    );
  }
  return result.stdout.trim();
}

describe('Vercel ignored build classifier', () => {
  it('always builds production and main deployments', () => {
    expect(
      builds('web', ['docs/operations.md'], { VERCEL_ENV: 'production' }),
    ).toBe(true);
    expect(
      builds('web', ['docs/operations.md'], {
        VERCEL_GIT_COMMIT_REF: 'main',
      }),
    ).toBe(true);
  });

  it('fails open for unknown projects or unavailable change data', () => {
    expect(
      decideBuild({
        env: {
          VERCEL_ENV: 'preview',
          VERCEL_GIT_COMMIT_REF: 'feat/test',
          VERCEL_PROJECT_ID: 'prj_unknown',
        },
        changedFiles: ['docs/operations.md'],
      }).build,
    ).toBe(true);
    expect(
      decideBuild({
        env: {
          VERCEL_ENV: 'preview',
          VERCEL_GIT_COMMIT_REF: 'feat/test',
          VERCEL_PROJECT_ID: projectIds.web,
        },
        changedFiles: null,
      }).build,
    ).toBe(true);
  });

  it('skips documentation, Studio, CI and test-only changes', () => {
    const files = [
      '.github/workflows/ci.yml',
      'apps/studio/schemaTypes/index.ts',
      'apps/web/lib/sanity.test.ts',
      'docs/cms.md',
      'playwright.config.ts',
      'vitest.config.ts',
    ];

    expect(builds('web', files)).toBe(false);
    expect(builds('portal', files)).toBe(false);
    expect(builds('admin', files)).toBe(false);
  });

  it('builds only the application whose source changed', () => {
    expect(builds('web', ['apps/web/app/page.tsx'])).toBe(true);
    expect(builds('portal', ['apps/web/app/page.tsx'])).toBe(false);
    expect(builds('admin', ['apps/web/app/page.tsx'])).toBe(false);

    expect(builds('web', ['apps/portal/app/page.tsx'])).toBe(false);
    expect(builds('portal', ['apps/portal/app/page.tsx'])).toBe(true);
    expect(builds('admin', ['apps/portal/app/page.tsx'])).toBe(false);

    expect(builds('web', ['apps/admin/app/page.tsx'])).toBe(false);
    expect(builds('portal', ['apps/admin/app/page.tsx'])).toBe(false);
    expect(builds('admin', ['apps/admin/app/page.tsx'])).toBe(true);
  });

  it('preserves direct and transitive shared-package dependencies', () => {
    for (const project of ['web', 'portal', 'admin']) {
      expect(builds(project, ['packages/auth/src/index.ts'])).toBe(true);
      expect(builds(project, ['packages/config/security-headers.mjs'])).toBe(
        true,
      );
      expect(builds(project, ['packages/database/prisma/schema.prisma'])).toBe(
        true,
      );
      expect(builds(project, ['packages/types/src/index.ts'])).toBe(true);
      expect(builds(project, ['packages/ui/src/index.tsx'])).toBe(true);
      expect(builds(project, ['packages/validation/src/index.ts'])).toBe(true);
    }
  });

  it('builds portal and administration for finance changes', () => {
    expect(builds('web', ['packages/finance/src/index.ts'])).toBe(false);
    expect(builds('portal', ['packages/finance/src/index.ts'])).toBe(true);
    expect(builds('admin', ['packages/finance/src/index.ts'])).toBe(true);
  });

  it('builds only portal for language changes', () => {
    expect(builds('web', ['packages/language/src/index.ts'])).toBe(false);
    expect(builds('portal', ['packages/language/src/index.ts'])).toBe(true);
    expect(builds('admin', ['packages/language/src/index.ts'])).toBe(false);
  });

  it('builds only administration for certificate changes', () => {
    expect(builds('web', ['packages/certificates/src/index.ts'])).toBe(false);
    expect(builds('portal', ['packages/certificates/src/index.ts'])).toBe(
      false,
    );
    expect(builds('admin', ['packages/certificates/src/index.ts'])).toBe(true);
  });

  it('builds every project for root dependency and deployment inputs', () => {
    for (const file of [
      '.npmrc',
      'Dockerfile',
      'package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'turbo.json',
      'vercel.json',
    ]) {
      expect(builds('web', [file])).toBe(true);
      expect(builds('portal', [file])).toBe(true);
      expect(builds('admin', [file])).toBe(true);
    }
  });

  it('handles a cumulative CI-only and web-source comparison safely', () => {
    const files = ['vitest.config.ts', 'apps/web/lib/sanity.ts'];

    expect(builds('web', files)).toBe(true);
    expect(builds('portal', files)).toBe(false);
    expect(builds('admin', files)).toBe(false);
  });

  it('builds on classifier changes and unknown paths', () => {
    expect(builds('web', ['scripts/vercel-ignore-build.mjs'])).toBe(true);
    expect(builds('portal', ['infrastructure/unknown.yml'])).toBe(true);
  });

  it('reports both sides of a rename so moving runtime code cannot look docs-only', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'luminol-vercel-ignore-'));
    temporaryDirectories.push(cwd);
    mkdirSync(join(cwd, 'apps/web'), { recursive: true });
    mkdirSync(join(cwd, 'docs'), { recursive: true });
    writeFileSync(
      join(cwd, 'apps/web/example.ts'),
      'export const value = 1;\n',
    );

    git(cwd, ['init', '--quiet']);
    git(cwd, ['config', 'user.email', 'tests@example.com']);
    git(cwd, ['config', 'user.name', 'Luminol Tests']);
    git(cwd, ['add', '.']);
    git(cwd, ['commit', '--quiet', '-m', 'initial']);
    const previousSha = git(cwd, ['rev-parse', 'HEAD']);

    git(cwd, ['mv', 'apps/web/example.ts', 'docs/example.ts']);
    git(cwd, ['commit', '--quiet', '-m', 'move runtime file']);
    const currentSha = git(cwd, ['rev-parse', 'HEAD']);

    const changedFiles = getChangedFiles(
      {
        VERCEL_GIT_PREVIOUS_SHA: previousSha,
        VERCEL_GIT_COMMIT_SHA: currentSha,
      },
      cwd,
    );

    expect(changedFiles?.sort()).toEqual([
      'apps/web/example.ts',
      'docs/example.ts',
    ]);
    expect(builds('web', changedFiles)).toBe(true);
  });

  it('skips an empty comparison and normalizes Git paths', () => {
    expect(builds('web', [])).toBe(false);
    expect(normalizePath('.\\apps\\web\\app\\page.tsx')).toBe(
      'apps/web/app/page.tsx',
    );
  });

  it('accepts only hexadecimal Git SHAs', () => {
    expect(isValidSha('9525df2d6c8181bf700499974cffdaf7604493ff')).toBe(true);
    expect(isValidSha('HEAD')).toBe(false);
    expect(isValidSha('9525df2; rm -rf /')).toBe(false);
  });
});
