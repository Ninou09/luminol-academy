import {
  aacCardUtterance,
  aacCategoryUtterance,
  phrase,
} from '@luminol/kids-content';
import {
  AAC_CATEGORIES,
  addToSentence,
  removeLastWord,
  resolveBoard,
  visibleCards,
  type AacCategory,
  type BoardCard,
} from '@luminol/kids-learning';
import {
  BigButton,
  ChoiceTile,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  touchTargets,
} from '@luminol/kids-ui';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardPicture } from '../src/aac/CardPicture';
import { cardSpeech, useBoard } from '../src/aac/useBoard';
import { ChildScreen } from '../src/components/ChildScreen';
import { useAppState } from '../src/state/AppState';

function cardLabel(card: BoardCard): string {
  return aacCardUtterance(card).text;
}

/** Communication board: tap pictures to build a sentence, then hear it. */
export default function TalkScreen() {
  const { activeChild, services, say, sayItems } = useAppState();
  const { board } = useBoard(activeChild?.id);
  const [category, setCategory] = useState<AacCategory>('core');
  const [sentence, setSentence] = useState<string[]>([]);

  if (!activeChild) return <Redirect href="/" />;
  if (!board) return <ChildScreen current="talk">{null}</ChildScreen>;

  const byId = new Map(resolveBoard(board).map((card) => [card.id, card]));
  const words = sentence
    .map((id) => byId.get(id))
    .filter((card): card is BoardCard => card !== undefined);
  const cards = visibleCards(board, category);

  return (
    <ChildScreen current="talk">
      <View style={styles.screen}>
        <View style={styles.strip} testID="sentence-strip">
          <View style={styles.words}>
            {words.length === 0 ? (
              <KidsText tone="soft">{phrase('aac.empty').text}</KidsText>
            ) : (
              words.map((card, index) => (
                <View
                  key={`${card.id}-${index}`}
                  style={styles.word}
                  accessible
                  accessibilityLabel={cardLabel(card)}
                  testID={`sentence-word-${card.id}`}
                >
                  <CardPicture picture={card.picture} size={52} />
                  <KidsText variant="parentBody" align="center">
                    {cardLabel(card)}
                  </KidsText>
                </View>
              ))
            )}
          </View>
          <View style={styles.actions}>
            <BigButton
              label={phrase('aac.speak').text}
              disabled={words.length === 0}
              onPress={() =>
                sayItems(words.map((card) => cardSpeech(card, services.media)))
              }
              testID="sentence-speak"
            />
            <BigButton
              label={phrase('aac.removeLast').text}
              variant="secondary"
              disabled={words.length === 0}
              onPress={() => setSentence(removeLastWord(sentence))}
              testID="sentence-remove"
            />
            <BigButton
              label={phrase('aac.clear').text}
              variant="secondary"
              disabled={words.length === 0}
              onPress={() => setSentence([])}
              testID="sentence-clear"
            />
          </View>
        </View>

        <View accessibilityRole="tablist" style={styles.tabs}>
          {AAC_CATEGORIES.map((value) => {
            const label = aacCategoryUtterance(value);
            const selected = value === category;
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityLabel={label.text}
                accessibilityState={{ selected }}
                onPress={() => {
                  say(label);
                  setCategory(value);
                }}
                style={[
                  styles.tab,
                  selected ? styles.tabSelected : styles.tabIdle,
                ]}
                testID={`category-${value}`}
              >
                <KidsText align="center">{label.text}</KidsText>
              </Pressable>
            );
          })}
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {cards.map((card) => (
            <ChoiceTile
              key={card.id}
              accessibilityLabel={cardLabel(card)}
              onPress={() => {
                sayItems([cardSpeech(card, services.media)]);
                setSentence(addToSentence(sentence, card.id));
              }}
              size={164}
              testID={`card-${card.id}`}
            >
              <CardPicture picture={card.picture} size={104} />
              <KidsText align="center">{cardLabel(card)}</KidsText>
            </ChoiceTile>
          ))}
        </ScrollView>
      </View>
    </ChildScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: kidsSpacing.md,
  },
  strip: {
    gap: kidsSpacing.sm,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: kidsSpacing.sm,
    minHeight: 96,
  },
  word: {
    alignItems: 'center',
    padding: kidsSpacing.xs,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.accentSoft,
    minWidth: 72,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  tab: {
    minHeight: touchTargets.child,
    paddingHorizontal: kidsSpacing.md,
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    justifyContent: 'center',
  },
  tabSelected: {
    backgroundColor: kidsColors.accentSoft,
    borderColor: kidsColors.accent,
    borderWidth: 4,
  },
  tabIdle: {
    backgroundColor: kidsColors.surface,
    borderColor: kidsColors.line,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: kidsSpacing.md,
    paddingBottom: kidsSpacing.xl,
  },
});
