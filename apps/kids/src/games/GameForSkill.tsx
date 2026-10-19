import { getSkill, type SkillId } from '@luminol/kids-learning';

import { CauseEffectGame } from './CauseEffectGame';
import type { GameProps } from './GameFrame';
import { MatchingGame } from './MatchingGame';
import { MemoryGame } from './MemoryGame';
import { PatternGame } from './PatternGame';
import { PuzzleGame } from './PuzzleGame';
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
  }
}
