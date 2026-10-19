import { greetingWords } from '@luminol/kids-content';
import {
  avatarPiece,
  type Avatar,
  type ScheduleStep,
} from '@luminol/kids-learning';
import { kidsSpacing, KidsText, ShapeGlyph } from '@luminol/kids-ui';
import { StyleSheet, View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import { SequencePicture } from '../sequences/SequencePicture';

/**
 * A picture for each schedule step, code-drawn or a board picture, so
 * non-readers know what is next.
 */
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
    case 'pattern-next':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="circle" color="blue" size={44} />
          <ShapeGlyph shape="square" color="yellow" size={44} />
          <ShapeGlyph shape="circle" color="blue" size={44} />
          <ShapeGlyph shape="square" color="yellow" size={44} tone="outline" />
        </View>
      );
    case 'memory-pairs':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="square" color="blue" size={72} tone="outline" />
          <ShapeGlyph shape="star" color="green" size={72} />
        </View>
      );
    case 'letter-match':
    case 'letter-sound':
    case 'letter-forms':
    case 'letter-trace':
      return (
        <KidsText align="center" style={styles.letters}>
          {step.skillId === 'letter-forms' ? 'بـ ـبـ ـب' : 'أ ب ت'}
        </KidsText>
      );
    case 'count-objects':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="circle" color="green" size={44} />
          <ShapeGlyph shape="circle" color="green" size={44} />
          <ShapeGlyph shape="circle" color="green" size={44} />
        </View>
      );
    case 'puzzle-complete':
      return (
        <View style={styles.row}>
          <ShapeGlyph shape="heart" color="red" size={72} />
          <ShapeGlyph shape="heart" color="red" size={72} tone="outline" />
        </View>
      );
    case 'emotion-find':
      return (
        <CardPicture picture={{ kind: 'builtin', id: 'happy' }} size={110} />
      );
    case 'emotion-situation':
      return (
        <View style={styles.row}>
          <CardPicture picture={{ kind: 'builtin', id: 'happy' }} size={80} />
          <CardPicture picture={{ kind: 'builtin', id: 'sad' }} size={80} />
        </View>
      );
    case 'turn-taking':
      return (
        <View style={styles.tower}>
          <ShapeGlyph shape="square" color="blue" size={56} />
          <ShapeGlyph shape="square" color="yellow" size={56} />
        </View>
      );
    case 'sequence-steps':
      return (
        <View style={styles.row}>
          <SequencePicture
            picture={{ kind: 'routine', id: 'wash-wet' }}
            size={72}
          />
          <SequencePicture
            picture={{ kind: 'routine', id: 'wash-dry' }}
            size={72}
          />
        </View>
      );
    case 'greetings':
      return (
        <KidsText align="center" style={styles.words}>
          {greetingWords('thanks').text}
        </KidsText>
      );
  }
}

const styles = StyleSheet.create({
  letters: {
    fontSize: 56,
    lineHeight: 84,
  },
  words: {
    fontSize: 40,
    lineHeight: 60,
  },
  tower: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: kidsSpacing.md,
  },
});
