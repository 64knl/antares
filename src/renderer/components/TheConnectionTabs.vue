<template>
   <div class="connection-tabs d-flex flex-column">
      <button
         v-for="connectionItem in getConnected"
         :key="connectionItem"
         class="d-flex connection-tab"
      >
         {{ getConnectionName(connectionItem) }}
      </button>
   </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useApplicationStore } from '@/stores/application';
import { useConnectionsStore, SidebarElement } from '@/stores/connections';
import { useWorkspacesStore } from '@/stores/workspaces';
import { useElementBounding } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
localStorage.setItem('opened-folders', '[]');

const applicationStore = useApplicationStore();
const connectionsStore = useConnectionsStore();
const workspacesStore = useWorkspacesStore();

const { isExpandedSettingBar } = storeToRefs(applicationStore);
const { getConnected } = storeToRefs(workspacesStore);
const { connectionsOrder } = storeToRefs(connectionsStore);
const { updateConnectionsOrder, initConnectionsOrder, getConnectionName } = connectionsStore;

const sidebarConnections: Ref<HTMLDivElement> = ref(null);

</script>

<style scoped lang="scss">
.connection-tabs
{
    width: calc(100% - 3.5rem);
}
.connection-tab
{
    padding: .1rem .7rem;
    border-left: 1px solid #c00;
    font-size: .6rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
    &:first-child {
        border-left: none;
    }
}

</style>
