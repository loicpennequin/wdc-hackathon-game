import { z } from 'zod';
import { defineAction } from '.';
import { createPlayerAbility } from '../abilities/player.ability';
import { endTurnEvent } from '../events/endTurn.event';

export const endTurnActionInput = z.object({
  playerId: z.string()
});

export type EndTurnActionInput = z.infer<typeof endTurnActionInput>;

export const createEndTurnAction = defineAction({
  input: endTurnActionInput,
  handler: ({ input, state }) => {
    const playerAbility = createPlayerAbility(state, input.playerId);

    if (playerAbility.cannot('end_turn', 'turn')) return [];

    state.reducer(state, endTurnEvent.create(state.activeEntityId));
  }
});
