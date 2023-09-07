<template>
   <div class="connection-tabs d-flex flex-column">
      <button
         v-for="connectionItem in getConnected"
         :key="connectionItem"
         :class="selectedWorkspace === connectionItem ? 'active' : ''"
         class="d-flex connection-tab"
      >
         <span @click="selectWorkspace( connectionItem)">
            {{ getConnectionName(connectionItem) }}
         </span>
         <BaseIcon
            v-if="selectedWorkspace === connectionItem"
            icon="mdi-close"
            :size="16"
         />
      </button>
      <button
         v-if="selectedWorkspace!=='NEW'"
         class="d-flex connection-tab"
      >
         Add connection
      </button>
   </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import BaseIcon from './BaseIcon.vue';
import { useConnectionsStore } from '@/stores/connections';
import { useWorkspacesStore } from '@/stores/workspaces';

const connectionsStore = useConnectionsStore();
const workspacesStore = useWorkspacesStore();
const { selectWorkspace } = workspacesStore;

const { getSelected: selectedWorkspace } = storeToRefs(workspacesStore);

const { getConnected } = storeToRefs(workspacesStore);
const { getConnectionName } = connectionsStore;

</script>

<style scoped lang="scss">
.connection-tabs
{
    border-bottom: 1px solid #3f3f3f;
}
.connection-tab
{
   &:hover {
   background-color: #222;
   }
    span {padding: .2rem .7rem;
    }border: none;
    border-left: 1px solid #3f3f3f;
    background-color: #000;
color : #fff;
    font-size: .8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
    &:first-child {
        border-left: none;
    }
    &.active {
        background-color: #333;
    }
}

</style>
