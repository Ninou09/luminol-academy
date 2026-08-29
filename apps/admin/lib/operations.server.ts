import 'server-only';

import { db } from '@luminol/database';

import {
  ACTIVE_ENQUIRY_WHERE,
  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
} from './enquiry-attention';
import {
  calculateEnquiryCoveragePercent,
  getProgrammeAttributedRecentEnquiryWhere,
  getRecentActiveEnquiryWhere,
  getRecentActiveFollowUpPlannedEnquiryWhere,
  getRecentActiveOwnedEnquiryWhere,
  getRecentActiveQualifiedEnquiryWhere,
  getRecentEnquiryWhere,
  normalizeEnquirySchoolMix,
  normalizeProgrammeEnquiryMix,
  type EnquirySchoolValue,
  type ProgrammeEnquiryMixItem,
} from './enquiry-pipeline-reporting';
import {
  calculateCompletionRate,
  type EnrollmentStatusValue,
  type EnquiryStatusValue,
} from './operations';

type RecentEnquiry = {
  id: string;
  name: string;
  email: string;
  school: string;
  status: EnquiryStatusValue;
  createdAt: Date;
};

type RecentEnrollment = {
  id: string;
  status: EnrollmentStatusValue;
  enrolledAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  course: { title: string };
};

type CoursePortfolioItem = {
  id: string;
  title: string;
  published: boolean;
  updatedAt: Date;
  _count: {
    modules: number;
    enrollments: number;
  };
};

type EligibleLearner = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type EligibleCourse = {
  id: string;
  title: string;
};

export type OperationsDashboard = {
  summary: {
    activeUsers: number;
    activeEnrollments: number;
    publishedCourses: number;
    newEnquiries: number;
    enquiriesLast30Days: number;
    programmeAttributedLast30Days: number;
    activeEnquiries: number;
    unassignedActiveEnquiries: number;
    completionRate: number;
  };
  enquirySchoolMixLast30Days: Array<{
    school: EnquirySchoolValue;
    count: number;
  }>;
  programmeEnquiryMixLast30Days: ProgrammeEnquiryMixItem[];
  enquiryWorkflowCoverageLast30Days: {
    activeTotal: number;
    ownerCovered: number;
    ownerPercent: number;
    followUpCovered: number;
    followUpPercent: number;
    qualificationCovered: number;
    qualificationPercent: number;
  };
  recentEnquiries: RecentEnquiry[];
  recentEnrollments: RecentEnrollment[];
  coursePortfolio: CoursePortfolioItem[];
  enrollmentOptions: {
    learners: EligibleLearner[];
    courses: EligibleCourse[];
  };
};

export async function getOperationsDashboard(): Promise<OperationsDashboard> {
  const now = new Date();
  const [
    activeUsers,
    activeEnrollments,
    publishedCourses,
    newEnquiries,
    enquiriesLast30Days,
    programmeAttributedLast30Days,
    activeEnquiries,
    unassignedActiveEnquiries,
    recentActiveEnquiries,
    recentActiveOwnedEnquiries,
    recentActiveFollowUpPlannedEnquiries,
    recentActiveQualifiedEnquiries,
    completedEnrollments,
    trackedEnrollments,
    enquirySchoolGroupsLast30Days,
    programmeEnquiryGroupsLast30Days,
    recentEnquiries,
    recentEnrollments,
    coursePortfolio,
    eligibleLearners,
    eligibleCourses,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.enrollment.count({ where: { status: 'ACTIVE' } }),
    db.course.count({ where: { published: true } }),
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.enquiry.count({ where: getRecentEnquiryWhere(now) }),
    db.enquiry.count({
      where: getProgrammeAttributedRecentEnquiryWhere(now),
    }),
    db.enquiry.count({ where: ACTIVE_ENQUIRY_WHERE }),
    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),
    db.enquiry.count({ where: getRecentActiveEnquiryWhere(now) }),
    db.enquiry.count({ where: getRecentActiveOwnedEnquiryWhere(now) }),
    db.enquiry.count({
      where: getRecentActiveFollowUpPlannedEnquiryWhere(now),
    }),
    db.enquiry.count({ where: getRecentActiveQualifiedEnquiryWhere(now) }),
    db.enrollment.count({ where: { status: 'COMPLETED' } }),
    db.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
    db.enquiry.groupBy({
      by: ['school'],
      where: getRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['programmeSlug', 'programmeTitleSnapshot'],
      where: getProgrammeAttributedRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        status: true,
        createdAt: true,
      },
    }),
    db.enrollment.findMany({
      take: 6,
      orderBy: { enrolledAt: 'desc' },
      select: {
        id: true,
        status: true,
        enrolledAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: { select: { title: true } },
      },
    }),
    db.course.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        published: true,
        updatedAt: true,
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    }),
    db.user.findMany({
      take: 100,
      where: {
        deletedAt: null,
        roles: {
          some: { role: { key: { in: ['student', 'client'] } } },
        },
      },
      orderBy: { email: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    }),
    db.course.findMany({
      take: 100,
      where: { published: true },
      orderBy: { title: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  return {
    summary: {
      activeUsers,
      activeEnrollments,
      publishedCourses,
      newEnquiries,
      enquiriesLast30Days,
      programmeAttributedLast30Days,
      activeEnquiries,
      unassignedActiveEnquiries,
      completionRate: calculateCompletionRate(
        completedEnrollments,
        trackedEnrollments,
      ),
    },
    enquirySchoolMixLast30Days: normalizeEnquirySchoolMix(
      enquirySchoolGroupsLast30Days,
    ),
    programmeEnquiryMixLast30Days: normalizeProgrammeEnquiryMix(
      programmeEnquiryGroupsLast30Days,
    ),
    enquiryWorkflowCoverageLast30Days: {
      activeTotal: recentActiveEnquiries,
      ownerCovered: recentActiveOwnedEnquiries,
      ownerPercent: calculateEnquiryCoveragePercent(
        recentActiveOwnedEnquiries,
        recentActiveEnquiries,
      ),
      followUpCovered: recentActiveFollowUpPlannedEnquiries,
      followUpPercent: calculateEnquiryCoveragePercent(
        recentActiveFollowUpPlannedEnquiries,
        recentActiveEnquiries,
      ),
      qualificationCovered: recentActiveQualifiedEnquiries,
      qualificationPercent: calculateEnquiryCoveragePercent(
        recentActiveQualifiedEnquiries,
        recentActiveEnquiries,
      ),
    },
    recentEnquiries: recentEnquiries as RecentEnquiry[],
    recentEnrollments: recentEnrollments as RecentEnrollment[],
    coursePortfolio: coursePortfolio as CoursePortfolioItem[],
    enrollmentOptions: {
      learners: eligibleLearners as EligibleLearner[],
      courses: eligibleCourses as EligibleCourse[],
    },
  };
}
