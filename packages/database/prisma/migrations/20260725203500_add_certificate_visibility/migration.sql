ALTER TABLE "Certificate"
ADD COLUMN "publiclyVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "recipientName" TEXT;
