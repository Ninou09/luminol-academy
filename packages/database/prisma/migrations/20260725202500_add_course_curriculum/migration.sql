CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'ARTICLE', 'RESOURCE', 'LIVE');

CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "type" "LessonType" NOT NULL DEFAULT 'ARTICLE',
    "position" INTEGER NOT NULL,
    "durationMinutes" INTEGER,
    "contentUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseModule_courseId_position_key"
ON "CourseModule"("courseId", "position");

CREATE INDEX "CourseModule_courseId_published_idx"
ON "CourseModule"("courseId", "published");

CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

CREATE UNIQUE INDEX "Lesson_moduleId_position_key"
ON "Lesson"("moduleId", "position");

CREATE INDEX "Lesson_moduleId_published_idx"
ON "Lesson"("moduleId", "published");

ALTER TABLE "CourseModule"
ADD CONSTRAINT "CourseModule_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "Course"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson"
ADD CONSTRAINT "Lesson_moduleId_fkey"
FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
