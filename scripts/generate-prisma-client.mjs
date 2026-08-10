import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const databaseDirectory = join(repositoryRoot, 'packages', 'database');
const generatedDirectory = join(databaseDirectory, 'generated', 'prisma');
const generatedClient = join(generatedDirectory, 'client.ts');
const fingerprintFile = join(
  generatedDirectory,
  '.luminol-generator-fingerprint',
);
const lockDirectory = join(
  repositoryRoot,
  'node_modules',
  '.cache',
  'luminol-prisma-generate.lock',
);
const lockParent = dirname(lockDirectory);

const fingerprintInputs = [
  join(databaseDirectory, 'package.json'),
  join(databaseDirectory, 'prisma', 'schema.prisma'),
  join(databaseDirectory, 'prisma.config.ts'),
  join(repositoryRoot, 'pnpm-lock.yaml'),
];

const lockWaitMs = 100;
const staleLockMs = 120_000;
const lockTimeoutMs = 180_000;

function sleep(milliseconds) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));
}

async function buildFingerprint() {
  const hash = createHash('sha256');

  for (const path of fingerprintInputs) {
    hash.update(path.slice(repositoryRoot.length));
    hash.update(await readFile(path));
  }

  return hash.digest('hex');
}

async function generatedClientMatches(fingerprint) {
  try {
    const [storedFingerprint] = await Promise.all([
      readFile(fingerprintFile, 'utf8'),
      stat(generatedClient),
    ]);
    return storedFingerprint.trim() === fingerprint;
  } catch {
    return false;
  }
}

async function acquireLock() {
  await mkdir(lockParent, { recursive: true });
  const startedAt = Date.now();

  while (true) {
    try {
      await mkdir(lockDirectory);
      return;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;

      try {
        const lock = await stat(lockDirectory);
        if (Date.now() - lock.mtimeMs > staleLockMs) {
          await rm(lockDirectory, { recursive: true, force: true });
          continue;
        }
      } catch (statError) {
        if (statError?.code !== 'ENOENT') throw statError;
        continue;
      }

      if (Date.now() - startedAt > lockTimeoutMs) {
        throw new Error(
          `Timed out waiting ${lockTimeoutMs}ms for Prisma Client generation lock.`,
        );
      }

      await sleep(lockWaitMs);
    }
  }
}

function runPrismaGenerate() {
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(
      command,
      ['--filter', '@luminol/database', 'exec', 'prisma', 'generate'],
      {
        cwd: repositoryRoot,
        stdio: 'inherit',
      },
    );

    child.once('error', rejectRun);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun();
        return;
      }

      rejectRun(
        new Error(
          signal
            ? `Prisma Client generation exited after signal ${signal}.`
            : `Prisma Client generation exited with code ${code ?? 'unknown'}.`,
        ),
      );
    });
  });
}

const fingerprint = await buildFingerprint();
await acquireLock();

try {
  if (await generatedClientMatches(fingerprint)) {
    console.log(
      'Prisma Client is already generated for the current schema and lockfile.',
    );
  } else {
    await runPrismaGenerate();
    await writeFile(fingerprintFile, `${fingerprint}\n`, 'utf8');
  }
} finally {
  await rm(lockDirectory, { recursive: true, force: true });
}
