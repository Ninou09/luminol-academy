CREATE TABLE "EnrollmentStatusEvent" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromStatus" "EnrollmentStatus",
    "toStatus" "EnrollmentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentStatusEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnrollmentStatusEvent_enrollmentId_createdAt_idx"
ON "EnrollmentStatusEvent"("enrollmentId", "createdAt");

CREATE INDEX "EnrollmentStatusEvent_actorUserId_createdAt_idx"
ON "EnrollmentStatusEvent"("actorUserId", "createdAt");

ALTER TABLE "EnrollmentStatusEvent"
ADD CONSTRAINT "EnrollmentStatusEvent_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnrollmentStatusEvent"
ADD CONSTRAINT "EnrollmentStatusEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
