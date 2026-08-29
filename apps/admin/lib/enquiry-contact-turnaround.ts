const MINUTE_MS = 60 * 1_000;

export type EnquiryFirstContactSample = {
  createdAt: Date;
  statusEvents: Array<{ createdAt: Date }>;
};

export type EnquiryFirstContactTurnaroundSummary = {
  total: number;
  contacted: number;
  uncontacted: number;
  medianMinutes: number | null;
  buckets: {
    underOneHour: number;
    oneToFourHours: number;
    fourToTwentyFourHours: number;
    overTwentyFourHours: number;
  };
};

function getEarliestRecordedContactAt(
  statusEvents: Array<{ createdAt: Date }>,
): Date | null {
  let earliest: Date | null = null;

  for (const event of statusEvents) {
    if (!Number.isFinite(event.createdAt.getTime())) continue;
    if (earliest === null || event.createdAt < earliest)
      earliest = event.createdAt;
  }

  return earliest;
}

function medianMinutes(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) return sorted[midpoint] ?? null;

  const lower = sorted[midpoint - 1];
  const upper = sorted[midpoint];
  if (lower === undefined || upper === undefined) return null;

  return Math.round((lower + upper) / 2);
}

export function summarizeEnquiryFirstContactTurnaround(
  samples: EnquiryFirstContactSample[],
): EnquiryFirstContactTurnaroundSummary {
  const turnaroundMinutes: number[] = [];
  const buckets = {
    underOneHour: 0,
    oneToFourHours: 0,
    fourToTwentyFourHours: 0,
    overTwentyFourHours: 0,
  };

  for (const sample of samples) {
    const firstContactAt = getEarliestRecordedContactAt(sample.statusEvents);
    if (firstContactAt === null) continue;

    const elapsedMinutes = Math.max(
      0,
      Math.round(
        (firstContactAt.getTime() - sample.createdAt.getTime()) / MINUTE_MS,
      ),
    );
    turnaroundMinutes.push(elapsedMinutes);

    if (elapsedMinutes < 60) buckets.underOneHour += 1;
    else if (elapsedMinutes < 4 * 60) buckets.oneToFourHours += 1;
    else if (elapsedMinutes < 24 * 60) buckets.fourToTwentyFourHours += 1;
    else buckets.overTwentyFourHours += 1;
  }

  const contacted = turnaroundMinutes.length;
  const total = samples.length;

  return {
    total,
    contacted,
    uncontacted: Math.max(0, total - contacted),
    medianMinutes: medianMinutes(turnaroundMinutes),
    buckets,
  };
}
