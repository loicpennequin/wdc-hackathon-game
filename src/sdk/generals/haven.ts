import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt, isAlly } from '../utils/entity.helpers';
import { aurasLookup } from '../auras';
import { soldiersLookup } from '../soldiers';
import { addModifier } from '../modifier';
import { modifiersLookup } from '../modifiers';

export const havenGeneral01: GeneralData = {
  characterId: 'havenGeneral01',
  iconUrl: '/icons/haven_general_01.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 10,
  maxHp: 15,
  maxAp: 5,
  attack: 3,
  defense: 1,
  speed: 3,
  apRegenRate: 1,
  summonBlueprints: [soldiersLookup.havenSwordsman, soldiersLookup.havenArcher],
  auras: [aurasLookup.divineInspiration],
  triggers: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 0,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      areaType: AREA_TYPE.RADIUS,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    },
    {
      id: 'call_to_arms',
      iconUrl: '/icons/call_to_arms.png',
      name: 'Call to arms',
      description: 'Increase all allies initiative for 3 turns',
      cost: 3,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ANYWHERE,
      areaType: AREA_TYPE.RADIUS,
      execute({ state, caster }) {
        state.entities.forEach(entity => {
          if (isAlly(caster.owner, entity)) {
            addModifier(state, caster, entity, modifiersLookup.callToArms);
          }
        });
      }
    }
  ]
};
