import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'fr', 'en'] as const) {
  test(`${locale} minimal enquiry sends only essential answers`, async ({
    page,
  }) => {
    const submissions: Record<string, unknown>[] = [];
    await page.route('**/api/enquiries', async (route) => {
      submissions.push(
        route.request().postDataJSON() as Record<string, unknown>,
      );
      await route.fulfill({ status: 201, json: { submitted: true } });
    });
    await page.goto(`/${locale}/contact`);
    const form = page.locator('.enquiry-form');
    await form.locator('[name="name"]').fill('Enquiry browser test');
    await form.locator('[name="phone"]').fill('0555 12 34 56');
    await form.locator('[name="school"]').selectOption('PSYCHOLOGY');
    await expect(form.locator('details')).not.toHaveAttribute('open');
    // Explicit consent is still required; incomplete forms never reach the API.
    await form.locator('[type="submit"]').click();
    expect(submissions).toHaveLength(0);
    await form.locator('[name="consent"]').check();
    await form.locator('[type="submit"]').click();
    await expect(form.locator('.form-status-success')).toBeVisible();
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      name: 'Enquiry browser test',
      phone: '0555 12 34 56',
      email: '',
      school: 'PSYCHOLOGY',
      preferredContact: 'WHATSAPP',
      locale,
      consent: true,
      city: '',
      message: '',
    });
    expect(submissions[0]).not.toHaveProperty('deliveryPreference');
    expect(submissions[0]).not.toHaveProperty('timingPreference');
    await expect(form.locator('[name="name"]')).toHaveValue('');
    await expect(form.locator('[name="consent"]')).not.toBeChecked();
  });
}

test('email enquiries preserve optional details after failure and can be retried', async ({
  page,
}) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route('**/api/enquiries', async (route) => {
    submissions.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: submissions.length === 1 ? 500 : 201,
      json:
        submissions.length === 1
          ? { error: 'Temporary failure' }
          : { submitted: true },
    });
  });
  await page.goto('/ar/consultations');
  const form = page.locator('.enquiry-form');
  await form.locator('[name="name"]').fill('Enquiry retry test');
  await form.locator('[name="preferredContact"]').selectOption('EMAIL');
  await expect(form.locator('[name="phone"]')).toHaveCount(0);
  await expect(form.locator('[name="email"]')).toHaveAttribute('required');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('summary').click();
  await form.locator('[name="city"]').fill('Blida');
  await form.locator('[name="deliveryPreference"]').selectOption('ONLINE');
  await form.locator('[name="timingPreference"]').selectOption('LATER');
  await form.locator('[name="consent"]').check();
  await form.locator('[type="submit"]').click();
  await expect(form.locator('.form-status-error')).toBeVisible();
  await expect(form.locator('[name="email"]')).toHaveValue('test@example.com');
  await expect(form.locator('[name="city"]')).toHaveValue('Blida');
  await form.locator('[type="submit"]').click();
  await expect(form.locator('.form-status-success')).toBeVisible();
  expect(submissions).toHaveLength(2);
  expect(submissions[1]).toMatchObject({
    preferredContact: 'EMAIL',
    email: 'test@example.com',
    phone: '',
    city: 'Blida',
    deliveryPreference: 'ONLINE',
    timingPreference: 'LATER',
    school: 'PSYCHOLOGY',
  });
  expect(String(submissions[1]?.message)).toContain('استشارة');
});
