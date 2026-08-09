-- Build the enquiry-email trigram index without blocking production writes.
CREATE INDEX CONCURRENTLY "Enquiry_email_trgm_idx"
ON "Enquiry" USING GIN ("email" gin_trgm_ops);
