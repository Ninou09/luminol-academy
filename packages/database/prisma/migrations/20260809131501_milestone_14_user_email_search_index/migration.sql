-- Build the active-user email trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "User_email_trgm_idx"
ON "User" USING GIN ("email" gin_trgm_ops)
WHERE "deletedAt" IS NULL;
