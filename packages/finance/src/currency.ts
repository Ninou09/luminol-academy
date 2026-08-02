import { z } from 'zod';

export const currencyCodeSchema = z
  .string()
  .length(3)
  .transform((value) => value.toUpperCase());

export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
