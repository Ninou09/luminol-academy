-- Build the course-slug trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "Course_slug_trgm_idx"
ON "Course" USING GIN ("slug" gin_trgm_ops);
