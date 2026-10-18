import {
  aacCardLabel,
  aacCategoryUtterance,
  aacPictureLabel,
  PARENT_COPY,
} from '@luminol/kids-content';
import {
  AAC_BUILTIN_CARDS,
  AAC_CATEGORIES,
  builtinPictures,
  customCardSchema,
  findCard,
  referencedMedia,
  removeCustomCard,
  setOverride,
  upsertCustomCard,
  type AacBoard,
  type AacCardId,
  type AacCategory,
  type BoardCard,
  type ChildProfile,
  type PictureChoice,
} from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  SegmentedChoice,
  touchTargets,
} from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import { cardSpeech } from '../aac/useBoard';
import type { PhotoSource } from '../media/media';
import { useAppState } from '../state/AppState';
import { useVoiceRecorder } from './useVoiceRecorder';

type Draft =
  | {
      source: 'builtin';
      id: AacCardId;
      picture: PictureChoice | null;
      voicePath: string | null;
      hidden: boolean;
    }
  | {
      source: 'custom';
      id: string;
      label: string;
      category: AacCategory;
      photoPath: string | null;
      voicePath: string | null;
      hidden: boolean;
    };

function draftFor(
  card: BoardCard | null,
  board: AacBoard,
  newId: string,
): Draft {
  if (card?.source === 'builtin') {
    const override = board.overrides[card.id];
    return {
      source: 'builtin',
      id: card.id,
      picture: override?.picture ?? null,
      voicePath: card.voicePath,
      hidden: card.hidden,
    };
  }
  if (card?.source === 'custom') {
    return {
      source: 'custom',
      id: card.id,
      label: card.label,
      category: card.category,
      photoPath: card.picture.kind === 'photo' ? card.picture.path : null,
      voicePath: card.voicePath,
      hidden: card.hidden,
    };
  }
  return {
    source: 'custom',
    id: newId,
    label: '',
    category: 'core',
    photoPath: null,
    voicePath: null,
    hidden: false,
  };
}

function applyDraft(board: AacBoard, draft: Draft): AacBoard | null {
  if (draft.source === 'builtin') {
    return setOverride(board, draft.id, {
      hidden: draft.hidden,
      picture: draft.picture,
      voicePath: draft.voicePath,
    });
  }
  const parsed = customCardSchema.safeParse({ ...draft });
  return parsed.success ? upsertCustomCard(board, parsed.data) : null;
}

/** The card as it would look with the draft applied, for the preview. */
function previewCard(draft: Draft): BoardCard | null {
  if (draft.source === 'builtin') {
    const fallback = builtinPictures(draft.id)[0] ?? 'want';
    return {
      source: 'builtin',
      id: draft.id,
      category: AAC_BUILTIN_CARDS[draft.id].category,
      picture: draft.picture ?? { kind: 'builtin', id: fallback },
      voicePath: draft.voicePath,
      hidden: draft.hidden,
    };
  }
  if (!draft.photoPath) return null;
  return {
    source: 'custom',
    id: draft.id,
    label: draft.label.trim(),
    category: draft.category,
    picture: { kind: 'photo', path: draft.photoPath },
    voicePath: draft.voicePath,
    hidden: draft.hidden,
  };
}

/**
 * Edits one card on a child's board: picture, recorded voice and, for the
 * parent's own cards, the word and group. Nothing is stored until Save; new
 * photos and recordings are deleted again if the parent leaves without saving.
 */
export function CardEditor({
  child,
  board,
  cardId,
  save,
}: {
  child: ChildProfile;
  board: AacBoard;
  cardId: string | null;
  save: (board: AacBoard) => Promise<void>;
}) {
  const router = useRouter();
  const { services } = useAppState();
  const card = cardId ? findCard(board, cardId) : null;
  const [draft, setDraft] = useState<Draft>(() =>
    draftFor(card, board, services.newId()),
  );
  const [problem, setProblem] = useState<
    'label' | 'picture' | 'permission' | null
  >(null);
  const created = useRef(new Set<string>());
  const saved = useRef(false);
  const copy = PARENT_COPY.card;

  // Files made in this editor are only kept if the parent saves.
  useEffect(
    () => () => {
      if (saved.current) return;
      for (const path of created.current) services.media.remove(path);
    },
    [services],
  );

  const recorder = useVoiceRecorder((uri) => {
    void services.media.saveRecording(child.id, uri).then((path) => {
      created.current.add(path);
      setDraft((current) => ({ ...current, voicePath: path }));
    });
  });

  async function addPhoto(source: PhotoSource) {
    const result = await services.media.pickPhoto(child.id, source);
    if (result.status === 'denied') setProblem('permission');
    if (result.status !== 'saved') return;
    created.current.add(result.path);
    setProblem(null);
    setDraft((current) =>
      current.source === 'builtin'
        ? { ...current, picture: { kind: 'photo', path: result.path } }
        : { ...current, photoPath: result.path },
    );
  }

  async function commit(next: AacBoard) {
    await save(next);
    saved.current = true;
    const kept = referencedMedia(next);
    for (const path of created.current) {
      if (!kept.has(path)) services.media.remove(path);
    }
    router.back();
  }

  async function onSave() {
    if (draft.source === 'custom') {
      if (!customCardSchema.shape.label.safeParse(draft.label).success) {
        setProblem('label');
        return;
      }
      if (!draft.photoPath) {
        setProblem('picture');
        return;
      }
    }
    const next = applyDraft(board, draft);
    if (next) await commit(next);
  }

  const preview = previewCard(draft);
  const pictures = draft.source === 'builtin' ? builtinPictures(draft.id) : [];

  return (
    <View style={styles.editor}>
      {draft.source === 'builtin' ? (
        <KidsText variant="title" heading>
          {aacCardLabel(draft.id)}
        </KidsText>
      ) : (
        <>
          <View style={styles.group}>
            <KidsText variant="parentBody" heading>
              {copy.label}
            </KidsText>
            <TextInput
              value={draft.label}
              onChangeText={(label) => {
                setProblem(null);
                setDraft({ ...draft, label });
              }}
              maxLength={30}
              accessibilityLabel={copy.label}
              accessibilityHint={copy.labelHint}
              style={[styles.input, problem === 'label' && styles.inputError]}
              testID="card-label"
            />
            <KidsText variant="parentBody" tone="soft">
              {problem === 'label' ? copy.labelError : copy.labelHint}
            </KidsText>
          </View>
          <SegmentedChoice
            label={copy.category}
            options={AAC_CATEGORIES.map((value) => ({
              value,
              label: aacCategoryUtterance(value).text,
            }))}
            value={draft.category}
            onChange={(category) => setDraft({ ...draft, category })}
            testID="card-category"
          />
        </>
      )}

      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.picture}
        </KidsText>
        <View style={styles.preview}>
          {preview ? (
            <CardPicture picture={preview.picture} size={160} />
          ) : (
            <KidsText variant="parentBody" tone="soft">
              {copy.pictureRequired}
            </KidsText>
          )}
        </View>
        {pictures.length > 1 && draft.source === 'builtin' && (
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={copy.picture}
            style={styles.row}
          >
            {pictures.map((picture, index) => {
              const selected =
                draft.picture?.kind === 'builtin'
                  ? draft.picture.id === picture
                  : draft.picture === null && index === 0;
              return (
                <Pressable
                  key={picture}
                  accessibilityRole="radio"
                  accessibilityLabel={aacPictureLabel(picture)}
                  accessibilityState={{ selected, checked: selected }}
                  onPress={() =>
                    setDraft({
                      ...draft,
                      picture:
                        index === 0 ? null : { kind: 'builtin', id: picture },
                    })
                  }
                  style={[styles.option, selected && styles.optionSelected]}
                  testID={`card-picture-${picture}`}
                >
                  <CardPicture
                    picture={{ kind: 'builtin', id: picture }}
                    size={72}
                  />
                  <KidsText variant="parentBody" align="center">
                    {aacPictureLabel(picture)}
                  </KidsText>
                </Pressable>
              );
            })}
          </View>
        )}
        <View style={styles.row}>
          <BigButton
            label={copy.takePhoto}
            variant="secondary"
            audience="parent"
            onPress={() => void addPhoto('camera')}
            testID="card-take-photo"
          />
          <BigButton
            label={copy.choosePhoto}
            variant="secondary"
            audience="parent"
            onPress={() => void addPhoto('library')}
            testID="card-choose-photo"
          />
          {draft.source === 'builtin' && draft.picture?.kind === 'photo' && (
            <BigButton
              label={copy.originalPicture}
              variant="secondary"
              audience="parent"
              onPress={() => setDraft({ ...draft, picture: null })}
              testID="card-original-picture"
            />
          )}
        </View>
        {problem === 'picture' && (
          <KidsText variant="parentBody" testID="card-problem">
            {copy.pictureRequired}
          </KidsText>
        )}
        {problem === 'permission' && (
          <KidsText variant="parentBody" testID="card-problem">
            {copy.permissionDenied}
          </KidsText>
        )}
      </View>

      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.voice}
        </KidsText>
        <KidsText variant="parentBody" tone="soft" testID="card-voice-state">
          {recorder.recording
            ? copy.recording
            : draft.voicePath
              ? copy.parentVoice
              : copy.defaultVoice}
        </KidsText>
        <View style={styles.row}>
          {recorder.recording ? (
            <BigButton
              label={copy.stop}
              audience="parent"
              onPress={() => void recorder.stop()}
              testID="card-stop"
            />
          ) : (
            <BigButton
              label={copy.record}
              variant="secondary"
              audience="parent"
              onPress={() => {
                void recorder.start().then((state) => {
                  if (state === 'denied') setProblem('permission');
                });
              }}
              testID="card-record"
            />
          )}
          {preview && !recorder.recording && (
            <BigButton
              label={copy.listen}
              variant="secondary"
              audience="parent"
              onPress={() =>
                services.speech.sayAll([cardSpeech(preview, services.media)], {
                  dialect: child.dialect,
                  volume: 1,
                  voiceSpeed: child.sensory.voiceSpeed,
                })
              }
              testID="card-listen"
            />
          )}
          {draft.voicePath && !recorder.recording && (
            <BigButton
              label={copy.defaultVoice}
              variant="secondary"
              audience="parent"
              onPress={() => setDraft({ ...draft, voicePath: null })}
              testID="card-default-voice"
            />
          )}
        </View>
      </View>

      <BigButton
        label={copy.save}
        audience="parent"
        disabled={recorder.recording}
        onPress={() => void onSave()}
        testID="card-save"
      />
      <BigButton
        label={copy.cancel}
        variant="secondary"
        audience="parent"
        onPress={() => router.back()}
      />
      {draft.source === 'custom' && card && (
        <BigButton
          label={copy.delete}
          variant="danger"
          audience="parent"
          onPress={() => void commit(removeCustomCard(board, draft.id))}
          testID="card-delete"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  editor: {
    gap: kidsSpacing.lg,
  },
  group: {
    gap: kidsSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.sm,
  },
  preview: {
    alignSelf: 'flex-start',
    minWidth: 176,
    minHeight: 176,
    padding: kidsSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.card,
    backgroundColor: kidsColors.surface,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  option: {
    alignItems: 'center',
    padding: kidsSpacing.sm,
    minWidth: touchTargets.child * 2,
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  optionSelected: {
    borderWidth: 4,
    borderColor: kidsColors.accent,
    backgroundColor: kidsColors.accentSoft,
  },
  input: {
    minHeight: touchTargets.parent,
    borderWidth: 2,
    borderColor: kidsColors.line,
    borderRadius: kidsRadii.control,
    backgroundColor: kidsColors.surface,
    paddingHorizontal: kidsSpacing.md,
    fontSize: 18,
    color: kidsColors.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputError: {
    borderColor: kidsColors.danger,
  },
});
