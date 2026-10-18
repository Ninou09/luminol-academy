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
import SessionScreen from '../../app/session';
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
  'parent/_layout': ParentLayout,
  'parent/index': ParentHomeScreen,
  'parent/new': NewProfileScreen,
  'parent/[childId]': EditProfileScreen,
  'parent/board/[childId]/index': BoardEditorScreen,
  'parent/board/[childId]/new': NewCardScreen,
  'parent/board/[childId]/[cardId]': EditCardScreen,
};
