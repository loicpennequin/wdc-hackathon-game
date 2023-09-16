import type { SoldierData } from '.';
import { dealDamageEvent } from '../../game-logic/events/dealDamage.event';
import { entityDiedEvent } from '../../game-logic/events/entityDied.event';
import { getEntityAt } from '../../game-logic/utils/entity.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../entity';
import { FACTIONS_IDS } from '../enums';

export const necroSoldiers: SoldierData[] = [
  {
    characterId: 'skeleton',
    spriteId: 'necroSkeleton',
    iconUrl: '/icons/necro_skeleton.gif',
    factionId: FACTIONS_IDS.NECRO,
    name: 'Skeleton',
    cost: 2,
    initiative: 5,
    maxHp: 6,
    attack: 2,
    defense: 1,
    skills: [
      {
        id: 'melee_attack',
        iconUrl: '/icons/melee_attack.png',
        name: 'Melee attack',
        cost: 2,
        minRange: 0,
        range: 1,
        targetZone: TARGET_ZONES.RADIUS,
        targetType: TARGET_TYPES.ENEMY,
        execute(reducer, state, caster, target) {
          const entity = getEntityAt(state, target);
          if (!entity) return [];
          reducer(
            state,
            dealDamageEvent.create(
              state.activeEntityId,
              entity.id,
              Math.max(1, 1 + caster.blueprint.attack - entity.blueprint.defense)
            )
          );
          if (entity.hp <= 0) {
            reducer(state, entityDiedEvent.create(caster.id, entity.id));
          }
        }
      }
    ]
  }
];
