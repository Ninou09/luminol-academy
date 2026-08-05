import { describe, expect, it } from 'vitest';
import {
  checkTrackedWorkflowActionPins,
  findUnpinnedActionReferences,
} from './check-action-pins.mjs';

const fullSha = '0123456789abcdef0123456789abcdef01234567';

describe('GitHub Action pin enforcement', () => {
  it('accepts external actions pinned to full commit SHAs', () => {
    expect(
      findUnpinnedActionReferences(
        `steps:\n  - uses: actions/checkout@${fullSha} # v5`,
      ),
    ).toEqual([]);
  });

  it.each([
    'actions/checkout@v5',
    'actions/checkout@main',
    'actions/checkout@0123456',
    'actions/checkout',
  ])('rejects movable or incomplete external reference %s', (reference) => {
    expect(
      findUnpinnedActionReferences(`steps:\n  - uses: ${reference}`, 'ci.yml'),
    ).toEqual([`ci.yml:2: ${reference}`]);
  });

  it('checks quoted references and ignores local and Docker actions', () => {
    const workflow = `steps:
  - uses: "actions/checkout@v5"
  - uses: './.github/actions/local'
  - uses: docker://alpine:3.22
`;
    expect(findUnpinnedActionReferences(workflow, 'ci.yml')).toEqual([
      'ci.yml:2: actions/checkout@v5',
    ]);
  });

  it('keeps every tracked workflow pinned', () => {
    expect(checkTrackedWorkflowActionPins()).toEqual([]);
  });
});
