import {
  binLabel,
  describePiece,
  phrase,
  type PhraseKey,
} from '@luminol/kids-content';
import {
  createSortingBins,
  createSortingItem,
  levelSpec,
  type PieceSize,
  type SortBin,
  type SortDimension,
  type SortingSkill,
} from '@luminol/kids-learning';
import {
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  ShapeGlyph,
} from '@luminol/kids-ui';
import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { choiceState, GameFrame, type GameProps } from './GameFrame';
import { useTrialFlow } from './useTrialFlow';

const INSTRUCTIONS: Record<SortDimension, PhraseKey> = {
  color: 'sorting.instruction.color',
  shape: 'sorting.instruction.shape',
  size: 'sorting.instruction.size',
};

const PIECE_PIXELS: Record<PieceSize, number> = {
  small: 56,
  medium: 96,
  large: 144,
};

const BIN_SIZE_PIXELS: Record<PieceSize, number> = {
  small: 36,
  medium: 56,
  large: 80,
};

function BinPicture({ bin }: { bin: SortBin }) {
  switch (bin.dimension) {
    case 'color':
      return <ShapeGlyph shape="circle" color={bin.value} size={64} />;
    case 'shape':
      return (
        <ShapeGlyph shape={bin.value} color="blue" tone="outline" size={64} />
      );
    case 'size':
      return (
        <ShapeGlyph
          shape="circle"
          color="blue"
          tone="outline"
          size={BIN_SIZE_PIXELS[bin.value]}
        />
      );
  }
}

/** Put each piece with its group. Bins stay in the same place for the whole level. */
export function SortingGame({
  skill,
  trials,
  onDone,
}: GameProps & { skill: SortingSkill }) {
  const instruction = phrase(INSTRUCTIONS[skill.dimension]);
  const itemRef = useRef<ReturnType<typeof createSortingItem> | null>(null);
  const binsRef = useRef<SortBin[]>([]);
  const flow = useTrialFlow({
    skill,
    trials,
    instruction,
    hint: () => {
      const bin = itemRef.current
        ? binsRef.current[itemRef.current.correctBin]
        : undefined;
      return bin ? binLabel(bin) : instruction;
    },
  });
  const spec = levelSpec(skill, flow.level);
  const bins = useMemo(
    () => createSortingBins(skill.dimension, spec, flow.random),
    [flow.random, skill.dimension, spec],
  );
  const item = useMemo(
    () => createSortingItem(bins, spec, flow.random),
    // A new item for every trial.
    [bins, flow.random, flow.trialIndex, spec],
  );
  binsRef.current = bins;
  itemRef.current = item;
  const celebrating = flow.phase === 'celebrating';

  return (
    <GameFrame flow={flow} instruction={instruction} onDone={onDone}>
      <View style={styles.item} testID="sorting-item">
        <ShapeGlyph
          shape={item.piece.shape}
          color={item.piece.color}
          size={PIECE_PIXELS[item.piece.size]}
          accessibilityLabel={
            describePiece(item.piece, {
              includeSize: skill.dimension === 'size',
            }).text
          }
        />
      </View>
      <View style={styles.bins}>
        {bins.map((bin, index) => {
          const isCorrect = index === item.correctBin;
          const label = binLabel(bin);
          return (
            <ChoiceTile
              key={`${bin.dimension}-${bin.value}`}
              accessibilityLabel={label.text}
              state={choiceState(flow.assist, isCorrect, celebrating)}
              onPress={() => flow.respond(isCorrect)}
              testID={isCorrect ? 'choice-correct' : `choice-other-${index}`}
              size={170}
            >
              <BinPicture bin={bin} />
              <KidsText align="center">{label.text}</KidsText>
            </ChoiceTile>
          );
        })}
      </View>
    </GameFrame>
  );
}

const styles = StyleSheet.create({
  item: {
    minWidth: 180,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  bins: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.lg,
  },
});
