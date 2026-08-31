import { describe, expect, it } from 'vitest';

import {
  buildEnquiryCityQuery,
  ENQUIRY_CITY_FILTER_LIMIT,
  getEnquiryCityWhere,
  parseEnquiryCityFilter,
} from './enquiry-city-filter';

describe('enquiry city filter', () => {
  it('accepts one exact recorded city without normalization', () => {
    expect(parseEnquiryCityFilter('Blida')).toBe('Blida');
    expect(parseEnquiryCityFilter('البليدة')).toBe('البليدة');
  });

  it('fails closed for repeated, missing, padded, short or malformed values', () => {
    expect(parseEnquiryCityFilter(['Blida'])).toBeNull();
    expect(parseEnquiryCityFilter(undefined)).toBeNull();
    expect(parseEnquiryCityFilter(' Blida')).toBeNull();
    expect(parseEnquiryCityFilter('Blida ')).toBeNull();
    expect(parseEnquiryCityFilter('B')).toBeNull();
    expect(parseEnquiryCityFilter('Blida\nCentre')).toBeNull();
    expect(parseEnquiryCityFilter('Blida\tCentre')).toBeNull();
  });

  it('fails closed above the existing persisted city bound', () => {
    expect(parseEnquiryCityFilter('a'.repeat(ENQUIRY_CITY_FILTER_LIMIT + 1))).toBeNull();
  });

  it('builds an exact Prisma predicate only for a valid active value', () => {
    expect(getEnquiryCityWhere('Blida')).toEqual({ city: 'Blida' });
    expect(getEnquiryCityWhere(null)).toBeNull();
  });

  it('encodes the exact city value into the protected query', () => {
    const query = buildEnquiryCityQuery('Blida Centre');
    expect(new URLSearchParams(query).get('city')).toBe('Blida Centre');
  });
});
