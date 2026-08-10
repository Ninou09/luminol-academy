# Sanity Studio v6 migration

Issue: #85

## Baseline

Before this migration, the Studio used `sanity@^3.99.0`, `@sanity/vision@^3.99.0`, React 19.1, and the repository CI built with Node 22. The Studio has no custom Vite override and no custom `auth.providers` configuration. Its governed programme schema and public read-only Content Lake integration are intentionally unchanged by this dependency migration.

## Upgrade path reviewed

Sanity describes the v3 → v4 change as primarily a Node runtime baseline change, with Studio APIs and schemas otherwise remaining compatible. Studio v5 requires React 19.2 or newer. Studio v6 raises the build/runtime requirement to Node 22.12 or newer, moves Studio tooling to Vite 8, and enables React strict mode by default in development. Sanity states that schemas, configuration shape, plugins, and content APIs remain unchanged for the normal v6 upgrade path.

Official references:

- https://www.sanity.io/docs/help/v3-to-v4
- https://www.sanity.io/blog/sanity-studio-v5
- https://www.sanity.io/blog/sanity-studio-v6
- https://www.sanity.io/docs/changelog/studio-NS4zMS4w

## Target dependency set

The migration deliberately uses a coordinated, tested major-version pair rather than the invalid isolated Vision upgrade that prompted #85:

- `sanity`: `6.6.0`
- `@sanity/vision`: `6.6.0`
- `react`: `^19.2.8`
- `react-dom`: `^19.2.8`
- Studio Node engine: `>=22.12.0`

The repository-level Node policy remains broader because the non-Studio applications have their own supported runtime range; the stricter requirement is declared at `apps/studio/package.json`, where Sanity v6 is actually built and run.

## Expected compatibility surface

No content migration is required for this upgrade. The following are intentionally unchanged:

- `sanity.config.ts` schema registration and `structureTool()` configuration
- the `visionTool()` configuration shape
- the governed programme schema
- Sanity project/dataset environment variable names and the `production` dataset fallback
- public read-only Sanity querying and validation
- public image allowlisting and governed fallback behavior
- production content and documents

The Studio currently has no custom Vite configuration to adapt to Vite 8 and no custom authentication provider callback to migrate.

## Validation gate

Do not merge the migration unless all of the following pass on the exact PR head:

1. `pnpm install --frozen-lockfile`
2. repository secret/action-pin checks and production dependency audit
3. Prisma schema validation and ephemeral migration deployment
4. repository lint and formatting
5. Studio and repository TypeScript checks
6. unit tests
7. `sanity build` through the repository production build
8. public Playwright smoke tests
9. review of any peer-dependency warnings or Studio-specific build warnings

A deployed Studio should only be verified after the repository gate is green. Production content must not be edited as part of migration verification.

## Rollback

This change is dependency/tooling-only and does not mutate Content Lake data or the governed schema. If the v6 Studio cannot be safely deployed or verified:

1. revert the migration merge commit (including `apps/studio/package.json` and `pnpm-lock.yaml`);
2. restore the previous Sanity 3.99 / Vision 3.99 dependency set and React 19.1 lockfile state;
3. run the full repository CI gate again;
4. rebuild/redeploy the previous Studio artifact;
5. verify that the Studio opens against the same project/dataset without publishing or altering content.

Do not attempt a content rollback because this migration does not intentionally change content. If Studio auto-update channel configuration is introduced later, review Sanity's version-selection and downgrade constraints before relying on package rollback alone.
