-- Build the active-user first-name trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "User_firstName_trgm_idx"
ON "User" USING GIN ("firstName" gin_trgm_ops)
WHERE "deletedAt" IS NULL;
