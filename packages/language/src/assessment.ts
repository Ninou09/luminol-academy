import type { PlacementStatus } from './types';

const ALLOWED_TRANSITIONS: Record<PlacementStatus, readonly PlacementStatus[]> =
  {
    draft: ['submitted'],
    submitted: ['reviewing', 'completed'],
    reviewing: ['completed'],
    completed: [],
  };

export function canTransitionPlacement(
  current: PlacementStatus,
  next: PlacementStatus,
): boolean {
  return ALLOWED_TRANSITIONS[current].includes(next);
}

export function assertPlacementTransition(
  current: PlacementStatus,
  next: PlacementStatus,
): void {
  if (!canTransitionPlacement(current, next)) {
    throw new Error(`Invalid placement transition: ${current} -> ${next}`);
  }
}

export function submitPlacement(current: PlacementStatus): PlacementStatus {
  assertPlacementTransition(current, 'submitted');
  return 'submitted';
}

export function startPlacementReview(
  current: PlacementStatus,
): PlacementStatus {
  assertPlacementTransition(current, 'reviewing');
  return 'reviewing';
}

export function completePlacement(current: PlacementStatus): PlacementStatus {
  assertPlacementTransition(current, 'completed');
  return 'completed';
}
