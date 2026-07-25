export function calculateCompletionRate(
  completedEnrollments: number,
  trackedEnrollments: number,
) {
  if (trackedEnrollments <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, Math.round((completedEnrollments / trackedEnrollments) * 100)),
  );
}

export function displayPersonName(
  firstName: string | null,
  lastName: string | null,
  fallback: string,
) {
  const name = [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || fallback;
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
