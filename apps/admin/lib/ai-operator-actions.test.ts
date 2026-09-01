import { describe, expect, it } from 'vitest';

import { buildAiOperationsBriefActions } from './ai-operator-actions';
import type { AiOperationsBrief } from './ai-operations-brief';

function brief(): AiOperationsBrief {
  return {
    status: 'attention',
    source: 'operations-dashboard',
    items: [
      {
        kind: 'unassigned',
        count: 2,
        query: 'attention=unassigned',
      },
      {
        kind: 'qualificationGap',
        count: 3,
        qualificationGap: 'preferredContact',
        query: 'qualificationGap=preferredContact',
      },
      {
        kind: 'attributionGap',
        count: 4,
        attributionGap: 'utmSource',
        query: 'attributionGap=utmSource',
      },
    ],
  };
}

describe('buildAiOperationsBriefActions', () => {
  it('maps brief observations to validated read-only enquiry navigation actions', () => {
    const actions = buildAiOperationsBriefActions(brief());

    expect(actions.map(({ action }) => action.executionPolicy)).toEqual([
      'read_only',
      'read_only',
      'read_only',
    ]);
    expect(actions.map(({ action }) => action.kind)).toEqual([
      'OPEN_ENQUIRY_QUEUE',
      'OPEN_ENQUIRY_QUEUE',
      'OPEN_ENQUIRY_QUEUE',
    ]);
    expect(actions.map(({ action }) => action.payload.query)).toEqual([
      'attention=unassigned',
      'qualificationGap=preferredContact',
      'attributionGap=utmSource',
    ]);
  });

  it('produces stable action IDs from the observation kind and structured discriminator', () => {
    expect(
      buildAiOperationsBriefActions(brief()).map(
        ({ action }) => action.actionId,
      ),
    ).toEqual([
      'ops-brief:v1:unassigned:queue',
      'ops-brief:v1:qualificationGap:preferredContact',
      'ops-brief:v1:attributionGap:utmSource',
    ]);
  });

  it('returns no actions for an all-clear brief', () => {
    expect(
      buildAiOperationsBriefActions({
        status: 'clear',
        source: 'operations-dashboard',
        items: [],
      }),
    ).toEqual([]);
  });

  it('fails closed if a brief item contains an unsupported queue query', () => {
    const invalid: AiOperationsBrief = {
      status: 'attention',
      source: 'operations-dashboard',
      items: [
        {
          kind: 'unassigned',
          count: 1,
          query: 'status=NEW',
        },
      ],
    };

    expect(() => buildAiOperationsBriefActions(invalid)).toThrow();
  });
});
