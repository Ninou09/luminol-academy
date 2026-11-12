import { describe, expect, it } from 'vitest';

import {
  getCrmDashboardCopy,
  getCrmPipelineCopy,
} from './crm-insights-localization';

describe('CRM pipeline and dashboard localization', () => {
  it.each(['en', 'fr', 'ar'] as const)('is complete in %s', (locale) => {
    const pipeline = getCrmPipelineCopy(locale);
    const dashboard = getCrmDashboardCopy(locale);
    for (const value of Object.values(pipeline.board)) {
      expect(value).toBeTruthy();
    }
    expect(pipeline.limited('200')).toContain('200');
    expect(dashboard.period('30')).toContain('30');
    expect(dashboard.definitions).toBeTruthy();
  });
});
