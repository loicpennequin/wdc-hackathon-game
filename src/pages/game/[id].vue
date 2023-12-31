<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel';
import { parse } from 'zipson';
import { api } from '../../api';
import type { Action, GameDetail } from '../../composables/game/useGame';

definePage({
  name: 'Game',
  meta: {
    layout: 'fullscreen'
  }
});

const route = useRoute('Game');
const { push } = useRouter();

const game = useQuery(api.games.getById, () => [
  { gameId: route.params.id as Id<'games'> }
]);
const latestEvents = useQuery(api.games.latestEventBatch, () => [
  { gameId: route.params.id as Id<'games'> }
]);
const { mutate: cancel, isLoading: isCancelling } = useMutation(api.games.cancel);

watchEffect(() => {
  if (game.value === null) {
    push({ name: 'Home' });
  }
});

const root = ref<HTMLElement>();
const { width, height } = useElementBounding(root);

const { mutate: sendAction } = useMutation(api.games.actOn);
const onAction = (action: Action) => {
  if (!game.value) return;

  sendAction({
    gameId: game.value?._id,
    action
  });
};

const { mutate: surrender } = useMutation(api.games.surrender);

// syntax highlighting doesn't like type assertions in template
const gameInfo = computed(() => {
  if (!game.value) return null;
  if (!game.value.serializedState) return null;

  return {
    ...game.value,
    serializedState: parse(game.value.serializedState),
    latestEvents: latestEvents.value?.events
  } as GameDetail;
});
</script>

<template>
  <main ref="root">
    <Query v-slot="{ data: me }" :query="api => api.users.me" :args="{}">
      <div v-if="game === undefined" class="loader">
        <UiSpinner size="xl" />
        Loading game...
      </div>

      <div v-else-if="game?.state === 'WAITING_FOR_OPPONENT'" class="loader">
        <UiSpinner size="xl" />

        Waiting for opponent...
        <UiButton
          :theme="{ bg: 'red-6', hoverBg: 'red-7' }"
          left-icon="mdi:close"
          :is-loading="isCancelling"
          @click="cancel({ gameId: game._id })"
        >
          Cancel
        </UiButton>
      </div>

      <div v-else-if="game?.state === 'WAITING_FOR_CREATOR_CONFIRMATION'" class="loader">
        <UiSpinner size="xl" />

        Waiting for opponent confirmation...
      </div>

      <div
        v-else-if="game?.state === 'DECLINED_BY_CREATOR'"
        class="grid place-content-center"
      >
        You declined the challenge or did not respond in time.
      </div>

      <template v-else-if="game?.state === 'ONGOING' || game?.state === 'ENDED'">
        <GameClient
          v-if="width && height && me && gameInfo?.latestEvents"
          :me="me?._id"
          :game="gameInfo"
          :width="width"
          :height="height"
          @action="onAction($event)"
          @surrender="surrender({ gameId: game._id })"
        />

        <UiModal id="Game-result" :is-opened="game.state == 'ENDED'" :is-closable="false">
          <UiModalContent>
            <h2 class="text-center">
              {{ game.winnerId === me?._id ? 'You won !' : 'You lost' }}
            </h2>

            <RouterLink v-slot="{ navigate, href }" custom :to="{ name: 'Home' }">
              <UiLinkButton :href="href" @click="navigate">Back to lobby</UiLinkButton>
            </RouterLink>
          </UiModalContent>
        </UiModal>
      </template>
    </Query>
  </main>
</template>

<style scoped>
.loader {
  display: flex;
  flex-direction: column;
  gap: var(--size-7);
  align-items: center;
  justify-content: center;

  height: 100%;

  font-size: var(--font-size-4);
}
</style>
