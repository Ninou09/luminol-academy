'use server';

import { requirePermission } from '@luminol/auth';
import { recordSearchTelemetry, SearchSurface } from '@luminol/database';

import { parseAdminSearchParam } from '../../lib/operations-search';
import { searchAdminOperations } from '../../lib/operations-search.server';
import type { AdminSearchState } from './search-state';

function rawSearchValue(formData: FormData) {
  const values = formData.getAll('q');
  return values.length === 1 ? values[0] : values;
}

export async function submitAdminSearch(
  _previousState: AdminSearchState,
  formData: FormData,
): Promise<AdminSearchState> {
  await requirePermission('academy:manage');

  const rawQuery = parseAdminSearchParam(rawSearchValue(formData));
  const results = await searchAdminOperations(rawQuery);
  const searched = results.query.length >= 2;
  const shownCount =
    results.people.items.length +
    results.enquiries.items.length +
    results.courses.items.length;
  const hasMoreResults =
    results.people.hasMore || results.enquiries.hasMore || results.courses.hasMore;

  if (searched) {
    await recordSearchTelemetry({
      surface: SearchSurface.ADMIN,
      resultCount: hasMoreResults ? Math.max(21, shownCount) : shownCount,
    });
  }

  return {
    query: results.query,
    searched,
    people: {
      hasMore: results.people.hasMore,
      items: results.people.items.map((person) => ({
        ...person,
        createdAt: person.createdAt.toISOString(),
      })),
    },
    enquiries: {
      hasMore: results.enquiries.hasMore,
      items: results.enquiries.items.map((enquiry) => ({
        ...enquiry,
        createdAt: enquiry.createdAt.toISOString(),
      })),
    },
    courses: {
      hasMore: results.courses.hasMore,
      items: results.courses.items.map((course) => ({
        ...course,
        updatedAt: course.updatedAt.toISOString(),
      })),
    },
  };
}
