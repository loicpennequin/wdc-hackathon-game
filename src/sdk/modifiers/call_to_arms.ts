import type { ModifierData } from '../modifier';

export const callToArms: ModifierData = {
  id: 'callToArms',
  name: 'Call to Arms',
  description: 'This unit has +3 initiative',
  duration: 3,
  execute(state, entity) {
    entity.initiative += 3;
  },
  cleanup(state, entity) {
    entity.initiative -= 3;
  }
};
