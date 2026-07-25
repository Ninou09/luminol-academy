export function createCertificateRecipientName(
  firstName: string | null,
  lastName: string | null,
) {
  const name = [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return name || null;
}
