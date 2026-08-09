-- Build the active-user last-name trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "User_lastName_trgm_idx"
ON "User" USING GIN ("lastName" gin_trgm_ops)
WHERE "deletedAt" IS NULL;
