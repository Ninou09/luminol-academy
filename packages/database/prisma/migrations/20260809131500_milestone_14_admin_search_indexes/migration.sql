-- Milestone 14 administration search uses case-insensitive contains matching.
-- PostgreSQL trigram GIN indexes keep those searches indexable as operational
-- user, enquiry, and course tables grow.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "User_email_trgm_idx"
ON "User" USING GIN ("email" gin_trgm_ops)
WHERE "deletedAt" IS NULL;

CREATE INDEX "User_firstName_trgm_idx"
ON "User" USING GIN ("firstName" gin_trgm_ops)
WHERE "deletedAt" IS NULL;

CREATE INDEX "User_lastName_trgm_idx"
ON "User" USING GIN ("lastName" gin_trgm_ops)
WHERE "deletedAt" IS NULL;

CREATE INDEX "Enquiry_name_trgm_idx"
ON "Enquiry" USING GIN ("name" gin_trgm_ops);

CREATE INDEX "Enquiry_email_trgm_idx"
ON "Enquiry" USING GIN ("email" gin_trgm_ops);

CREATE INDEX "Course_title_trgm_idx"
ON "Course" USING GIN ("title" gin_trgm_ops);

CREATE INDEX "Course_slug_trgm_idx"
ON "Course" USING GIN ("slug" gin_trgm_ops);
