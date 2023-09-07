import { type AnyZodObject, z } from 'zod';
import { addEntity, type CharacterId, type Entity, type PlayerId } from './entity';
import { createGameMap, type GameMap } from './map';

export type GameState = {
  nextEntityId: number;
  map: GameMap;
  entities: Entity[];
};

type CreateGamOptionsPlayer = {
  id: PlayerId;
  characterId: CharacterId;
};
export type CreateGameOptions = {
  players: [CreateGamOptionsPlayer, CreateGamOptionsPlayer];
};

export const createGameState = (opts: CreateGameOptions): GameState => {
  const state: GameState = {
    nextEntityId: 0,
    map: createGameMap(MAP_SIZE, MAP_SIZE),
    entities: []
  };

  opts.players.forEach((player, i) => {
    addEntity(state, {
      kind: 'general',
      characterId: player.characterId,
      owner: player.id,
      position: { x: Math.floor(MAP_SIZE / 2), y: i === 0 ? 2 : MAP_SIZE - 2 }
    });
  });

  return state;
};
