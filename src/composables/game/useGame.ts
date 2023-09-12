import type { WritableComputedRef, ComputedRef, Ref } from 'vue';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { type GameState, createGameState } from '../../game-logic';
import type { GameEvent } from '../../game-logic/events/reducer';
import type { EndTurnActionInput } from '../../game-logic/actions/endTurn';
import type { MoveActionInput } from '../../game-logic/actions/move';
import type { SkillActionInput } from '../../game-logic/actions/skill';
import type { SummonActionInput } from '../../game-logic/actions/summon';
import type { SoldierData } from '../../resources/soldiers';
import type { Nullable } from '../../utils/types';
import type { SkillData } from '../../resources/skills';
import type { Entity } from '../../game-logic/entity';
import { getActiveEntity } from '../../game-logic/utils/entity.helpers';
import { createPathFinder } from '../../game-logic/utils/pathfinding.helpers';
import type { AStarFinder } from 'astar-typescript';
import type { GameMapCell } from '../../game-logic/map';
import { createPlayerAbility } from '../../game-logic/abilities/player.ability';
import { subject } from '@casl/ability';
import { createSkillAbility } from '../../game-logic/abilities/skill.ability';

type GameDetail = Omit<Doc<'games'>, 'creator'> & { events: Doc<'gameEvents'>[] } & {
  players: Doc<'gamePlayers'>[];
};

export type Action =
  | { type: 'move'; payload: Omit<MoveActionInput, 'playerId'> }
  | { type: 'summon'; payload: Omit<SummonActionInput, 'playerId'> }
  | { type: 'use_skill'; payload: Omit<SkillActionInput, 'playerId'> }
  | { type: 'end_turn'; payload: Omit<EndTurnActionInput, 'playerId'> };

export type ActionDispatcher = (arg: Action) => void;

export type Game = {
  me: Id<'users'>;
  game: ComputedRef<GameDetail>;
  state: ComputedRef<GameState>;
  sendAction: ActionDispatcher;
  activeEntity: ComputedRef<Entity>;
  selectedSummon: WritableComputedRef<Nullable<SoldierData>>;
  selectedSkill: WritableComputedRef<Nullable<SkillData>>;
  selectedEntity: Ref<Entity>;
  isMyTurn: ComputedRef<boolean>;
  pathfinder: ComputedRef<AStarFinder>;
  move: (cell: GameMapCell) => void;
  summon: (cell: GameMapCell) => void;
  useSkill: (cell: GameMapCell) => void;
  endTurn: (cell: GameMapCell) => void;
};

export const GAME_INJECTION_KEY = Symbol('game') as InjectionKey<Game>;

export const useGameProvider = (
  game: ComputedRef<GameDetail>,
  sendAction: ActionDispatcher,
  me: Id<'users'>
) => {
  const state = computed(() =>
    createGameState({
      players: [
        {
          id: game.value.players[0].userId,
          characterId: game.value.players[0].generalId,
          atbSeed: game.value.players[0].atbSeed
        },
        {
          id: game.value.players[1].userId,
          characterId: game.value.players[1].generalId,
          atbSeed: game.value.players[1].atbSeed
        }
      ],
      history: game.value.events.map(
        e => ({ type: e.type, payload: e.payload }) as GameEvent
      )
    })
  );

  const activeEntity = computed(() => getActiveEntity(state.value));

  const selectedSummon = ref<Nullable<SoldierData>>();
  const selectedSkill = ref<Nullable<SkillData>>();
  const selectedEntity = ref<Entity>(getActiveEntity(state.value));

  watchEffect(() => {
    selectedEntity.value = getActiveEntity(state.value);
  });

  const selectSummon = (summon: SoldierData) => {
    selectedSummon.value = summon;
    selectedSkill.value = null;
  };

  const selectSkill = (skill: SkillData) => {
    selectedSkill.value = skill;
    selectedSummon.value = null;
  };

  const isMyTurn = computed(() => activeEntity.value.owner === me);

  const pathfinder = computed(() =>
    createPathFinder(state.value, state.value.activeEntityId)
  );

  const canSummonAt = (cell: GameMapCell) => {
    const ability = createPlayerAbility(state.value, activeEntity.value.owner);
    return ability.can('summon_at', subject('position', cell));
  };

  const canMoveTo = (cell: GameMapCell) => {
    const path = pathfinder.value.findPath(activeEntity.value.position, cell);

    return path.length > 0 && path.length <= activeEntity.value.ap;
  };

  const canCastAt = (cell: GameMapCell) => {
    if (!selectedSkill.value) return;

    const ability = createSkillAbility(
      state.value,
      selectedSkill.value,
      activeEntity.value
    );
    return ability.can('target', subject('cell', { x: cell.x, y: cell.y }));
  };

  const move = (cell: GameMapCell) => {
    if (!isMyTurn.value) return;
    if (!canMoveTo(cell)) return;

    sendAction({
      type: 'move',
      payload: { target: cell }
    });
  };

  const summon = (cell: GameMapCell) => {
    if (!isMyTurn.value) return;
    if (!canSummonAt(cell)) {
      selectedSummon.value = null;
    }
    if (!selectedSummon.value) return;

    sendAction({
      type: 'summon',
      payload: {
        characterId: selectedSummon.value.characterId,
        position: { x: cell.x, y: cell.y }
      }
    });
    selectedSummon.value = null;
  };

  const useSkill = (cell: GameMapCell) => {
    if (!isMyTurn.value) return;
    if (!canCastAt(cell)) {
      selectedSkill.value = null;
    }
    if (!selectedSkill.value) return;

    sendAction({
      type: 'use_skill',
      payload: {
        skillId: selectedSkill.value.id,
        target: { x: cell.x, y: cell.y }
      }
    });
    selectedSkill.value = null;
  };

  const endTurn = () => {
    if (!isMyTurn.value) return;
    sendAction({
      type: 'end_turn',
      payload: {}
    });
  };

  const api: Game = {
    state,
    game,
    pathfinder,
    me,
    isMyTurn,
    sendAction,
    activeEntity,
    selectedEntity,
    move,
    summon,
    useSkill,
    endTurn,
    selectedSummon: computed({
      get() {
        return selectedSummon.value;
      },
      set(val) {
        if (!val) return;
        selectSummon(val);
      }
    }),
    selectedSkill: computed({
      get() {
        return selectedSkill.value;
      },
      set(val) {
        console.log(val);
        if (!val) return;
        selectSkill(val);
      }
    })
  };

  provide(GAME_INJECTION_KEY, api);

  return api;
};

export const useGame = () => useSafeInject(GAME_INJECTION_KEY);
