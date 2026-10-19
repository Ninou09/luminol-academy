import {
  formatNumber,
  numberUtterance,
  phrase,
  tokenUtterance,
} from '@luminol/kids-content';
import {
  createCountRound,
  distinctTokens,
  levelSpec,
  SKILLS,
  type NumeralStyle,
  type Token,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
} from '@luminol/kids-ui';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppState } from '../state/AppState';
import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { LetterText } from './LetterGame';
import { TokenView } from './TokenView';
import { useTrialFlow } from './useTrialFlow';

const skill = SKILLS['count-objects'];
const instruction = phrase('count.instruction');

function itemSize(count: number): number {
  if (count <= 5) return 84;
  if (count <= 10) return 64;
  return 48;
}

/**
 * Pictures to count. Touching each one counts it aloud and marks it with its
 * number, which supports counting without being marked right or wrong.
 */
function CountItems({
  token,
  count,
  style,
}: {
  token: Token;
  count: number;
  style: NumeralStyle;
}) {
  const { say } = useAppState();
  const [order, setOrder] = useState<number[]>([]);
  const size = itemSize(count);
  const name = tokenUtterance(token).text;

  return (
    <View style={styles.items} testID="count-items">
      {Array.from({ length: count }, (_, index) => {
        const position = order.indexOf(index);
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={
              position < 0
                ? name
                : `${name} ${numberUtterance(position + 1).text}`
            }
            onPress={() => {
              if (position >= 0) return;
              setOrder([...order, index]);
              say(numberUtterance(order.length + 1));
            }}
            style={styles.item}
            testID={`count-item-${index}`}
          >
            <TokenView token={token} size={size} />
            {position >= 0 && (
              <View style={styles.badge}>
                <KidsText variant="parentBody" tone="onAccent" align="center">
                  {formatNumber(position + 1, style)}
                </KidsText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

/** How many are there? Pick the number among nearby numbers in order. */
export function CountGame({ trials, theme, onDone }: GameProps) {
  const { activeChild } = useAppState();
  const style = activeChild?.numeralStyle ?? 'western';
  const countRef = useRef(0);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () =>
      countRef.current > 0 ? numberUtterance(countRef.current) : instruction,
  });
  const round = useMemo(
    () => ({
      ...createCountRound(levelSpec(skill, flow.level), flow.random),
      token: distinctTokens(theme, 1, flow.random)[0]!,
    }),
    [flow.trialIndex, flow.level, flow.random, theme],
  );
  countRef.current = round.count;
  const celebrating = flow.phase === 'celebrating';

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.frame}>
        <CountItems
          key={flow.trialIndex}
          token={round.token}
          count={round.count}
          style={style}
        />
      </View>
      <View style={styles.choices}>
        {round.choices.map((choice, index) => {
          const isCorrect = index === round.correctIndex;
          return (
            <ChoiceTile
              key={`${flow.trialIndex}-${choice}`}
              accessibilityLabel={numberUtterance(choice).text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              size={120}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
            >
              <LetterText text={formatNumber(choice, style)} size={52} />
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  frame: {
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
    maxWidth: 720,
  },
  items: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.sm,
  },
  item: {
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    minWidth: 30,
    paddingHorizontal: kidsSpacing.xs,
    borderRadius: kidsRadii.pill,
    backgroundColor: kidsColors.accent,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
