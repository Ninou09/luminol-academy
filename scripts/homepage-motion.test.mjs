import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(resolve('apps/web/app/page.tsx'), 'utf8');
const motionSource = readFileSync(
  resolve('apps/web/components/home-motion.tsx'),
  'utf8',
);
const motionStyles = readFileSync(resolve('apps/web/app/motion.css'), 'utf8');
const shellSource = readFileSync(
  resolve('apps/web/components/site-shell.tsx'),
  'utf8',
);

describe('premium public homepage', () => {
  it('keeps the three governed school routes and contact journey', () => {
    expect(pageSource).toContain('href={`/schools/${school.slug}`}');
    expect(pageSource).toContain('schools.psychology.programs');
    expect(pageSource).toContain('schools.languages.programs');
    expect(pageSource).toContain('schools.training.programs');
    expect(pageSource).toContain('href="/contact"');
  });

  it('uses progressive enhancement for motion', () => {
    expect(pageSource).toContain('<HomeMotion />');
    expect(pageSource).toContain('data-reveal');
    expect(pageSource).toContain('data-count');
    expect(motionSource).toContain('IntersectionObserver');
    expect(motionSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(motionStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motionStyles).toContain("[data-revealed='true']");
  });

  it('provides responsive navigation without requiring JavaScript', () => {
    expect(shellSource).toContain('<details className="mobile-menu">');
    expect(shellSource).toContain('aria-label="Mobile navigation"');
    expect(shellSource).toContain(
      'Psychology · Languages · Professional Training',
    );
  });
});
