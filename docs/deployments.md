# Vercel deployment selection

The public website, learner portal and administration application are separate
Vercel projects rooted at `apps/web`, `apps/portal` and `apps/admin`.

Vercel's native monorepo detection remains enabled. A repository-level ignored
build command adds a conservative project-aware check for preview deployments
where a root CI-only change would otherwise keep unrelated projects affected
through the full comparison range.

## Safety rules

- Production deployments and every deployment from `main` always build.
- Missing project identity, missing Git SHAs, a failed Git comparison or an
  unknown path always builds.
- Root dependency, workspace and deployment inputs build all three projects.
- Database changes build all three projects because every application runs
  Prisma generation during its build.
- Shared packages build only the applications that declare them directly or
  transitively.
- Application source builds only its matching Vercel project.
- Studio, documentation, CI workflow and test-only changes may skip the three
  public applications when no deployable dependency changed in the same
  comparison.

The command uses Vercel's `VERCEL_PROJECT_ID`, `VERCEL_GIT_PREVIOUS_SHA` and
`VERCEL_GIT_COMMIT_SHA` system variables. Vercel continues a build when the
command exits with status `1` and skips it when the command exits with status
`0`.

The first preview after introducing or restoring the ignored-build command may
not have `VERCEL_GIT_PREVIOUS_SHA`. That deployment must build through the
fail-open path. Verify skipping only on a later commit after each project has a
successful preview baseline for the branch.

Git rename detection is disabled for the comparison so moved files are
reported as a deletion at the old path and an addition at the new path. This
prevents moving deployable source into a non-deployable directory from hiding
the original affected application.

## Dependency matrix

| Project        | Direct and transitive workspace inputs                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Web            | `apps/web`, auth, config, database, types, UI, validation                          |
| Portal         | `apps/portal`, auth, config, database, finance, language, types, UI, validation    |
| Administration | `apps/admin`, auth, certificates, config, database, finance, types, UI, validation |

A new workspace dependency must be added to the matching project map in
`scripts/vercel-ignore-build.mjs` in the same pull request that introduces the
dependency. The application `package.json` change still fails open and builds,
but the map must be updated before later source-only changes rely on it.

## Verification

Before merging a rule change:

1. Run the root lint, typecheck, test and build commands.
2. Confirm the classifier's decision-matrix tests pass.
3. Verify a preview from a clean production baseline for web-only, portal-only
   and administration-only changes.
4. Verify a follow-up change on a branch that already contains a root CI-only
   change.
5. Verify shared-package, database, lockfile and deployment-configuration
   changes still build every affected project.

Skipped Vercel deployments appear as cancelled or skipped with the platform's
"unaffected project" explanation. A skipped deployment is valid only when CI
still passes and the changed paths match the documented rules.

## Rollback

Remove `ignoreCommand` from `vercel.json` to return immediately to Vercel's
native monorepo behavior. Do not disable Git deployments or production builds.
After rollback, push one reviewed documentation-only change and confirm that
all expected preview statuses are reported before merging further deployment
rule changes.
