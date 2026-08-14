from pathlib import Path

path = Path('packages/database/scripts/backfill-milestone16-organization-links.mjs')
text = path.read_text()

old = "const retryDelayMs = 50;\nconst maxIdleRetries = 600;\nconst lockTimeout = '2s';"
new = "const retryDelayMs = 50;\nconst lockTimeout = '2s';\nconst maxBackfillDurationMs = 10 * 60 * 1000;\nconst backfillDeadlineAt = Date.now() + maxBackfillDurationMs;"
if old not in text:
    raise SystemExit('retry constants marker not found')
text = text.replace(old, new, 1)

lock_replacements = {
    'FOR UPDATE OF invoice SKIP LOCKED': 'FOR UPDATE OF invoice, organization SKIP LOCKED',
    'FOR UPDATE OF billing, invoice SKIP LOCKED': 'FOR UPDATE OF billing, invoice, organization SKIP LOCKED',
    'FOR UPDATE OF event SKIP LOCKED': 'FOR UPDATE OF event, organization, membership, recipient SKIP LOCKED',
    'FOR UPDATE OF notification, event SKIP LOCKED': 'FOR UPDATE OF notification, event, organization, membership, recipient SKIP LOCKED',
}
for source, target in lock_replacements.items():
    if source not in text:
        raise SystemExit(f'lock marker not found: {source}')
    text = text.replace(source, target, 1)

update_marker = 'async function updateBatch(backfill) {\n  await client.query(\'BEGIN\');'
update_replacement = '''function assertWithinDeadline(backfill) {
  if (Date.now() >= backfillDeadlineAt) {
    throw new Error(
      `Milestone 16 organization-link backfill exceeded its ${maxBackfillDurationMs / 60000}-minute global deadline while processing ${backfill.name}.`,
    );
  }
}

async function updateBatch(backfill) {
  assertWithinDeadline(backfill);
  await client.query('BEGIN');'''
if update_marker not in text:
    raise SystemExit('updateBatch marker not found')
text = text.replace(update_marker, update_replacement, 1)

eligible_marker = '''async function hasEligibleRows(backfill) {
  const result = await client.query('''
eligible_replacement = '''async function hasEligibleRows(backfill) {
  assertWithinDeadline(backfill);
  const result = await client.query('''
if eligible_marker not in text:
    raise SystemExit('hasEligibleRows marker not found')
text = text.replace(eligible_marker, eligible_replacement, 1)

start = text.find('async function waitOrFail(backfill, idleRetries) {')
end = text.find('\nawait client.connect();', start)
if start < 0 or end < 0:
    raise SystemExit('retry/runBackfill block not found')
replacement = '''async function waitOrFail(backfill) {
  assertWithinDeadline(backfill);
  await sleep(retryDelayMs);
  assertWithinDeadline(backfill);
}

async function runBackfill(backfill) {
  let totalUpdated = 0;

  for (;;) {
    const batch = await updateBatch(backfill);
    totalUpdated += batch.updated;

    if (batch.updated > 0) {
      continue;
    }

    if (batch.retryable) {
      await waitOrFail(backfill);
      continue;
    }

    if (!(await hasEligibleRows(backfill))) {
      break;
    }

    await waitOrFail(backfill);
  }

  process.stdout.write(
    `Milestone 16 ${backfill.name} organization-link backfill updated ${totalUpdated} rows.\\n`,
  );
}
'''
text = text[:start] + replacement + text[end:]

path.write_text(text)
