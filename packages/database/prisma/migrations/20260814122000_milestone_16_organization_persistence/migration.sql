-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrganizationMembershipRole" AS ENUM ('OWNER', 'MANAGER', 'LEARNER');

-- CreateEnum
CREATE TYPE "OrganizationSeatStatus" AS ENUM ('INVITED', 'ACTIVE', 'COMPLETED', 'REVOKED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "seatLimit" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Organization_seatLimit_positive" CHECK ("seatLimit" > 0)
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationMembershipRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationMembershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSeat" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrganizationSeatStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationCourse" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationEnrollmentSponsorship" (
    "id" TEXT NOT NULL,
    "organizationCourseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sponsoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationEnrollmentSponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Organization_status_name_idx" ON "Organization"("status", "name");

-- CreateIndex
CREATE INDEX "Organization_archivedAt_idx" ON "Organization"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_organizationId_userId_key" ON "OrganizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationMembership_userId_active_idx" ON "OrganizationMembership"("userId", "active");

-- CreateIndex
CREATE INDEX "OrganizationMembership_organizationId_role_active_idx" ON "OrganizationMembership"("organizationId", "role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Team_organizationId_name_key" ON "Team"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Team_organizationId_archivedAt_idx" ON "Team"("organizationId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_organizationMembershipId_key" ON "TeamMembership"("teamId", "organizationMembershipId");

-- CreateIndex
CREATE INDEX "TeamMembership_organizationMembershipId_teamId_idx" ON "TeamMembership"("organizationMembershipId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationSeat_organizationId_userId_key" ON "OrganizationSeat"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationSeat_organizationId_status_idx" ON "OrganizationSeat"("organizationId", "status");

-- CreateIndex
CREATE INDEX "OrganizationSeat_userId_status_idx" ON "OrganizationSeat"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationCourse_organizationId_courseId_key" ON "OrganizationCourse"("organizationId", "courseId");

-- CreateIndex
CREATE INDEX "OrganizationCourse_organizationId_active_assignedAt_idx" ON "OrganizationCourse"("organizationId", "active", "assignedAt");

-- CreateIndex
CREATE INDEX "OrganizationCourse_courseId_active_idx" ON "OrganizationCourse"("courseId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationEnrollmentSponsorship_enrollmentId_key" ON "OrganizationEnrollmentSponsorship"("enrollmentId");

-- CreateIndex
CREATE INDEX "OrganizationEnrollmentSponsorship_organizationCourseId_active_idx" ON "OrganizationEnrollmentSponsorship"("organizationCourseId", "active");

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_organizationMembershipId_fkey" FOREIGN KEY ("organizationMembershipId") REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSeat" ADD CONSTRAINT "OrganizationSeat_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSeat" ADD CONSTRAINT "OrganizationSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCourse" ADD CONSTRAINT "OrganizationCourse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCourse" ADD CONSTRAINT "OrganizationCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEnrollmentSponsorship" ADD CONSTRAINT "OrganizationEnrollmentSponsorship_organizationCourseId_fkey" FOREIGN KEY ("organizationCourseId") REFERENCES "OrganizationCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationEnrollmentSponsorship" ADD CONSTRAINT "OrganizationEnrollmentSponsorship_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Cross-tenant integrity: a team can only contain a membership from the same organization.
CREATE FUNCTION "enforce_team_membership_organization_scope"() RETURNS trigger AS $$
DECLARE
    team_organization_id TEXT;
    membership_organization_id TEXT;
BEGIN
    SELECT "organizationId" INTO team_organization_id FROM "Team" WHERE "id" = NEW."teamId";
    SELECT "organizationId" INTO membership_organization_id FROM "OrganizationMembership" WHERE "id" = NEW."organizationMembershipId";

    IF team_organization_id IS NULL OR membership_organization_id IS NULL OR team_organization_id <> membership_organization_id THEN
        RAISE EXCEPTION 'Team membership organization scope mismatch';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "TeamMembership_organization_scope"
BEFORE INSERT OR UPDATE OF "teamId", "organizationMembershipId" ON "TeamMembership"
FOR EACH ROW EXECUTE FUNCTION "enforce_team_membership_organization_scope"();

-- Learning integrity: an organization course may sponsor only an enrollment in that same course.
CREATE FUNCTION "enforce_organization_sponsorship_course_scope"() RETURNS trigger AS $$
DECLARE
    assigned_course_id TEXT;
    enrolled_course_id TEXT;
BEGIN
    SELECT "courseId" INTO assigned_course_id FROM "OrganizationCourse" WHERE "id" = NEW."organizationCourseId";
    SELECT "courseId" INTO enrolled_course_id FROM "Enrollment" WHERE "id" = NEW."enrollmentId";

    IF assigned_course_id IS NULL OR enrolled_course_id IS NULL OR assigned_course_id <> enrolled_course_id THEN
        RAISE EXCEPTION 'Organization sponsorship course scope mismatch';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationEnrollmentSponsorship_course_scope"
BEFORE INSERT OR UPDATE OF "organizationCourseId", "enrollmentId" ON "OrganizationEnrollmentSponsorship"
FOR EACH ROW EXECUTE FUNCTION "enforce_organization_sponsorship_course_scope"();
