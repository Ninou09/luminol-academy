import {
  aacPictureLabel,
  PARENT_COPY,
  ROUTINE_PICTURE_LABELS,
} from '@luminol/kids-content';
import {
  AAC_PICTURES,
  MAX_SEQUENCE_STEPS,
  moveStep,
  removeSequence,
  routinePicturesFor,
  sequenceMedia,
  sequenceSchema,
  sequenceStepSchema,
  STEP_TEXT_MAX_LENGTH,
  upsertSequence,
  type ChildProfile,
  type ChildSequences,
  type SequenceKind,
  type SequenceStep,
  type StepPictureChoice,
} from '@luminol/kids-learning';
import {
  BigButton,
  kidsColors,
  kidsRadii,
  kidsSpacing,
  KidsText,
  touchTargets,
} from '@luminol/kids-ui';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CardPicture } from '../aac/CardPicture';
import type { PhotoSource } from '../media/media';
import { SequencePicture } from '../sequences/SequencePicture';
import { useAppState } from '../state/AppState';
import { useVoiceRecorder } from './useVoiceRecorder';

type StepDraft = {
  id: string;
  text: string;
  picture: StepPictureChoice | null;
  voicePath: string | null;
};

type Problem = 'title' | 'steps' | 'text' | 'picture' | 'permission' | null;

const copy = PARENT_COPY.sequences;
const cardCopy = PARENT_COPY.card;

/**
 * One step being edited: its sentence, a board picture or a photo, and an
 * optional recording in the parent's voice.
 */
function StepFields({
  child,
  draft,
  problem,
  onChange,
  onProblem,
  onCreated,
  onDone,
  onCancel,
}: {
  child: ChildProfile;
  draft: StepDraft;
  problem: Problem;
  onChange: (draft: StepDraft) => void;
  onProblem: (problem: Problem) => void;
  onCreated: (path: string) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { services } = useAppState();
  const latest = useRef(draft);
  latest.current = draft;

  const recorder = useVoiceRecorder((uri) => {
    void services.media.saveRecording(child.id, uri).then((path) => {
      onCreated(path);
      onChange({ ...latest.current, voicePath: path });
    });
  });

  async function addPhoto(source: PhotoSource) {
    const result = await services.media.pickPhoto(child.id, source);
    if (result.status === 'denied') onProblem('permission');
    if (result.status !== 'saved') return;
    onCreated(result.path);
    onProblem(null);
    onChange({
      ...latest.current,
      picture: { kind: 'photo', path: result.path },
    });
  }

  return (
    <View style={styles.stepEditor} testID="step-editor">
      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.text}
        </KidsText>
        <TextInput
          value={draft.text}
          onChangeText={(text) => {
            onProblem(null);
            onChange({ ...draft, text });
          }}
          maxLength={STEP_TEXT_MAX_LENGTH}
          accessibilityLabel={copy.text}
          accessibilityHint={copy.textHint}
          style={[styles.input, problem === 'text' && styles.inputError]}
          testID="step-text"
        />
        <KidsText variant="parentBody" tone="soft">
          {problem === 'text' ? copy.textError : copy.textHint}
        </KidsText>
      </View>

      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {cardCopy.picture}
        </KidsText>
        {draft.picture && (
          <View style={styles.preview}>
            <SequencePicture picture={draft.picture} size={120} />
          </View>
        )}
        <View style={styles.row}>
          <BigButton
            label={cardCopy.takePhoto}
            variant="secondary"
            audience="parent"
            onPress={() => void addPhoto('camera')}
            testID="step-take-photo"
          />
          <BigButton
            label={cardCopy.choosePhoto}
            variant="secondary"
            audience="parent"
            onPress={() => void addPhoto('library')}
            testID="step-choose-photo"
          />
        </View>
        <KidsText variant="parentBody">{copy.boardPicture}</KidsText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={copy.boardPicture}
          style={styles.pictures}
        >
          {AAC_PICTURES.map((picture) => {
            const selected =
              draft.picture?.kind === 'builtin' && draft.picture.id === picture;
            return (
              <Pressable
                key={picture}
                accessibilityRole="radio"
                accessibilityLabel={aacPictureLabel(picture)}
                accessibilityState={{ selected, checked: selected }}
                onPress={() => {
                  onProblem(null);
                  onChange({
                    ...draft,
                    picture: { kind: 'builtin', id: picture },
                  });
                }}
                style={[styles.picture, selected && styles.pictureSelected]}
                testID={`step-picture-${picture}`}
              >
                <CardPicture
                  picture={{ kind: 'builtin', id: picture }}
                  size={52}
                />
              </Pressable>
            );
          })}
        </View>
        <KidsText variant="parentBody">{copy.routinePicture}</KidsText>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={copy.routinePicture}
          style={styles.pictures}
        >
          {routinePicturesFor(child.religiousPack).map((picture) => {
            const selected =
              draft.picture?.kind === 'routine' && draft.picture.id === picture;
            return (
              <Pressable
                key={picture}
                accessibilityRole="radio"
                accessibilityLabel={ROUTINE_PICTURE_LABELS[picture]}
                accessibilityState={{ selected, checked: selected }}
                onPress={() => {
                  onProblem(null);
                  onChange({
                    ...draft,
                    picture: { kind: 'routine', id: picture },
                  });
                }}
                style={[styles.picture, selected && styles.pictureSelected]}
                testID={`step-picture-${picture}`}
              >
                <SequencePicture
                  picture={{ kind: 'routine', id: picture }}
                  size={52}
                />
              </Pressable>
            );
          })}
        </View>
        {problem === 'picture' && (
          <KidsText variant="parentBody" testID="step-problem">
            {copy.pictureRequired}
          </KidsText>
        )}
        {problem === 'permission' && (
          <KidsText variant="parentBody" testID="step-problem">
            {cardCopy.permissionDenied}
          </KidsText>
        )}
      </View>

      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {cardCopy.voice}
        </KidsText>
        <KidsText variant="parentBody" tone="soft" testID="step-voice-state">
          {recorder.recording
            ? cardCopy.recording
            : draft.voicePath
              ? cardCopy.parentVoice
              : cardCopy.defaultVoice}
        </KidsText>
        <View style={styles.row}>
          {recorder.recording ? (
            <BigButton
              label={cardCopy.stop}
              audience="parent"
              onPress={() => void recorder.stop()}
              testID="step-stop"
            />
          ) : (
            <BigButton
              label={cardCopy.record}
              variant="secondary"
              audience="parent"
              onPress={() => {
                void recorder.start().then((state) => {
                  if (state === 'denied') onProblem('permission');
                });
              }}
              testID="step-record"
            />
          )}
          {draft.voicePath && !recorder.recording && (
            <BigButton
              label={cardCopy.defaultVoice}
              variant="secondary"
              audience="parent"
              onPress={() => onChange({ ...draft, voicePath: null })}
              testID="step-default-voice"
            />
          )}
        </View>
      </View>

      <View style={styles.row}>
        <BigButton
          label={copy.stepDone}
          audience="parent"
          disabled={recorder.recording}
          onPress={onDone}
          testID="step-done"
        />
        <BigButton
          label={copy.stepCancel}
          variant="secondary"
          audience="parent"
          disabled={recorder.recording}
          onPress={onCancel}
          testID="step-cancel"
        />
      </View>
    </View>
  );
}

/**
 * Creates or edits one routine or story for a child. Nothing is stored until
 * Save; new photos and recordings are deleted again if the parent leaves
 * without saving.
 */
export function SequenceEditor({
  child,
  sequences,
  sequenceId,
  kind,
  save,
}: {
  child: ChildProfile;
  sequences: ChildSequences;
  /** Null for a new routine or story. */
  sequenceId: string | null;
  kind: SequenceKind;
  save: (sequences: ChildSequences) => Promise<void>;
}) {
  const router = useRouter();
  const { services } = useAppState();
  const existing = sequenceId
    ? sequences.items.find((item) => item.id === sequenceId)
    : undefined;
  const [id] = useState(() => existing?.id ?? services.newId());
  const [title, setTitle] = useState(existing?.title ?? '');
  const [steps, setSteps] = useState<SequenceStep[]>(existing?.steps ?? []);
  const [editing, setEditing] = useState<{
    index: number;
    draft: StepDraft;
  } | null>(null);
  const [problem, setProblem] = useState<Problem>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const created = useRef(new Set<string>());
  const saved = useRef(false);
  const sequenceKind = existing?.kind ?? kind;
  const isStory = sequenceKind === 'story';

  // Files made in this editor are only kept if the parent saves.
  useEffect(
    () => () => {
      if (saved.current) return;
      for (const path of created.current) services.media.remove(path);
    },
    [services],
  );

  function startStep(index: number) {
    const step = steps[index];
    setProblem(null);
    setEditing({
      index,
      draft: step
        ? { ...step }
        : { id: services.newId(), text: '', picture: null, voicePath: null },
    });
  }

  function finishStep() {
    if (!editing) return;
    const parsed = sequenceStepSchema.safeParse(editing.draft);
    if (!parsed.success) {
      const textValid = sequenceStepSchema.shape.text.safeParse(
        editing.draft.text,
      ).success;
      setProblem(textValid ? 'picture' : 'text');
      return;
    }
    const next = [...steps];
    next[editing.index] = parsed.data;
    setSteps(next);
    setEditing(null);
    setProblem(null);
  }

  async function commit(next: ChildSequences) {
    await save(next);
    saved.current = true;
    const kept = sequenceMedia(next);
    for (const path of created.current) {
      if (!kept.has(path)) services.media.remove(path);
    }
    router.back();
  }

  async function onSave() {
    if (!sequenceSchema.shape.title.safeParse(title).success) {
      setProblem('title');
      return;
    }
    const parsed = sequenceSchema.safeParse({
      id,
      kind: sequenceKind,
      title,
      steps,
    });
    if (editing || !parsed.success) {
      setProblem('steps');
      return;
    }
    await commit(upsertSequence(sequences, parsed.data));
  }

  return (
    <View style={styles.editor}>
      <View style={styles.group}>
        <KidsText variant="parentBody" heading>
          {copy.name}
        </KidsText>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setProblem(null);
            setTitle(value);
          }}
          maxLength={30}
          accessibilityLabel={copy.name}
          accessibilityHint={copy.nameHint}
          style={[styles.input, problem === 'title' && styles.inputError]}
          testID="sequence-title"
        />
        <KidsText variant="parentBody" tone="soft">
          {problem === 'title' ? copy.nameError : copy.nameHint}
        </KidsText>
      </View>

      <View style={styles.group}>
        <KidsText variant="title" heading>
          {isStory ? copy.storyPages : copy.routineSteps}
        </KidsText>
        {steps.map((step, index) =>
          editing?.index === index ? null : (
            <View key={step.id} style={styles.stepRow}>
              <SequencePicture picture={step.picture} size={56} />
              <View style={styles.stepText}>
                <KidsText variant="parentBody" tone="soft">
                  {`${copy.stepLabel} ${index + 1}`}
                </KidsText>
                <KidsText testID={`step-row-${index}`}>{step.text}</KidsText>
              </View>
              <View style={styles.row}>
                <BigButton
                  label={copy.moveUp}
                  variant="secondary"
                  audience="parent"
                  accessibilityHint={step.text}
                  disabled={index === 0 || editing !== null}
                  onPress={() => setSteps(moveStep(steps, index, -1))}
                  testID={`step-up-${index}`}
                />
                <BigButton
                  label={copy.moveDown}
                  variant="secondary"
                  audience="parent"
                  accessibilityHint={step.text}
                  disabled={index === steps.length - 1 || editing !== null}
                  onPress={() => setSteps(moveStep(steps, index, 1))}
                  testID={`step-down-${index}`}
                />
                <BigButton
                  label={PARENT_COPY.board.edit}
                  variant="secondary"
                  audience="parent"
                  accessibilityHint={step.text}
                  disabled={editing !== null}
                  onPress={() => startStep(index)}
                  testID={`step-edit-${index}`}
                />
                <BigButton
                  label={copy.remove}
                  variant="secondary"
                  audience="parent"
                  accessibilityHint={step.text}
                  disabled={editing !== null}
                  onPress={() =>
                    setSteps(steps.filter((_, other) => other !== index))
                  }
                  testID={`step-remove-${index}`}
                />
              </View>
            </View>
          ),
        )}
        {editing ? (
          <StepFields
            child={child}
            draft={editing.draft}
            problem={problem}
            onChange={(draft) =>
              setEditing((current) => current && { ...current, draft })
            }
            onProblem={setProblem}
            onCreated={(path) => created.current.add(path)}
            onDone={finishStep}
            onCancel={() => {
              setEditing(null);
              setProblem(null);
            }}
          />
        ) : (
          steps.length < MAX_SEQUENCE_STEPS && (
            <BigButton
              label={isStory ? copy.addPage : copy.addStep}
              variant="secondary"
              audience="parent"
              onPress={() => startStep(steps.length)}
              testID="step-add"
            />
          )
        )}
        {problem === 'steps' && (
          <KidsText variant="parentBody" testID="sequence-problem">
            {copy.stepsError}
          </KidsText>
        )}
      </View>

      <BigButton
        label={copy.save}
        audience="parent"
        onPress={() => void onSave()}
        testID="sequence-save"
      />
      <BigButton
        label={copy.cancel}
        variant="secondary"
        audience="parent"
        onPress={() => router.back()}
      />
      {existing &&
        (confirmingDelete ? (
          <View style={styles.confirm}>
            <KidsText variant="parentBody">{copy.deleteConfirm}</KidsText>
            <BigButton
              label={copy.deleteConfirmAction}
              variant="danger"
              audience="parent"
              onPress={() => void commit(removeSequence(sequences, id))}
              testID="sequence-delete-confirm"
            />
            <BigButton
              label={copy.cancel}
              variant="secondary"
              audience="parent"
              onPress={() => setConfirmingDelete(false)}
            />
          </View>
        ) : (
          <BigButton
            label={copy.delete}
            variant="secondary"
            audience="parent"
            onPress={() => setConfirmingDelete(true)}
            testID="sequence-delete"
          />
        ))}
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
  stepRow: {
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
  stepText: {
    flex: 1,
    minWidth: 160,
  },
  stepEditor: {
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.accent,
    backgroundColor: kidsColors.surface,
  },
  preview: {
    alignSelf: 'flex-start',
    padding: kidsSpacing.sm,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.line,
  },
  pictures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: kidsSpacing.xs,
  },
  picture: {
    width: touchTargets.child,
    height: touchTargets.child,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: kidsRadii.control,
    borderWidth: 2,
    borderColor: kidsColors.line,
    backgroundColor: kidsColors.surface,
  },
  pictureSelected: {
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
  confirm: {
    gap: kidsSpacing.md,
    padding: kidsSpacing.md,
    borderRadius: kidsRadii.card,
    borderWidth: 2,
    borderColor: kidsColors.danger,
    backgroundColor: kidsColors.surface,
  },
});
