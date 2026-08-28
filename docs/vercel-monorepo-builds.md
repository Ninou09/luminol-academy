# Vercel monorepo build fan-out

The repository is connected to three Vercel projects: `@luminol/web`, `@luminol/admin`, and `@luminol/portal`. Each project has its own root directory under `apps/`.

Each application root now defines an `ignoreCommand` using Turborepo's affected-project query. Vercel treats exit code `0` as "skip this build" and exit code `1` as "continue the build". The command compares the current commit with `VERCEL_GIT_PREVIOUS_SHA`; when that variable is not available yet, it safely falls back to `HEAD^1`.

The package-specific commands are:

```sh
cd ../.. && turbo query affected --base=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^1} --packages @luminol/web --exit-code
cd ../.. && turbo query affected --base=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^1} --packages @luminol/admin --exit-code
cd ../.. && turbo query affected --base=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^1} --packages @luminol/portal --exit-code
```

This is deliberately dependency-aware rather than a path-only `git diff`: a change to a shared workspace package that is upstream of an application must still make that application's query return affected, so Vercel continues the build.

## Verification

Before merge, verify the JSON files parse and run Turborepo's affected query against representative repository commits. After the Vercel Hobby build-rate window clears, verify in Vercel that an app-only change skips the two unaffected projects while a shared-package change still triggers every dependent project.

## Rollback

Delete the three application `vercel.json` files (or remove only `ignoreCommand`) to restore Vercel's previous behavior where every connected project attempts a build for every repository commit.
