-- Capture a verified snapshot of the public programme that originated an enquiry.
ALTER TABLE "Enquiry"
ADD COLUMN "programmeSlug" TEXT,
ADD COLUMN "programmeTitleSnapshot" TEXT;

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_programme_context_check"
CHECK (
  ("programmeSlug" IS NULL AND "programmeTitleSnapshot" IS NULL)
  OR (
    "programmeSlug" IS NOT NULL
    AND "programmeTitleSnapshot" IS NOT NULL
    AND length(btrim("programmeSlug")) BETWEEN 1 AND 96
    AND "programmeSlug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND length(btrim("programmeTitleSnapshot")) BETWEEN 1 AND 120
  )
);

CREATE INDEX "Enquiry_programmeSlug_createdAt_idx"
ON "Enquiry"("programmeSlug", "createdAt");
