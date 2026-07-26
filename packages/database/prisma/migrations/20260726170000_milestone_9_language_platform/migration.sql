-- CreateEnum
CREATE TYPE "CefrLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "LanguageSkill" AS ENUM ('READING', 'LISTENING', 'SPEAKING', 'WRITING', 'GRAMMAR', 'VOCABULARY');

-- CreateEnum
CREATE TYPE "PlacementAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'REVIEW_REQUIRED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Lesson"
ADD COLUMN "languageSkill" "LanguageSkill",
ADD COLUMN "cefrLevel" "CefrLevel";

-- CreateTable
CREATE TABLE "LanguageCourseProfile" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "instructionLanguage" TEXT NOT NULL,
    "entryLevel" "CefrLevel" NOT NULL,
    "exitLevel" "CefrLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageCourseProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementAssessment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "timeLimitMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementAttempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PlacementAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "recommendedLevel" "CefrLevel",
    "totalScore" DECIMAL(5,2),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementSkillResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "skill" "LanguageSkill" NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "level" "CefrLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementSkillResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LanguageCourseProfile_courseId_key" ON "LanguageCourseProfile"("courseId");
CREATE INDEX "LanguageCourseProfile_targetLanguage_entryLevel_idx" ON "LanguageCourseProfile"("targetLanguage", "entryLevel");
CREATE INDEX "Lesson_languageSkill_cefrLevel_idx" ON "Lesson"("languageSkill", "cefrLevel");
CREATE UNIQUE INDEX "PlacementAssessment_courseId_version_key" ON "PlacementAssessment"("courseId", "version");
CREATE INDEX "PlacementAssessment_targetLanguage_published_idx" ON "PlacementAssessment"("targetLanguage", "published");
CREATE INDEX "PlacementAttempt_userId_status_startedAt_idx" ON "PlacementAttempt"("userId", "status", "startedAt");
CREATE INDEX "PlacementAttempt_assessmentId_status_idx" ON "PlacementAttempt"("assessmentId", "status");
CREATE INDEX "PlacementAttempt_reviewedById_reviewedAt_idx" ON "PlacementAttempt"("reviewedById", "reviewedAt");
CREATE UNIQUE INDEX "PlacementSkillResult_attemptId_skill_key" ON "PlacementSkillResult"("attemptId", "skill");
CREATE INDEX "PlacementSkillResult_skill_level_idx" ON "PlacementSkillResult"("skill", "level");

-- AddForeignKey
ALTER TABLE "LanguageCourseProfile" ADD CONSTRAINT "LanguageCourseProfile_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacementAssessment" ADD CONSTRAINT "PlacementAssessment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacementAttempt" ADD CONSTRAINT "PlacementAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "PlacementAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlacementAttempt" ADD CONSTRAINT "PlacementAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacementAttempt" ADD CONSTRAINT "PlacementAttempt_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlacementSkillResult" ADD CONSTRAINT "PlacementSkillResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "PlacementAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
