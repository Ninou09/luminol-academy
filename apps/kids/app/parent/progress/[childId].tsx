import {
  formatDate,
  formatPercent,
  PARENT_COPY,
  PROMPT_LEVEL_LABELS,
  skillTitle,
  TREND_LABELS,
} from '@luminol/kids-content';
import {
  MAX_GOALS,
  maxLevel,
  SKILLS,
  skillsForAge,
  type ChildProfile,
  type SkillId,
  type SkillSummary,
  type WeekSummary,
} from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  SegmentedChoice,
} from '@luminol/kids-ui';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ParentScreen } from '../../../src/components/ParentScreen';
import {
  datedFileName,
  exportChildData,
} from '../../../src/reports/exportData';
import { buildReportHtml } from '../../../src/reports/reportHtml';
import {
  useProgress,
  type ProgressView,
} from '../../../src/reports/useProgress';
import { useAppState } from '../../../src/state/AppState';

const copy = PARENT_COPY.progress;

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={styles.tile}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <KidsText variant="title">{String(value)}</KidsText>
      <KidsText variant="parentBody" tone="soft">
        {label}
      </KidsText>
    </View>
  );
}

/** A level meter; the value is always written out beside the bar. */
function LevelMeter({ level, max }: { level: number; max: number }) {
  return (
    <View style={styles.meterRow}>
      <View style={styles.meter}>
        <View
          style={[styles.meterFill, { width: `${(level / max) * 100}%` }]}
        />
      </View>
      <KidsText variant="parentBody">{`${level} / ${max}`}</KidsText>
    </View>
  );
}

function SkillRow({ skill }: { skill: SkillSummary }) {
  const title = skillTitle(skill.skillId).text;
  return (
    <View style={styles.card} testID={`skill-${skill.skillId}`}>
      <KidsText heading>{title}</KidsText>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <KidsText variant="parentBody" tone="soft">
            {copy.level}
          </KidsText>
          <LevelMeter level={skill.level} max={skill.maxLevel} />
        </View>
        <View style={styles.fact}>
          <KidsText variant="parentBody" tone="soft">
            {copy.help}
          </KidsText>
          <KidsText variant="parentBody">
            {PROMPT_LEVEL_LABELS[skill.promptLevel]}
          </KidsText>
        </View>
        <View style={styles.fact}>
          <KidsText variant="parentBody" tone="soft">
            {copy.firstTry}
          </KidsText>
          <KidsText variant="parentBody" testID={`skill-rate-${skill.skillId}`}>
            {skill.recentRate === null
              ? copy.notEnough
              : formatPercent(skill.recentRate)}
          </KidsText>
        </View>
        {skill.trend && (
          <View style={styles.fact}>
            <KidsText variant="parentBody" tone="soft">
              {copy.trend}
            </KidsText>
            <KidsText variant="parentBody">
              {TREND_LABELS[skill.trend]}
            </KidsText>
          </View>
        )}
        <View style={styles.fact}>
          <KidsText variant="parentBody" tone="soft">
            {copy.trials}
          </KidsText>
          <KidsText variant="parentBody">{String(skill.trials)}</KidsText>
        </View>
        {skill.lastPracticed && (
          <View style={styles.fact}>
            <KidsText variant="parentBody" tone="soft">
              {copy.lastPracticed}
            </KidsText>
            <KidsText variant="parentBody">
              {formatDate(skill.lastPracticed)}
            </KidsText>
          </View>
        )}
      </View>
    </View>
  );
}

/** The weekly report card: the last 7 days, with last week's rate beside. */
function WeekCard({ week }: { week: WeekSummary }) {
  const mostPracticed = week.skillsPracticed
    .slice(0, 3)
    .map((skillId) => skillTitle(skillId).text)
    .join('، ');
  return (
    <View style={[styles.section, styles.card]} testID="week-card">
      <KidsText variant="title" heading>
        {copy.week}
      </KidsText>
      <KidsText variant="parentBody" tone="soft">
        {`${copy.weekRange} ${formatDate(week.from)} ${copy.weekTo} ${formatDate(week.to)}`}
      </KidsText>
      {week.trials === 0 ? (
        <KidsText variant="parentBody" testID="week-none">
          {copy.weekNone}
        </KidsText>
      ) : (
        <>
          <View style={styles.tiles}>
            <Tile label={copy.weekDays} value={week.daysPracticed} />
            <Tile label={copy.weekTrials} value={week.trials} />
          </View>
          <View style={styles.fact}>
            <KidsText variant="parentBody" tone="soft">
              {copy.weekRate}
            </KidsText>
            <KidsText variant="parentBody" testID="week-rate">
              {week.firstTryRate === null
                ? copy.notEnough
                : week.previousFirstTryRate === null
                  ? formatPercent(week.firstTryRate)
                  : `${formatPercent(week.firstTryRate)} (${copy.weekPrevious}: ${formatPercent(week.previousFirstTryRate)})`}
            </KidsText>
          </View>
          <View style={styles.fact}>
            <KidsText variant="parentBody" tone="soft">
              {copy.weekMostPracticed}
            </KidsText>
            <KidsText variant="parentBody" testID="week-most">
              {mostPracticed}
            </KidsText>
          </View>
          {week.strongestSkill && (
            <View style={styles.fact}>
              <KidsText variant="parentBody" tone="soft">
                {copy.weekStrongest}
              </KidsText>
              <KidsText variant="parentBody" testID="week-strongest">
                {skillTitle(week.strongestSkill).text}
              </KidsText>
            </View>
          )}
          <KidsText variant="parentBody" tone="soft">
            {copy.rateNote}
          </KidsText>
        </>
      )}
    </View>
  );
}

function Goals({
  child,
  view,
  onChanged,
}: {
  child: ChildProfile;
  view: ProgressView;
  onChanged: () => Promise<void>;
}) {
  const { services } = useAppState();
  const choices = skillsForAge(child.ageBand);
  const [adding, setAdding] = useState(false);
  const [skillId, setSkillId] = useState<SkillId>(choices[0] ?? 'match-shapes');
  const [targetLevel, setTargetLevel] = useState(2);
  const levels = maxLevel(SKILLS[skillId]);
  const full = view.goals.items.length >= MAX_GOALS;

  async function save(items: ProgressView['goals']['items']) {
    await services.repository.saveGoals(child.id, { items }, services.now());
    await onChanged();
  }

  return (
    <View style={styles.section}>
      <KidsText variant="title" heading>
        {copy.goals}
      </KidsText>
      <KidsText variant="parentBody" tone="soft">
        {copy.goalsIntro}
      </KidsText>
      {view.goalStatuses.length === 0 && (
        <KidsText variant="parentBody">{copy.noGoals}</KidsText>
      )}
      {view.goalStatuses.map((status) => {
        const title = skillTitle(status.goal.skillId).text;
        return (
          <View
            key={status.goal.id}
            style={styles.row}
            testID={`goal-${status.goal.id}`}
          >
            <View style={styles.grow}>
              <KidsText>{title}</KidsText>
              <KidsText variant="parentBody" tone="soft">
                {`${copy.goalLevel}: ${status.targetLevel} · ${copy.level}: ${status.currentLevel}`}
              </KidsText>
            </View>
            <KidsText
              variant="parentBody"
              testID={`goal-status-${status.goal.id}`}
            >
              {status.achieved ? `✓ ${copy.goalAchieved}` : copy.goalInProgress}
            </KidsText>
            <BigButton
              label={copy.goalRemove}
              variant="secondary"
              audience="parent"
              accessibilityHint={title}
              onPress={() =>
                void save(
                  view.goals.items.filter((goal) => goal.id !== status.goal.id),
                )
              }
              testID={`goal-remove-${status.goal.id}`}
            />
          </View>
        );
      })}
      {adding ? (
        <View style={styles.card}>
          <SegmentedChoice
            label={copy.goalSkill}
            options={choices.map((value) => ({
              value,
              label: skillTitle(value).text,
            }))}
            value={skillId}
            onChange={(value) => {
              setSkillId(value);
              setTargetLevel((level) =>
                Math.min(level, maxLevel(SKILLS[value])),
              );
            }}
            testID="goal-skill"
          />
          <SegmentedChoice
            label={copy.goalLevel}
            options={Array.from({ length: levels }, (_, index) => ({
              value: index + 1,
              label: String(index + 1),
            }))}
            value={Math.min(targetLevel, levels)}
            onChange={setTargetLevel}
            testID="goal-level"
          />
          <BigButton
            label={copy.goalSave}
            audience="parent"
            onPress={() => {
              void save([
                ...view.goals.items,
                {
                  id: services.newId(),
                  skillId,
                  targetLevel: Math.min(targetLevel, levels),
                  createdAt: services.now().toISOString(),
                },
              ]).then(() => setAdding(false));
            }}
            testID="goal-save"
          />
          <BigButton
            label={PARENT_COPY.sequences.cancel}
            variant="secondary"
            audience="parent"
            onPress={() => setAdding(false)}
          />
        </View>
      ) : full ? (
        <KidsText variant="parentBody">{copy.goalLimit}</KidsText>
      ) : (
        <BigButton
          label={copy.addGoal}
          variant="secondary"
          audience="parent"
          onPress={() => setAdding(true)}
          testID="goal-add"
        />
      )}
    </View>
  );
}

/** Progress, goals, history and the report and export for one child. */
export default function ProgressScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { profiles, services } = useAppState();
  const child = profiles.find((profile) => profile.id === childId);
  const { view, reload } = useProgress(child?.id);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  if (!child) return <Redirect href="/parent" />;
  if (!view) return <ParentScreen title={copy.title}>{null}</ParentScreen>;
  const current = child;
  const loaded = view;

  async function shareReport() {
    const now = services.now();
    const html = buildReportHtml({
      child: current,
      activity: loaded.activity,
      skills: loaded.skills,
      goals: loaded.goalStatuses,
      sessions: loaded.sessions,
      generatedAt: now,
    });
    const result = await services.share.sharePdf(
      html,
      datedFileName('noor-report', now, 'pdf'),
    );
    setNotice(result === 'shared' ? null : copy.shareFailed);
  }

  async function shareExport() {
    const now = services.now();
    const json = await exportChildData(services.repository, current, now);
    const result = await services.share.shareText(
      json,
      datedFileName('noor-data', now, 'json'),
      'application/json',
    );
    setNotice(result === 'shared' ? null : copy.shareFailed);
  }

  async function clearHistory() {
    await services.repository.clearHistory(current.id);
    setConfirmingClear(false);
    setNotice(copy.cleared);
    await reload();
  }

  const { activity } = view;

  return (
    <ParentScreen title={`${copy.title}: ${child.nickname}`}>
      <WeekCard week={view.week} />
      <View style={styles.section}>
        <KidsText variant="title" heading>
          {copy.summary}
        </KidsText>
        <View style={styles.tiles}>
          <Tile label={copy.sessions} value={activity.sessions} />
          <Tile label={copy.activities} value={activity.activitiesCompleted} />
          <Tile label={copy.trialsWeek} value={activity.trialsLast7Days} />
          <Tile label={copy.daysMonth} value={activity.daysPracticedLast30} />
          <Tile label={copy.calmVisits} value={activity.calmVisits} />
        </View>
      </View>

      <View style={styles.section}>
        <KidsText variant="title" heading>
          {copy.skills}
        </KidsText>
        {view.skills.length === 0 ? (
          <KidsText variant="parentBody">{copy.noSkills}</KidsText>
        ) : (
          view.skills.map((skill) => (
            <SkillRow key={skill.skillId} skill={skill} />
          ))
        )}
        <KidsText variant="parentBody" tone="soft">
          {copy.rateNote}
        </KidsText>
      </View>

      <Goals child={child} view={view} onChanged={reload} />

      <View style={styles.section}>
        <KidsText variant="title" heading>
          {copy.history}
        </KidsText>
        {view.sessions.length === 0 ? (
          <KidsText variant="parentBody">{copy.noHistory}</KidsText>
        ) : (
          view.sessions.map((session) => (
            <View key={session.id} style={styles.row}>
              <KidsText style={styles.grow}>
                {formatDate(session.startedAt)}
              </KidsText>
              <KidsText variant="parentBody">
                {`${session.activitiesCompleted} ${copy.sessionLine} · ${session.calmVisits} ${copy.calmLine}`}
              </KidsText>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <BigButton
          label={copy.report}
          audience="parent"
          onPress={() => void shareReport()}
          testID="progress-report"
        />
        <BigButton
          label={copy.export}
          variant="secondary"
          audience="parent"
          onPress={() => void shareExport()}
          testID="progress-export"
        />
        <KidsText variant="parentBody" tone="soft">
          {copy.exportNote}
        </KidsText>
        {confirmingClear ? (
          <View style={styles.confirm}>
            <KidsText variant="parentBody">{copy.clearConfirm}</KidsText>
            <BigButton
              label={copy.clearConfirmAction}
              variant="danger"
              audience="parent"
              onPress={() => void clearHistory()}
              testID="progress-clear-confirm"
            />
            <BigButton
              label={PARENT_COPY.sequences.cancel}
              variant="secondary"
              audience="parent"
              onPress={() => setConfirmingClear(false)}
            />
          </View>
        ) : (
          <BigButton
            label={copy.clear}
            variant="secondary"
            audience="parent"
            onPress={() => setConfirmingClear(true)}
            testID="progress-clear"
          />
        )}
        {notice && (
          <KidsText variant="parentBody" testID="progress-notice">
            {notice}
          </KidsText>
        )}
      </View>
    </ParentScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: kidsSpacing.sm,
  },
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  tile: {
    minWidth: 140,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  card: {
    gap: kidsSpacing.sm,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.lg,
  },
  fact: {
    gap: kidsSpacing.xs,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.sm,
  },
  meter: {
    width: 96,
    height: 8,
    borderRadius: 4,
    backgroundColor: kidsColors.surfaceSoft,
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: kidsColors.accent,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: kidsSpacing.md,
    padding: kidsSpacing.sm,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  grow: {
    flex: 1,
    minWidth: 160,
  },
  confirm: {
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.danger,
    backgroundColor: kidsColors.surface,
  },
});
