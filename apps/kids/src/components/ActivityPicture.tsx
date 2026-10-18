import {
  avatarPiece,
  type Avatar,
  type ScheduleStep,
} from '@luminol/kids-learning';
import { kidsSpacing, ShapeGlyph } from '@luminol/kids-ui';
import { StyleSheet, View } from 'react-native';

/** A code-drawn picture for each schedule step, so non-readers know what is next. */
export function ActivityPicture({
  step,
  avatar,
}: {
  step: ScheduleStep;
  avatar: Avatar;
}) {
  if (step.kind === 'finish') {
    const piece = avatarPiece(avatar);
    return (
      <ShapeGlyph shape={piece.shape} color={piece.color} size={110} face />
    );
  }
  switch (step.skillId) {
    case 'match-shapes':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="star" color="yellow" size={72} />
          <ShapeGlyph shape="star" color="yellow" size={72} />
        </View>
      );
    case 'sort-color':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="circle" color="red" size={72} />
          <ShapeGlyph shape="circle" color="blue" size={72} />
        </View>
      );
    case 'sort-shape':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="triangle" color="green" size={72} />
          <ShapeGlyph shape="square" color="green" size={72} />
        </View>
      );
    case 'sort-size':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="circle" color="blue" size={96} />
          <ShapeGlyph shape="circle" color="blue" size={48} />
        </View>
      );
    case 'cause-effect':
      return <ShapeGlyph shape="heart" color="red" size={110} face />;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.md,
  },
});
