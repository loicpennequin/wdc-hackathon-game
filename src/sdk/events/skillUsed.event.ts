import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { getEntityById } from '../utils/entity.helpers';
import { getSkillById } from '../utils/skill.helpers';
import { createSpritesheetFrameObject } from '../../utils/sprite-utils';
import type { SkillId } from '../utils/entityData';

export const SKILL_USED = 'skill_used';

export type SkillUsedEvent = {
  type: typeof SKILL_USED;
  payload: { sourceId: EntityId; skillId: SkillId };
};

export const skillUsedEvent = defineEvent({
  create: (sourceId: EntityId, skillId: SkillId): SkillUsedEvent => ({
    type: SKILL_USED,
    payload: { sourceId, skillId }
  }),
  execute: (state, { sourceId, skillId }) => {
    // just here for event logging purpose
    const entity = getEntityById(state, sourceId)!;
    const skill = getSkillById(entity, skillId)!;
    entity.ap -= skill.cost;
    entity.actionsTaken++;

    return state;
  },

  sequence: (state, { payload }, { assets, sprites }) => {
    return new Promise<void>(resolve => {
      const entity = getEntityById(state, payload.sourceId)!;

      // play attack animation
      const sprite = sprites.resolve(payload.sourceId);
      if (!sprite) return resolve();

      const sheet = assets.resolveSprite(entity.blueprint.characterId);

      sprite.textures = createSpritesheetFrameObject('attacking', sheet);
      sprite.gotoAndPlay(0);
      sprite.loop = false;

      sprite.onFrameChange = frame => {
        if (frame > sprite.totalFrames * 0.5) {
          resolve();
          sprite.onFrameChange = undefined;
        }
      };

      sprite.onComplete = () => {
        sprite.textures = createSpritesheetFrameObject('idle', sheet);
        sprite.gotoAndPlay(0);
        sprite.loop = true;
        sprite.onComplete = undefined;
      };
    });
  }
});
