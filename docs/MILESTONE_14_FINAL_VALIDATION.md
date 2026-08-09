# Milestone 14 final validation

This note records the final review hardening for Search & Discovery.

- Administration contains searches require at least three normalized characters.
- PostgreSQL wildcard metacharacters are treated as literal search text.
- `pg_trgm` GIN indexes cover the approved operational administration-search fields.
- Production GIN indexes are built online with one `CREATE INDEX CONCURRENTLY` statement per migration.
- The representable Enquiry and Course trigram indexes are declared in `schema.prisma` with `Gin` plus raw `gin_trgm_ops` operator classes and stable mapped index names so future Prisma schema diffs retain them.
- Partial active-user trigram indexes remain governed in raw SQL because Prisma 6.12 cannot represent their `WHERE "deletedAt" IS NULL` predicate in the current schema contract.
- The milestone remains unmerged until exact-head CI and independent Codex review are clean and explicit merge approval is given.
