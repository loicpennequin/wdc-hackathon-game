<script setup lang="ts">
const { selectedEntity, surrender } = useGame();
</script>

<template>
  <PlayersInfos />
  <AtbTimeline />

  <Transition>
    <EntityCard v-if="selectedEntity" :entity="selectedEntity" class="selected-entity" />
  </Transition>

  <GameActionBar class="game-action-bar" />
  <GameChat />

  <UiIconButton
    icon="ic:sharp-emoji-flags"
    :theme="{ size: 'font-size-5' }"
    title="Surrender"
    class="surrender-button"
    @click="surrender"
  />
</template>

<style scoped>
.selected-entity {
  position: absolute;
  top: 14rem;
  left: var(--size-5);

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateX(-50%);
    opacity: 0;
  }
}
</style>
