import type { PlacementActor } from "./types";

export const LANGUAGE_PERMISSIONS = {
  manage: "language:manage",
  reviewPlacement: "language:placement:review",
  overridePlacement: "language:placement:override",
} as const;

export function hasPermission(
  actor: PlacementActor,
  permission: string,
): boolean {
  return actor.permissions.includes(permission) || actor.permissions.includes(LANGUAGE_PERMISSIONS.manage);
}

export function canReviewPlacement(actor: PlacementActor): boolean {
  return hasPermission(actor, LANGUAGE_PERMISSIONS.reviewPlacement);
}

export function canOverridePlacement(actor: PlacementActor): boolean {
  return hasPermission(actor, LANGUAGE_PERMISSIONS.overridePlacement);
}

export function canViewAttempt(
  actor: PlacementActor,
  learnerId: string,
): boolean {
  return actor.userId === learnerId || canReviewPlacement(actor);
}

export function assertCanReviewPlacement(actor: PlacementActor): void {
  if (!canReviewPlacement(actor)) {
    throw new Error("The current user cannot review placement attempts");
  }
}
