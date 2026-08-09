-- Build the enquiry-name trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "Enquiry_name_trgm_idx"
ON "Enquiry" USING GIN ("name" gin_trgm_ops);
