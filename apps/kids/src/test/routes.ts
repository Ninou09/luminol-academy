import ActivityScreen from '../../app/activity';
import CalmScreen from '../../app/calm';
import GateScreen from '../../app/gate';
import ChooserScreen from '../../app/index';
import RootLayout from '../../app/_layout';
import EditProfileScreen from '../../app/parent/[childId]';
import EditCardScreen from '../../app/parent/board/[childId]/[cardId]';
import BoardEditorScreen from '../../app/parent/board/[childId]/index';
import NewCardScreen from '../../app/parent/board/[childId]/new';
import ParentHomeScreen from '../../app/parent/index';
import ParentLayout from '../../app/parent/_layout';
import NewProfileScreen from '../../app/parent/new';
import PrivacyScreen from '../../app/parent/privacy';
import ProgressScreen from '../../app/parent/progress/[childId]';
import EditSequenceScreen from '../../app/parent/sequences/[childId]/[sequenceId]';
import SequencesScreen from '../../app/parent/sequences/[childId]/index';
import NewSequenceScreen from '../../app/parent/sequences/[childId]/new';
import RoutineScreen from '../../app/routine/[routineId]';
import SessionScreen from '../../app/session';
import StoriesScreen from '../../app/stories';
import StoryScreen from '../../app/story/[storyId]';
import TalkScreen from '../../app/talk';

/** The real route files, for expo-router's test renderer. */
export const APP_ROUTES = {
  _layout: RootLayout,
  index: ChooserScreen,
  gate: GateScreen,
  session: SessionScreen,
  activity: ActivityScreen,
  talk: TalkScreen,
  calm: CalmScreen,
  stories: StoriesScreen,
  'story/[storyId]': StoryScreen,
  'routine/[routineId]': RoutineScreen,
  'parent/_layout': ParentLayout,
  'parent/index': ParentHomeScreen,
  'parent/new': NewProfileScreen,
  'parent/privacy': PrivacyScreen,
  'parent/[childId]': EditProfileScreen,
  'parent/board/[childId]/index': BoardEditorScreen,
  'parent/board/[childId]/new': NewCardScreen,
  'parent/board/[childId]/[cardId]': EditCardScreen,
  'parent/progress/[childId]': ProgressScreen,
  'parent/sequences/[childId]/index': SequencesScreen,
  'parent/sequences/[childId]/new': NewSequenceScreen,
  'parent/sequences/[childId]/[sequenceId]': EditSequenceScreen,
};
