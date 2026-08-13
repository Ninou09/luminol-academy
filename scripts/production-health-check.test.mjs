import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workflowPath = resolve('.github/workflows/production-health-check.yml');

describe('production health sign-in probes', () => {
  it('probes canonical localized entry points with current metadata titles', () => {
    const source = readFileSync(workflowPath, 'utf8');

    expect(source).toContain('"$url/en/sign-in"');
    expect(source).not.toContain('"$url/sign-in"');
    expect(source).toContain("'Learner Portal | Luminol'");
    expect(source).toContain("'Administration | Luminol Academy'");
    expect(source).toContain('$PORTAL_URL/en/sign-in');
    expect(source).toContain('$ADMIN_URL/en/sign-in');
  });
});
