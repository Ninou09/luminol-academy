-- Install the PostgreSQL trigram extension before the concurrent index builds.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
