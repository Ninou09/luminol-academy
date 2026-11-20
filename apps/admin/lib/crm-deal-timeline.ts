import type { CrmSectionsCopy } from './crm-sections-localization';
import { personLabel, type CrmTimelineItem } from './crm-timeline';

type DealWithEvents = {
  section: keyof CrmSectionsCopy['section'];
  stage: string;
  state: 'OPEN' | 'WON' | 'LOST';
  offer: { title: string } | null;
  events: {
    id: string;
    type: 'CREATED' | 'STAGE_CHANGED';
    fromStage: string | null;
    toStage: string;
    reason: string | null;
    occurredAt: Date;
    actor: Parameters<typeof personLabel>[0];
  }[];
};

/** Opportunity history as 360° timeline entries. */
export function crmDealTimelineItems(
  deals: readonly DealWithEvents[],
  copy: CrmSectionsCopy,
): CrmTimelineItem[] {
  const stage = (key: string) => copy.stage[key] ?? key;
  return deals.flatMap((deal) =>
    deal.events.map((event): CrmTimelineItem => {
      const section = copy.section[deal.section];
      const closing = event.toStage === deal.stage && deal.state !== 'OPEN';
      return {
        id: event.id,
        kind: 'deal',
        at: event.occurredAt,
        title:
          event.type === 'CREATED' || !event.fromStage
            ? copy.dealCreated(section, stage(event.toStage))
            : copy.dealMoved(
                section,
                stage(event.fromStage),
                stage(event.toStage),
              ),
        detail: event.reason ?? deal.offer?.title ?? null,
        actor: personLabel(event.actor),
        tone: closing
          ? deal.state === 'WON'
            ? 'success'
            : 'warning'
          : 'default',
      };
    }),
  );
}
