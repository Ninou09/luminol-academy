-- CreateEnum
CREATE TYPE "EnquirySchool" AS ENUM (
  'PSYCHOLOGY',
  'LANGUAGES',
  'TRAINING',
  'GENERAL'
);

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM (
  'NEW',
  'IN_REVIEW',
  'CONTACTED',
  'CLOSED',
  'SPAM'
);

-- CreateTable
CREATE TABLE "Enquiry" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "school" "EnquirySchool" NOT NULL,
  "message" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "consent" BOOLEAN NOT NULL,
  "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
  "source" TEXT NOT NULL DEFAULT 'website',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_email_idx" ON "Enquiry"("email");
