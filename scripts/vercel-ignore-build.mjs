import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECTS = {
  prj_HtkY27LjPLMO0uRoMcZHFDF0h36J: {
    name: 'web',
    paths: [
      'apps/web/',
      'packages/auth/',
      'packages/config/',
      'packages/database/',
      'packages/types/',
      'packages/ui/',
      'packages/validation/',
    ],
  },
  prj_NOUhe9K3m1QDvCpo3WIqjZaVMSVy: {
    name: 'portal',
    paths: [
      'apps/portal/',
      'packages/auth/',
      'packages/config/',
      'packages/database/',
      'packages/finance/',
      'packages/language/',
      'packages/types/',
      'packages/ui/',
      'packages/validation/',
    ],
  },
  prj_R9pQi9j8KjaNEYiVyjXE2TS5hvBt: {
    name: 'admin',
    paths: [
      'apps/admin/',
      'packages/auth/',
      'packages/certificates/',
      'packages/config/',
      'packages/database/',
      'packages/finance/',
      'packages/types/',
      'packages/ui/',
      'packages/validation/',
    ],
  },
};

const KNOWN_APP_PREFIXES = [
  'apps/admin/',
  'apps/portal/',
  'apps/studio/',
  'apps/web/',
];

const KNOWN_PACKAGE_PREFIXES = [
  'packages/analytics/',
  'packages/auth/',
  'packages/certificates/',
  'packages/config/',
  'packages/database/',
  'packages/emails/',
  'packages/finance/',
  'packages/language/',
  'packages/notifications/',
  'packages/professional/',
  'packages/types/',
  'packages/ui/',
  'packages/utils/',
  'packages/validation/',
  'packages/worker/',
];

const GLOBAL_BUILD_FILES = new Set([
  '.npmrc',
  '.node-version',
  '.nvmrc',
  'Dockerfile',
  'docker-compose.yml',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'turbo.json',
  'vercel.json',
]);

const NON_DEPLOYABLE_ROOT_FILES = new Set([
  '.env.example',
  '.gitignore',
  '.prettierignore',
  '.prettierrc.json',
  'AGENTS.md',
  'README.md',
  'playwright.config.ts',
  'vitest.config.ts',
]);

export function normalizePath(value) {
  return value.replace(/\\/g, '/').replace(/^\.\//, '').trim();
}

function hasPrefix(path, prefixes) {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

export function isTestOnlyPath(path) {
  return (
    path.startsWith('tests/') ||
    path.startsWith('e2e/') ||
    path.includes('/__tests__/') ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(path)
  );
}

export function isNonDeployablePath(path) {
  return (
    NON_DEPLOYABLE_ROOT_FILES.has(path) ||
    path.startsWith('.github/') ||
    path.startsWith('docs/') ||
    path.startsWith('apps/studio/') ||
    path === 'scripts/vercel-ignore-build.test.mjs' ||
    isTestOnlyPath(path)
  );
}

export function isGlobalBuildPath(path) {
  return (
    GLOBAL_BUILD_FILES.has(path) ||
    path === 'scripts/vercel-ignore-build.mjs'
  );
}

export function decideBuild({ env, changedFiles }) {
  if (env.VERCEL_ENV === 'production' || env.VERCEL_GIT_COMMIT_REF === 'main') {
    return {
      build: true,
      reason: 'production and main deployments always build',
    };
  }

  const project = PROJECTS[env.VERCEL_PROJECT_ID];
  if (!project) {
    return { build: true, reason: 'unknown Vercel project' };
  }

  if (!Array.isArray(changedFiles)) {
    return { build: true, reason: 'changed files could not be determined' };
  }

  if (changedFiles.length === 0) {
    return { build: false, reason: 'no repository changes detected' };
  }

  for (const rawPath of changedFiles) {
    const path = normalizePath(rawPath);
    if (!path) {
      return {
        build: true,
        reason: 'an empty or malformed path was detected',
      };
    }

    if (isGlobalBuildPath(path)) {
      return { build: true, reason: `${path} affects every deployment` };
    }

    if (isNonDeployablePath(path)) {
      continue;
    }

    if (hasPrefix(path, project.paths)) {
      return { build: true, reason: `${path} affects ${project.name}` };
    }

    if (
      hasPrefix(path, KNOWN_APP_PREFIXES) ||
      hasPrefix(path, KNOWN_PACKAGE_PREFIXES)
    ) {
      continue;
    }

    return { build: true, reason: `${path} is not classified safely` };
  }

  return {
    build: false,
    reason: `all changes are irrelevant to ${project.name}`,
  };
}

export function isValidSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{7,40}$/i.test(value);
}

export function getChangedFiles(env, cwd = process.cwd()) {
  const previousSha = env.VERCEL_GIT_PREVIOUS_SHA;
  const currentSha = env.VERCEL_GIT_COMMIT_SHA;

  if (!isValidSha(previousSha) || !isValidSha(currentSha)) {
    return null;
  }

  const result = spawnSync(
    'git',
    [
      'diff',
      '--name-only',
      '--no-renames',
      '--diff-filter=ACDMRTUXB',
      previousSha,
      currentSha,
      '--',
    ],
    {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    },
  );

  if (result.status !== 0 || result.error) {
    return null;
  }

  return result.stdout
    .split('\n')
    .map(normalizePath)
    .filter(Boolean);
}

export function run(env = process.env, cwd = process.cwd()) {
  const changedFiles = getChangedFiles(env, cwd);
  const decision = decideBuild({ env, changedFiles });
  const action = decision.build ? 'build' : 'skip';
  console.log(`[vercel-ignore] ${action}: ${decision.reason}`);
  return decision.build ? 1 : 0;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = run();
}
