import {
  formatDate,
  formatPercent,
  PARENT_COPY,
  PROMPT_LEVEL_LABELS,
  skillTitle,
  TREND_LABELS,
} from '@luminol/kids-content';
import type {
  ActivitySummary,
  ChildProfile,
  GoalStatus,
  SessionRecord,
  SkillSummary,
} from '@luminol/kids-learning';
import { kidsColors } from '@luminol/kids-ui';

export type ReportData = {
  child: ChildProfile;
  activity: ActivitySummary;
  skills: SkillSummary[];
  goals: GoalStatus[];
  sessions: SessionRecord[];
  generatedAt: Date;
};

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Everything that reaches the HTML goes through here, nicknames included. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

const copy = PARENT_COPY.progress;

function tile(label: string, value: number): string {
  return `<div class="tile"><div class="value">${value}</div><div class="label">${escapeHtml(label)}</div></div>`;
}

/** A level meter with its value written beside it, so it never relies on the bar. */
function meter(level: number, max: number): string {
  const width = Math.round((level / max) * 100);
  return `<div class="meter"><div class="bar"><div class="fill" style="width:${width}%"></div></div><span>${level} / ${max}</span></div>`;
}

/**
 * A printable progress report in Arabic, laid out right to left. It holds
 * only what the dashboard shows: no photos, recordings or trial details.
 */
export function buildReportHtml(data: ReportData): string {
  const { child, activity, skills, goals, sessions, generatedAt } = data;
  const skillRows = skills
    .map(
      (skill) => `<tr>
        <td>${escapeHtml(skillTitle(skill.skillId).text)}</td>
        <td>${meter(skill.level, skill.maxLevel)}</td>
        <td>${escapeHtml(PROMPT_LEVEL_LABELS[skill.promptLevel])}</td>
        <td>${skill.recentRate === null ? escapeHtml(copy.notEnough) : formatPercent(skill.recentRate)}</td>
        <td>${skill.trend ? escapeHtml(TREND_LABELS[skill.trend]) : '—'}</td>
        <td>${skill.trials}</td>
        <td>${skill.lastPracticed ? formatDate(skill.lastPracticed) : '—'}</td>
      </tr>`,
    )
    .join('');
  const goalRows = goals
    .map(
      (status) => `<tr>
        <td>${escapeHtml(skillTitle(status.goal.skillId).text)}</td>
        <td>${status.targetLevel}</td>
        <td>${status.currentLevel}</td>
        <td>${escapeHtml(status.achieved ? copy.goalAchieved : copy.goalInProgress)}</td>
      </tr>`,
    )
    .join('');
  const sessionRows = sessions
    .map(
      (session) => `<tr>
        <td>${formatDate(session.startedAt)}</td>
        <td>${session.activitiesCompleted}</td>
        <td>${session.calmVisits}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${escapeHtml(`${copy.reportTitle}: ${child.nickname}`)}</title>
<style>
  body { font-family: sans-serif; color: ${kidsColors.ink}; background: ${kidsColors.surface}; margin: 32px; line-height: 1.6; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 18px; margin: 28px 0 8px; }
  .muted { color: ${kidsColors.inkSoft}; font-size: 13px; }
  .tiles { display: flex; flex-wrap: wrap; gap: 12px; }
  .tile { border: 1px solid ${kidsColors.line}; border-radius: 12px; padding: 10px 14px; min-width: 120px; }
  .value { font-size: 22px; font-weight: bold; }
  .label { font-size: 13px; color: ${kidsColors.inkSoft}; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: right; padding: 6px 8px; border-bottom: 1px solid ${kidsColors.line}; vertical-align: middle; }
  th { color: ${kidsColors.inkSoft}; font-weight: normal; }
  .meter { display: flex; align-items: center; gap: 8px; }
  .bar { width: 80px; height: 8px; border-radius: 4px; background: ${kidsColors.surfaceSoft}; overflow: hidden; }
  .fill { height: 8px; border-radius: 4px; background: ${kidsColors.accent}; }
</style>
</head>
<body>
  <h1>${escapeHtml(`${copy.reportTitle}: ${child.nickname}`)}</h1>
  <div class="muted">${escapeHtml(copy.reportDate)}: ${formatDate(generatedAt.toISOString())}</div>

  <h2>${escapeHtml(copy.summary)}</h2>
  <div class="tiles">
    ${tile(copy.sessions, activity.sessions)}
    ${tile(copy.activities, activity.activitiesCompleted)}
    ${tile(copy.trialsWeek, activity.trialsLast7Days)}
    ${tile(copy.daysMonth, activity.daysPracticedLast30)}
    ${tile(copy.calmVisits, activity.calmVisits)}
  </div>

  <h2>${escapeHtml(copy.skills)}</h2>
  ${
    skills.length === 0
      ? `<p>${escapeHtml(copy.noSkills)}</p>`
      : `<table>
    <thead><tr>
      <th>${escapeHtml(copy.goalSkill)}</th><th>${escapeHtml(copy.level)}</th><th>${escapeHtml(copy.help)}</th>
      <th>${escapeHtml(copy.firstTry)}</th><th>${escapeHtml(copy.trend)}</th><th>${escapeHtml(copy.trials)}</th><th>${escapeHtml(copy.lastPracticed)}</th>
    </tr></thead>
    <tbody>${skillRows}</tbody>
  </table>`
  }
  <p class="muted">${escapeHtml(copy.rateNote)}</p>

  <h2>${escapeHtml(copy.goals)}</h2>
  ${
    goals.length === 0
      ? `<p>${escapeHtml(copy.noGoals)}</p>`
      : `<table>
    <thead><tr><th>${escapeHtml(copy.goalSkill)}</th><th>${escapeHtml(copy.goalLevel)}</th><th>${escapeHtml(copy.level)}</th><th>${escapeHtml(copy.goalStatus)}</th></tr></thead>
    <tbody>${goalRows}</tbody>
  </table>`
  }

  <h2>${escapeHtml(copy.history)}</h2>
  ${
    sessions.length === 0
      ? `<p>${escapeHtml(copy.noHistory)}</p>`
      : `<table>
    <thead><tr><th>${escapeHtml(copy.reportDate)}</th><th>${escapeHtml(copy.sessionLine)}</th><th>${escapeHtml(copy.calmLine)}</th></tr></thead>
    <tbody>${sessionRows}</tbody>
  </table>`
  }

  <p class="muted">${escapeHtml(copy.reportNote)}</p>
</body>
</html>`;
}
