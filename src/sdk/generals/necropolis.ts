import type { GeneralData } from '.';
import { dealSingleTargetDamage, healSingleTarget } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEnemyGeneral, getEntityAt } from '../utils/entity.helpers';
import { ENTITY_DIED } from '../events/entityDied.event';
import { necroSkeleton } from '../soldiers/necro_skeleton';
import { necroVampire } from '../soldiers/necro_vampire';

export const necroGeneral: GeneralData = {
  characterId: 'necro_general_01',
  spriteId: 'necroGeneral01',
  iconUrl: '/icons/necro_general_01.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 10,
  maxHp: 20,
  maxAp: 4,
  attack: 3,
  defense: 1,
  summonBlueprints: [necroSkeleton, necroVampire],
  triggers: [
    {
      on: ENTITY_DIED,
      name: 'Soul feast',
      description: 'Whenever a unit dies, recover 1 HP',
      duration: Infinity,
      execute({ state, reducer, from }) {
        healSingleTarget(state, reducer, { from: from.id, to: from.id, baseAmount: 1 });
      }
    }
  ],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 1,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    }
  ],
  auras: []
};
