import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const fullCommitSha = /^[0-9a-f]{40}$/i;
const usesLine = /^\s*(?:-\s*)?uses:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))/;

export function findUnpinnedActionReferences(content, file = 'workflow') {
  const findings = [];

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    const match = line.match(usesLine);
    if (!match) continue;

    const reference = match[1] ?? match[2] ?? match[3];
    if (reference.startsWith('./') || reference.startsWith('docker://')) {
      continue;
    }

    const separator = reference.lastIndexOf('@');
    const revision = separator > 0 ? reference.slice(separator + 1) : '';
    if (!fullCommitSha.test(revision)) {
      findings.push(`${file}:${index + 1}: ${reference}`);
    }
  }

  return findings;
}

export function listWorkflowFiles() {
  return execFileSync(
    'git',
    ['ls-files', '.github/workflows/*.yml', '.github/workflows/*.yaml'],
    { encoding: 'utf8' },
  )
    .split(/\r?\n/)
    .filter(Boolean);
}

export function checkTrackedWorkflowActionPins(workflowFiles = listWorkflowFiles()) {
  return workflowFiles.flatMap((file) =>
    findUnpinnedActionReferences(readFileSync(file, 'utf8'), file),
  );
}

const isDirectRun =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  const workflowFiles = listWorkflowFiles();
  const findings = checkTrackedWorkflowActionPins(workflowFiles);

  if (findings.length) {
    process.stderr.write(
      `External GitHub Actions must use full commit SHAs:\n${findings
        .map((finding) => `- ${finding}`)
        .join('\n')}\n`,
    );
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Action pin check passed for ${workflowFiles.length} workflow files.\n`,
    );
  }
}
