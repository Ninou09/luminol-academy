-- Build the course-title trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "Course_title_trgm_idx"
ON "Course" USING GIN ("title" gin_trgm_ops);
