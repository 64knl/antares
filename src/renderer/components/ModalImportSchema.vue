<template>
   <Teleport to="#window-content">
      <div class="modal active">
         <a class="modal-overlay" @click.stop="closeModal" />
         <div class="modal-container p-0">
            <div class="modal-header pl-2">
               <div class="modal-title h6">
                  <div class="d-flex">
                     <BaseIcon
                        icon-name="mdiDatabaseImport"
                        class="mr-1"
                        :size="24"
                     />
                     <span class="cut-text">{{ t('database.importSchema') }}</span>
                  </div>
               </div>
               <a class="btn btn-clear c-hand" @click.stop="closeModal" />
            </div>
            <div class="modal-body pb-0">
               {{ sqlFile }}
               <div v-if="queryErrors.length > 0" class="mt-2">
                  <label>{{ t('database.importQueryErrors', queryErrors.length) }}</label>
                  <textarea
                     v-model="formattedQueryErrors"
                     class="form-input"
                     rows="5"
                     readonly
                  />
               </div>
            </div>
            <div class="modal-footer columns">
               <div class="column col modal-progress-wrapper text-left">
                  <div class="import-progress">
                     <span class="progress-status">
                        {{ progressPercentage }}% - {{ progressStatus }} - {{ t('database.executedQueries', queryCount) }}
                     </span>
                     <progress
                        class="progress d-block"
                        :value="progressPercentage"
                        max="100"
                     />
                  </div>
               </div>
               <div class="column col-auto px-0">
                  <button class="btn btn-link" @click.stop="closeModal">
                     {{ completed ? t('general.close') : t('general.cancel') }}
                  </button>
               </div>
            </div>
         </div>
      </div>
      <Teleport to="#window-content" />
   </teleport>
</template>

<script setup lang="ts">
import { ImportState } from 'common/interfaces/importer';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import * as moment from 'moment';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/BaseIcon.vue';
import Schema from '@/ipc-api/Schema';
import { useConsoleStore } from '@/stores/console';
import { useNotificationsStore } from '@/stores/notifications';
import { useWorkspacesStore } from '@/stores/workspaces';

const { t } = useI18n();

const { addNotification } = useNotificationsStore();
const workspacesStore = useWorkspacesStore();

const { getSelected: selectedWorkspace } = storeToRefs(workspacesStore);

const { getWorkspace, refreshSchema } = workspacesStore;

const props = defineProps({
   selectedSchema: String
});

const emit = defineEmits(['close']);

const sqlFile = ref('');
const isImporting = ref(false);
const progressPercentage = ref(0);
const queryCount = ref(0);
const completed = ref(false);
const progressStatus = ref('Reading');
const queryErrors: Ref<{time: string; message: string}[]> = ref([]);

const currentWorkspace = computed(() => getWorkspace(selectedWorkspace.value));

const formattedQueryErrors = computed(() => {
   return queryErrors.value.map(err =>
      `Time: ${moment(err.time).format('HH:mm:ss.S')} (${err.time})\nError: ${err.message}`
   ).join('\n\n');
});

const startImport = async (file: string) => {
   isImporting.value = true;
   sqlFile.value = file;

   const { uid, client } = currentWorkspace.value;
   const params = {
      uid,
      type: client,
      schema: props.selectedSchema,
      file: sqlFile.value
   };

   try {
      completed.value = false;
      const { status, response } = await Schema.import(params);

      if (status === 'success')
         progressStatus.value = response.cancelled ? t('general.aborted') : t('general.completed');
      else {
         progressStatus.value = response;
         addNotification({ status: 'error', message: response });
         useConsoleStore().putLog('debug', {
            level: 'error',
            process: 'worker',
            message: response,
            date: new Date()
         });
      }
      refreshSchema({ uid, schema: props.selectedSchema });
      completed.value = true;
   }
   catch (err) {
      addNotification({ status: 'error', message: err.stack });
      useConsoleStore().putLog('debug', {
         level: 'error',
         process: 'worker',
         message: err.stack,
         date: new Date()
      });
   }

   isImporting.value = false;
};

const updateProgress = (event: IpcRendererEvent, state: ImportState) => {
   progressPercentage.value = parseFloat(Number(state.percentage).toFixed(1));
   queryCount.value = Number(state.queryCount);
};

const handleQueryError = (event: IpcRendererEvent, err: { time: string; message: string }) => {
   queryErrors.value.push(err);
};

const closeModal = async () => {
   let willClose = true;
   if (isImporting.value) {
      willClose = false;
      const { response } = await Schema.abortImport();
      willClose = response.willAbort;
   }

   if (willClose)
      emit('close');
};

const onKey = (e: KeyboardEvent) => {
   e.stopPropagation();
   if (e.key === 'Escape')
      closeModal();
};

window.addEventListener('keydown', onKey);

ipcRenderer.on('import-progress', updateProgress);
ipcRenderer.on('query-error', handleQueryError);

onBeforeUnmount(() => {
   window.removeEventListener('keydown', onKey);
   ipcRenderer.off('import-progress', updateProgress);
   ipcRenderer.off('query-error', handleQueryError);
});

defineExpose({ startImport });
</script>

<style lang="scss" scoped>
.modal {
  .modal-container {
    max-width: 800px;
  }

  .modal-body {
    max-height: 60vh;
    display: flex;
    flex-direction: column;
  }

  .modal-footer {
    display: flex;
  }
}

.progress-status {
  font-style: italic;
  font-size: 80%;
}
</style>
