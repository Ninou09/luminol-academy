import { getSkill, type SkillId } from '@luminol/kids-learning';

import { CauseEffectGame } from './CauseEffectGame';
import { CountGame } from './CountGame';
import type { GameProps } from './GameFrame';
import { LetterGame } from './LetterGame';
import { MatchingGame } from './MatchingGame';
import { MemoryGame } from './MemoryGame';
import { PatternGame } from './PatternGame';
import { PuzzleGame } from './PuzzleGame';
import { TraceGame } from './TraceGame';
import { SortingGame } from './SortingGame';

export function GameForSkill({
  skillId,
  ...props
}: GameProps & { skillId: SkillId }) {
  const skill = getSkill(skillId);
  switch (skill.game) {
    case 'matching':
      return <MatchingGame {...props} />;
    case 'sorting':
      return <SortingGame key={skill.id} skill={skill} {...props} />;
    case 'cause-effect':
      return <CauseEffectGame {...props} />;
    case 'pattern':
      return <PatternGame {...props} />;
    case 'memory':
      return <MemoryGame {...props} />;
    case 'puzzle':
      return <PuzzleGame {...props} />;
    case 'letter-match':
    case 'letter-sound':
    case 'letter-forms':
      return <LetterGame key={skill.id} skill={skill} {...props} />;
    case 'trace':
      return <TraceGame {...props} />;
    case 'count':
      return <CountGame {...props} />;
  }
}
