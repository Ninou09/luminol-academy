import 'server-only';

import { db } from '@luminol/database';

import {
  ACTIVE_ENQUIRY_WHERE,
  ACTIVE_UNASSIGNED_ENQUIRY_WHERE,
} from './enquiry-attention';
import {
  getActiveEnquiryAgeWhere,
  summarizeActiveEnquiryAge,
  type ActiveEnquiryAgeSummary,
} from './enquiry-age-reporting';
import {
  getUnassignedActiveEnquiryAgeWhere,
  summarizeUnassignedActiveEnquiryAge,
} from './enquiry-unassigned-age-reporting';
import {
  normalizeActiveEnquiryStatusMix,
  type ActiveEnquiryStatusMixSummary,
} from './enquiry-status-mix-reporting';
import {
  normalizeRecentEnquiryStatusMix,
  type RecentEnquiryStatusMixSummary,
} from './enquiry-recent-status-mix-reporting';
import {
  normalizeEnquiryContactPreferenceMix,
  type EnquiryContactPreferenceMixSummary,
} from './enquiry-contact-preference-reporting';
import {
  normalizeEnquiryDeliveryPreferenceMix,
  type EnquiryDeliveryPreferenceMixSummary,
} from './enquiry-delivery-preference-reporting';
import {
  normalizeEnquiryTimingPreferenceMix,
  type EnquiryTimingPreferenceMixSummary,
} from './enquiry-timing-preference-reporting';
import {
  normalizeEnquiryCampaignMediumMix,
  type EnquiryCampaignMediumMixSummary,
} from './enquiry-campaign-medium-reporting';
import {
  normalizeEnquiryCampaignContentMix,
  type EnquiryCampaignContentMixSummary,
} from './enquiry-campaign-content-reporting';
import {
  summarizeEnquiryAttributionCoverage,
  type EnquiryAttributionCoverageSummary,
} from './enquiry-attribution-coverage-reporting';
import {
  normalizeEnquiryLandingPathMix,
  type EnquiryLandingPathMixSummary,
} from './enquiry-landing-path-reporting';
import {
  getRecentActiveQualificationGapWhere,
  summarizeRecentActiveQualificationGaps,
  type EnquiryQualificationGapSummary,
} from './enquiry-qualification-gap-reporting';
import {
  summarizeEnquiryFirstContactTurnaround,
  type EnquiryFirstContactTurnaroundSummary,
} from './enquiry-contact-turnaround';
import {
  getActiveEnquiryFollowUpTimingWhere,
  summarizeFollowUpTiming,
  type FollowUpTimingSummary,
} from './enquiry-follow-up-timing-reporting';
import {
  calculateEnquiryCoveragePercent,
  calculateMissingOutcomeCount,
  calculateUntaggedEnquiryCount,
  getCampaignAttributedRecentEnquiryWhere,
  getCampaignNamedRecentEnquiryWhere,
  getProgrammeAttributedRecentEnquiryWhere,
  getRecentActiveEnquiryWhere,
  getRecentActiveFollowUpPlannedEnquiryWhere,
  getRecentActiveOwnedEnquiryWhere,
  getRecentActiveQualifiedEnquiryWhere,
  getRecentClosedEnquiryWhere,
  getRecentClosedEnquiryWithOutcomeWhere,
  getRecentEnquiryWhere,
  normalizeCampaignPairMix,
  normalizeCampaignSourceMix,
  normalizeEnquirySchoolMix,
  normalizeProgrammeEnquiryMix,
  type CampaignPairMixItem,
  type CampaignSourceMixItem,
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
  campaignEnquiryMixLast30Days: {
    taggedTotal: number;
    untaggedTotal: number;
    sourceMix: CampaignSourceMixItem[];
    campaignMix: CampaignPairMixItem[];
  };
  enquiryCampaignMediumMixLast30Days: EnquiryCampaignMediumMixSummary;
  enquiryCampaignContentMixLast30Days: EnquiryCampaignContentMixSummary;
  enquiryAttributionCoverageLast30Days: EnquiryAttributionCoverageSummary;
  enquiryContactPreferenceMixLast30Days: EnquiryContactPreferenceMixSummary;
  enquiryDeliveryPreferenceMixLast30Days: EnquiryDeliveryPreferenceMixSummary;
  enquiryTimingPreferenceMixLast30Days: EnquiryTimingPreferenceMixSummary;
  enquiryLandingPathMixLast30Days: EnquiryLandingPathMixSummary;
  enquiryQualificationGapsLast30Days: EnquiryQualificationGapSummary;
  enquiryRecentStatusMixLast30Days: RecentEnquiryStatusMixSummary;
  enquiryWorkflowCoverageLast30Days: {
    activeTotal: number;
    ownerCovered: number;
    ownerPercent: number;
    followUpCovered: number;
    followUpPercent: number;
    qualificationCovered: number;
    qualificationPercent: number;
  };
  enquiryOutcomeCoverageLast30Days: {
    closedTotal: number;
    recordedTotal: number;
    missingTotal: number;
    coveragePercent: number;
  };
  enquiryContactTurnaroundLast30Days: EnquiryFirstContactTurnaroundSummary;
  activeEnquiryAge: ActiveEnquiryAgeSummary;
  unassignedActiveEnquiryAge: ActiveEnquiryAgeSummary;
  activeEnquiryStatusMix: ActiveEnquiryStatusMixSummary;
  activeEnquiryFollowUpTiming: FollowUpTimingSummary;
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
    campaignAttributedLast30Days,
    activeEnquiries,
    unassignedActiveEnquiries,
    activeUnder24Hours,
    activeOneToThreeDays,
    activeFourToSevenDays,
    activeOverSevenDays,
    unassignedUnder24Hours,
    unassignedOneToThreeDays,
    unassignedFourToSevenDays,
    unassignedOverSevenDays,
    followUpMissingPlan,
    followUpPastDue,
    followUpNext24Hours,
    followUpOneToThreeDays,
    followUpLater,
    recentActiveEnquiries,
    recentActiveOwnedEnquiries,
    recentActiveFollowUpPlannedEnquiries,
    recentActiveQualifiedEnquiries,
    recentActiveCityMissing,
    recentActivePreferredContactMissing,
    recentActiveDeliveryPreferenceMissing,
    recentActiveTimingPreferenceMissing,
    recentClosedEnquiries,
    recentClosedWithOutcomeEnquiries,
    recentEnquiryContactSamples,
    completedEnrollments,
    trackedEnrollments,
    enquirySchoolGroupsLast30Days,
    programmeEnquiryGroupsLast30Days,
    campaignSourceGroupsLast30Days,
    campaignPairGroupsLast30Days,
    campaignNamedRecordedLast30Days,
    campaignMediumRecordedLast30Days,
    campaignMediumGroupsLast30Days,
    campaignContentRecordedLast30Days,
    campaignContentGroupsLast30Days,
    landingPathRecordedLast30Days,
    landingPathGroupsLast30Days,
    preferredContactGroupsLast30Days,
    deliveryPreferenceGroupsLast30Days,
    timingPreferenceGroupsLast30Days,
    recentEnquiryStatusGroupsLast30Days,
    activeEnquiryStatusGroups,
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
    db.enquiry.count({ where: getCampaignAttributedRecentEnquiryWhere(now) }),
    db.enquiry.count({ where: ACTIVE_ENQUIRY_WHERE }),
    db.enquiry.count({ where: ACTIVE_UNASSIGNED_ENQUIRY_WHERE }),
    db.enquiry.count({ where: getActiveEnquiryAgeWhere(now, 'under24Hours') }),
    db.enquiry.count({
      where: getActiveEnquiryAgeWhere(now, 'oneToThreeDays'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryAgeWhere(now, 'fourToSevenDays'),
    }),
    db.enquiry.count({ where: getActiveEnquiryAgeWhere(now, 'overSevenDays') }),
    db.enquiry.count({
      where: getUnassignedActiveEnquiryAgeWhere(now, 'under24Hours'),
    }),
    db.enquiry.count({
      where: getUnassignedActiveEnquiryAgeWhere(now, 'oneToThreeDays'),
    }),
    db.enquiry.count({
      where: getUnassignedActiveEnquiryAgeWhere(now, 'fourToSevenDays'),
    }),
    db.enquiry.count({
      where: getUnassignedActiveEnquiryAgeWhere(now, 'overSevenDays'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryFollowUpTimingWhere(now, 'missingPlan'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryFollowUpTimingWhere(now, 'pastDue'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryFollowUpTimingWhere(now, 'next24Hours'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryFollowUpTimingWhere(now, 'oneToThreeDays'),
    }),
    db.enquiry.count({
      where: getActiveEnquiryFollowUpTimingWhere(now, 'later'),
    }),
    db.enquiry.count({ where: getRecentActiveEnquiryWhere(now) }),
    db.enquiry.count({ where: getRecentActiveOwnedEnquiryWhere(now) }),
    db.enquiry.count({
      where: getRecentActiveFollowUpPlannedEnquiryWhere(now),
    }),
    db.enquiry.count({ where: getRecentActiveQualifiedEnquiryWhere(now) }),
    db.enquiry.count({
      where: getRecentActiveQualificationGapWhere(now, 'city'),
    }),
    db.enquiry.count({
      where: getRecentActiveQualificationGapWhere(now, 'preferredContact'),
    }),
    db.enquiry.count({
      where: getRecentActiveQualificationGapWhere(now, 'deliveryPreference'),
    }),
    db.enquiry.count({
      where: getRecentActiveQualificationGapWhere(now, 'timingPreference'),
    }),
    db.enquiry.count({ where: getRecentClosedEnquiryWhere(now) }),
    db.enquiry.count({ where: getRecentClosedEnquiryWithOutcomeWhere(now) }),
    db.enquiry.findMany({
      where: getRecentEnquiryWhere(now),
      select: {
        createdAt: true,
        statusEvents: {
          where: { toStatus: 'CONTACTED' },
          orderBy: { createdAt: 'asc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
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
    db.enquiry.groupBy({
      by: ['utmSource'],
      where: getCampaignAttributedRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['utmSource', 'utmCampaign'],
      where: getCampaignNamedRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.count({
      where: {
        ...getRecentEnquiryWhere(now),
        utmCampaign: { not: null },
      },
    }),
    db.enquiry.count({
      where: {
        ...getRecentEnquiryWhere(now),
        utmMedium: { not: null },
      },
    }),
    db.enquiry.groupBy({
      by: ['utmMedium'],
      where: {
        ...getRecentEnquiryWhere(now),
        utmMedium: { not: null },
      },
      _count: { _all: true },
    }),
    db.enquiry.count({
      where: {
        ...getRecentEnquiryWhere(now),
        utmContent: { not: null },
      },
    }),
    db.enquiry.groupBy({
      by: ['utmContent'],
      where: {
        ...getRecentEnquiryWhere(now),
        utmContent: { not: null },
      },
      _count: { _all: true },
    }),
    db.enquiry.count({
      where: {
        ...getRecentEnquiryWhere(now),
        landingPath: { not: null },
      },
    }),
    db.enquiry.groupBy({
      by: ['landingPath'],
      where: {
        ...getRecentEnquiryWhere(now),
        landingPath: { not: null },
      },
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['preferredContact'],
      where: getRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['deliveryPreference'],
      where: getRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['timingPreference'],
      where: getRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['status'],
      where: getRecentEnquiryWhere(now),
      _count: { _all: true },
    }),
    db.enquiry.groupBy({
      by: ['status'],
      where: ACTIVE_ENQUIRY_WHERE,
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
    campaignEnquiryMixLast30Days: {
      taggedTotal: campaignAttributedLast30Days,
      untaggedTotal: calculateUntaggedEnquiryCount(
        enquiriesLast30Days,
        campaignAttributedLast30Days,
      ),
      sourceMix: normalizeCampaignSourceMix(campaignSourceGroupsLast30Days),
      campaignMix: normalizeCampaignPairMix(campaignPairGroupsLast30Days),
    },
    enquiryCampaignMediumMixLast30Days: normalizeEnquiryCampaignMediumMix(
      campaignMediumGroupsLast30Days,
      enquiriesLast30Days,
      campaignMediumRecordedLast30Days,
    ),
    enquiryCampaignContentMixLast30Days: normalizeEnquiryCampaignContentMix(
      campaignContentGroupsLast30Days,
      enquiriesLast30Days,
      campaignContentRecordedLast30Days,
    ),
    enquiryAttributionCoverageLast30Days: summarizeEnquiryAttributionCoverage(
      enquiriesLast30Days,
      {
        utmSource: campaignAttributedLast30Days,
        utmMedium: campaignMediumRecordedLast30Days,
        utmCampaign: campaignNamedRecordedLast30Days,
        utmContent: campaignContentRecordedLast30Days,
        landingPath: landingPathRecordedLast30Days,
      },
    ),
    enquiryLandingPathMixLast30Days: normalizeEnquiryLandingPathMix(
      landingPathGroupsLast30Days,
      enquiriesLast30Days,
      landingPathRecordedLast30Days,
    ),
    enquiryContactPreferenceMixLast30Days: normalizeEnquiryContactPreferenceMix(
      preferredContactGroupsLast30Days,
      enquiriesLast30Days,
    ),
    enquiryDeliveryPreferenceMixLast30Days:
      normalizeEnquiryDeliveryPreferenceMix(
        deliveryPreferenceGroupsLast30Days,
        enquiriesLast30Days,
      ),
    enquiryTimingPreferenceMixLast30Days: normalizeEnquiryTimingPreferenceMix(
      timingPreferenceGroupsLast30Days,
      enquiriesLast30Days,
    ),
    enquiryRecentStatusMixLast30Days: normalizeRecentEnquiryStatusMix(
      recentEnquiryStatusGroupsLast30Days,
    ),
    enquiryQualificationGapsLast30Days: summarizeRecentActiveQualificationGaps({
      activeTotal: recentActiveEnquiries,
      cityMissing: recentActiveCityMissing,
      preferredContactMissing: recentActivePreferredContactMissing,
      deliveryPreferenceMissing: recentActiveDeliveryPreferenceMissing,
      timingPreferenceMissing: recentActiveTimingPreferenceMissing,
    }),
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
    enquiryOutcomeCoverageLast30Days: {
      closedTotal: recentClosedEnquiries,
      recordedTotal: recentClosedWithOutcomeEnquiries,
      missingTotal: calculateMissingOutcomeCount(
        recentClosedEnquiries,
        recentClosedWithOutcomeEnquiries,
      ),
      coveragePercent: calculateEnquiryCoveragePercent(
        recentClosedWithOutcomeEnquiries,
        recentClosedEnquiries,
      ),
    },
    enquiryContactTurnaroundLast30Days: summarizeEnquiryFirstContactTurnaround(
      recentEnquiryContactSamples,
    ),
    activeEnquiryAge: summarizeActiveEnquiryAge({
      under24Hours: activeUnder24Hours,
      oneToThreeDays: activeOneToThreeDays,
      fourToSevenDays: activeFourToSevenDays,
      overSevenDays: activeOverSevenDays,
    }),
    unassignedActiveEnquiryAge: summarizeUnassignedActiveEnquiryAge({
      under24Hours: unassignedUnder24Hours,
      oneToThreeDays: unassignedOneToThreeDays,
      fourToSevenDays: unassignedFourToSevenDays,
      overSevenDays: unassignedOverSevenDays,
    }),
    activeEnquiryStatusMix: normalizeActiveEnquiryStatusMix(
      activeEnquiryStatusGroups,
    ),
    activeEnquiryFollowUpTiming: summarizeFollowUpTiming({
      missingPlan: followUpMissingPlan,
      pastDue: followUpPastDue,
      next24Hours: followUpNext24Hours,
      oneToThreeDays: followUpOneToThreeDays,
      later: followUpLater,
    }),
    recentEnquiries: recentEnquiries as RecentEnquiry[],
    recentEnrollments: recentEnrollments as RecentEnrollment[],
    coursePortfolio: coursePortfolio as CoursePortfolioItem[],
    enrollmentOptions: {
      learners: eligibleLearners as EligibleLearner[],
      courses: eligibleCourses as EligibleCourse[],
    },
  };
}
