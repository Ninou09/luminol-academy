import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => file !== 'scripts/security-check.mjs')
  .filter((file) => !file.endsWith('pnpm-lock.yaml'));
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /sk_live_[A-Za-z0-9]{16,}/,
  /AKIA[0-9A-Z]{16}/,
  /gh[oprs]_[A-Za-z0-9_]{30,}/,
];
const findings = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (patterns.some((pattern) => pattern.test(content))) findings.push(file);
}
if (findings.length) {
  process.stderr.write(`Potential secrets found in: ${findings.join(', ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Secret scan passed for ${files.length} tracked files.\n`,
  );
}
