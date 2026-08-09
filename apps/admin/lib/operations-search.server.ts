import 'server-only';

import { db } from '@luminol/database';

import {
  ADMIN_SEARCH_RESULT_LIMIT,
  escapePostgresLikePattern,
  isAdminSearchQueryEligible,
  normalizeAdminSearchQuery,
} from './operations-search';

function boundedResults<T>(items: T[]) {
  return {
    items: items.slice(0, ADMIN_SEARCH_RESULT_LIMIT),
    hasMore: items.length > ADMIN_SEARCH_RESULT_LIMIT,
  };
}

export async function searchAdminOperations(
  rawQuery: string | null | undefined,
) {
  const query = normalizeAdminSearchQuery(rawQuery);

  if (!isAdminSearchQueryEligible(query)) {
    return {
      query,
      people: { items: [], hasMore: false },
      enquiries: { items: [], hasMore: false },
      courses: { items: [], hasMore: false },
    };
  }

  const take = ADMIN_SEARCH_RESULT_LIMIT + 1;
  const literalQuery = escapePostgresLikePattern(query);
  const contains = { contains: literalQuery, mode: 'insensitive' as const };

  const [people, enquiries, courses] = await Promise.all([
    db.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { email: contains },
          { firstName: contains },
          { lastName: contains },
        ],
      },
      orderBy: [{ email: 'asc' }, { id: 'asc' }],
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    }),
    db.enquiry.findMany({
      where: {
        OR: [{ name: contains }, { email: contains }],
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      take,
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        status: true,
        createdAt: true,
      },
    }),
    db.course.findMany({
      where: {
        OR: [{ title: contains }, { slug: contains }],
      },
      orderBy: [{ title: 'asc' }, { id: 'asc' }],
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    query,
    people: boundedResults(people),
    enquiries: boundedResults(enquiries),
    courses: boundedResults(courses),
  };
}
