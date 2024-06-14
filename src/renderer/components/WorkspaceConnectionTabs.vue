<template>
   <div class="connection-tabs d-flex flex-column">
      <button
         v-for="connectionItem in getConnected"
         :key="connectionItem"
         :class="selectedWorkspace === connectionItem ? 'active' : ''"
         class="d-flex connection-tab"
         :style="`border-color: ${accentColor(connectionItem)}; opacity: ${selectedWorkspace === connectionItem ? 1 : 0.5};`"
      >
         <span @click="selectWorkspace( connectionItem)">
            <BaseIcon
               :icon-name="camelize( getConnectionOrderByUid(connectionItem)?.icon ?? 'mdiDatabase')"
               :size="12"
               class="mr-1"
            />
            {{ getConnectionName(connectionItem) }}
         </span>
         <BaseIcon
            v-if="selectedWorkspace === connectionItem"
            icon-name="mdiClose"
            :size="16"
            class="inline-block"
            @click="disconnect(connectionItem)"
         />
      </button>
   </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { defineAsyncComponent } from 'vue';

import { useConnectionsStore } from '@/stores/connections';
import { useWorkspacesStore } from '@/stores/workspaces';

const BaseIcon = defineAsyncComponent(() => import(/* webpackChunkName: "BaseIcon" */'@/components/BaseIcon.vue'));

const connectionsStore = useConnectionsStore();
const workspacesStore = useWorkspacesStore();

const { selectWorkspace } = workspacesStore;

const emit = defineEmits(['close-context']);

const { getSelected: selectedWorkspace } = storeToRefs(workspacesStore);

const { removeConnected: disconnectWorkspace } = workspacesStore;

const { getConnected } = storeToRefs(workspacesStore);
const { getConnectionOrderByUid, getConnectionName, getConnectionFolder } = connectionsStore;

const disconnect = (id: string) => {
   disconnectWorkspace(id);
   closeContext();
};

const camelize = (text: string) => {
   const textArr = text.split('-');
   for (let i = 0; i < textArr.length; i++) {
      if (i === 0) continue;
      textArr[i] = textArr[i].charAt(0).toUpperCase() + textArr[i].slice(1);
   }

   return textArr.join('');
};

const closeContext = () => {
   emit('close-context');
};

const accentColor = (id: string) => {
   if (getConnectionFolder(id)?.color)
      return getConnectionFolder(id).color;
   return 'inherit';
};

</script>

 <style scoped lang="scss">
 .connection-tabs
 {
     border-bottom: 1px solid #3f3f3f;
 }
 .connection-tab
 {
    align-items: center;
    &:hover {
    background-color: #222;
    }
     span {padding: .2rem .7rem;
     }border: none;
     border-bottom: 4px solid;
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
     inline-block {
          vertical-align: middle;
          display: inline-block;
     }
    }

 </style>
