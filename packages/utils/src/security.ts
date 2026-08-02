const sensitiveKey =
  /(?:authorization|cookie|password|secret|token|api[-_]?key|therapy|notes?|body|payload)/i;

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? '[REDACTED]' : redactSensitive(item),
      ]),
    );
  }
  return value;
}

export function safeInternalRedirect(input: unknown, fallback = '/'): string {
  if (typeof input !== 'string') return fallback;
  if (!input.startsWith('/') || input.startsWith('//') || input.includes('\\'))
    return fallback;
  try {
    const url = new URL(input, 'https://internal.invalid');
    return url.origin === 'https://internal.invalid'
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
