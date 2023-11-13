<template>
   <div
      id="settingbar"
      :class="{expanded: isExpandedSettingBar}"
   >
      <div v-if="isExpandedSettingBar" class="settingbar-search">
         <div class="input-group has-icon-right">
            <input
               id="searchConnections"
               ref="searchInput"
               v-model="searchQuery"
               class="form-input input-sm"
               type="text"
               :placeholder="t('message.searchConnections')"
            >
            <i v-if="!searchQuery" class="form-icon mdi mdi-magnify mdi-18px" />
            <i
               v-else
               class="form-icon c-hand mdi mdi-backspace mdi-18px pr-1"
               @click="searchQuery = ''"
            />
         </div>
      </div>
      <div ref="sidebarConnections" class="settingbar-top-elements">
         <SettingBarContext
            v-if="isContext"
            :context-event="contextEvent"
            :context-connection="contextConnection"
            @close-context="isContext = false"
         />
         <ul class="settingbar-elements">
            <SettingBarConnections
               v-model="connectionsArr"
               :search-query="searchQuery"
               @context="contextMenu"
            />
         </ul>
      </div>

      <div class="settingbar-middle-elements">
         <ul class="settingbar-elements">
            <li
               v-if="isScrollable"
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('connection.allConnections')
               }"
               class="settingbar-element btn btn-link"
               @click="emit('show-connections-modal')"
            >
               <div class="settingbar-element-icon-wrapper">
                  <BaseIcon
                     icon-name="mdiDotsHorizontal"
                     class="settingbar-element-icon text-light"
                     :size="24"
                  />
               </div>
            </li>
            <li
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('connection.addConnection')
               }"
               class="settingbar-element btn btn-link"
               :class="{ 'selected': 'NEW' === selectedWorkspace }"
               @click="selectWorkspace('NEW')"
            >
               <div class="settingbar-element-icon-wrapper">
                  <BaseIcon
                     icon-name="mdiPlus"
                     class="settingbar-element-icon text-light"
                     :size="24"
                  />
               </div>
            </li>
         </ul>
      </div>

      <div class="settingbar-bottom-elements">
         <ul class="settingbar-elements">
            <li
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('application.note', 2)
               }"
               class="settingbar-element btn btn-link"
               @click="showScratchpad()"
            >
               <BaseIcon
                  class="settingbar-element-icon text-light"
               />
            </li>
            <li
               v-if="isExpandedSettingBar === true"
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('message.collapseSettingsBar')
               }"
               class="settingbar-element btn btn-link"
               @click="hideExpandedSettingBar(); searchQuery = ''"
            >
               <BaseIcon

                  class="settingbar-element-icon text-light"
               /><!--:icon="isExpandedSettingBar ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"-->
            </li>

            <li
               v-else
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('message.expandSettingsBar')
               }"
               class="settingbar-element btn btn-link"
               @click="showExpandedSettingBar(); searchQuery = ''"
            >
               <BaseIcon
                  :icon="isExpandedSettingBar ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"
               />
               <!--              icon="mdi-arrow-expand" -->
            </li>

            <li
               v-tooltip="{
                  strategy: 'fixed',
                  placement: 'right',
                  content: t('application.settings')
               }"
               class="settingbar-element btn btn-link"
               @click="showSettingModal('general')"
            >
               <div class="settingbar-element-icon-wrapper">
                  <div
                     class="settingbar-element-icon text-light"
                     :class="{ 'badge badge-update': hasUpdates }"
                  >
                     <BaseIcon
                        icon-name="mdiCog"
                        :size="24"
                     />
                  </div>
               </div>
            </li>
         </ul>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useElementBounding } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BaseIcon from '@/components/BaseIcon.vue';
import SettingBarConnections from '@/components/SettingBarConnections.vue';
import SettingBarContext from '@/components/SettingBarContext.vue';
import { useApplicationStore } from '@/stores/application';
import { SidebarElement, useConnectionsStore } from '@/stores/connections';
import { useWorkspacesStore } from '@/stores/workspaces';

const { t } = useI18n();
localStorage.setItem('opened-folders', '[]');

const applicationStore = useApplicationStore();
const connectionsStore = useConnectionsStore();
const workspacesStore = useWorkspacesStore();

const { updateStatus, isExpandedSettingBar } = storeToRefs(applicationStore);
const { getSelected: selectedWorkspace } = storeToRefs(workspacesStore);
const { connectionsOrder } = storeToRefs(connectionsStore);

const { showSettingModal, showScratchpad, showExpandedSettingBar, hideExpandedSettingBar } = applicationStore;
const { updateConnectionsOrder, initConnectionsOrder, getConnectionName } = connectionsStore;
const { selectWorkspace } = workspacesStore;

const emit = defineEmits(['show-connections-modal']);

const sidebarConnections: Ref<HTMLDivElement> = ref(null);
const isContext: Ref<boolean> = ref(false);
const searchQuery: Ref<string> = ref('');
const isScrollable: Ref<boolean> = ref(false);
const contextEvent: Ref<MouseEvent> = ref(null);
const contextConnection: Ref<SidebarElement> = ref(null);
const sidebarConnectionsHeight = ref(useElementBounding(sidebarConnections)?.height);

const connectionsArr = computed({
   get: () => {
      // First filter matches
      return connectionsOrder.value.map(d => {
         if (d.isFolder) {
            if (d.name && d.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
               d.hidden = false;
               // TODO: force show all items in folder.
               return d;
            }

            let showFolder = false;

            d.connections.forEach(d => {
               if (getConnectionName(d).toLowerCase().includes(searchQuery.value.toLowerCase()))
                  showFolder = true;
            });
            d.hidden = !showFolder;
            return d;
         }
         else {
            if (getConnectionName(d.uid).toLowerCase().includes(searchQuery.value.toLowerCase()))
               d.hidden = false;
            else
               d.hidden = true;
            return d;
         }
      });
   },

   set: (value: SidebarElement[]) => {
      updateConnectionsOrder(value);
   }
});

const hasUpdates = computed(() => ['available', 'downloading', 'downloaded', 'link'].includes(updateStatus.value));

const contextMenu = (event: MouseEvent, connection: SidebarElement) => {
   contextEvent.value = event;
   contextConnection.value = connection;
   isContext.value = true;
};

watch(sidebarConnectionsHeight, (value) => {
   isScrollable.value = value < sidebarConnections.value.scrollHeight;
});

watch(selectedWorkspace, (newVal, oldVal) => {
   if (newVal !== oldVal) {
      setTimeout(() => {
         const element = document.querySelector<HTMLElement>('.settingbar-element.selected');
         if (element) {
            element.setAttribute('tabindex', '-1');
            element.focus();
            element.removeAttribute('tabindex');
         }
      }, 150);
   }
});

if (!connectionsArr.value.length)
   initConnectionsOrder();
</script>

<style lang="scss">
#settingbar {
   width: $settingbar-width * 4;
   height: calc(100vh - #{$excluding-size});
   display: flex;
   flex-direction: column;
   //  justify-content: space-between;
   align-items: center;
   padding: 0;
   z-index: 9;
   transition: width 0.2s ease-in-out;

   .settingbar-top-elements {
      overflow-x: hidden;
      overflow-y: overlay;
      width: 100%;

      &::-webkit-scrollbar {
         width: 3px;
      }
   }

   .settingbar-bottom-elements {
      z-index: 1;
      margin-top: auto;
   }

   .settingbar-elements {
      list-style: none;
      text-align: center;
      width: $settingbar-width;
      padding: 0;
      margin: 0;

      li {
         margin: 0;
         background: $bg-color-light-dark;

         &.ghost {
            border-radius: $border-radius;

            .settingbar-element {
               &.selected::before {
                  height: 0;
                  width: 0;
               }
            }
         }
      }

      .settingbar-element {
         height: $settingbar-width;
         width: 100%;
         margin: 0;
         opacity: 0.6;
         transition: opacity 0.2s;
         display: flex;
         align-items: center;
         justify-content: center;
         border-radius: 0;
         padding: 0;
         position: relative;
         border: none;

         &:hover {
            opacity: 1;
         }

         &.selected {
            opacity: 1;

            &::before {
               height: calc(#{$settingbar-width} - 0.4rem);
            }
         }

         &::before {
            content: "";
            height: 0;
            width: 3px;
            transition: height 0.2s;
            background-color: rgba($color: #fff, $alpha: 0.8);
            border-radius: $border-radius;
         }

         .settingbar-element-icon-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;

            .settingbar-element-icon {
               &.badge::after {
                  top: 10px;
                  right: -3px;
                  position: absolute;
               }

               &.badge-update::after {
                  bottom: initial;
               }
            }

            .settingbar-element-name {
               font-size: 65%;
               max-width: 90%;
               font-style: normal;
               display: block;
               overflow: hidden;
               white-space: nowrap;
               text-overflow: ellipsis;
               width: calc($settingbar-width - 15px);
               line-height: 1.1;
               color: rgba($body-font-color-dark, 0.8);
               text-align: center;
            }

            .settingbar-element-pin {// <- Dead
               margin: 0 auto;

               &::before {
                  font: normal normal normal 14px/1 "Material Design Icons";
                  content: "\F0403";
                  color: $body-font-color-dark;
                  transform: rotate(45deg);
                  opacity: 0.25;
                  top: -8px;
                  left: -10px;
                  position: absolute;
               }
            }
         }
      }
   }

   // Search input
   .settingbar-search {
      margin-top: 0.3rem;
      padding: 0 5px 0;
      width: 100%;
      input {
         border-radius: .2rem;
      }
   }

   &.expanded {

     width: $settingbar-width * 4;

     settingbar-top-elements
     {
      width: 100%;
      .settingbar-elements {
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
    // width: calc( $settingbar-width * 4 - 1rem)
    }
    }

      .settingbar-bottom-elements ul {
         display: flex;
         flex-direction: row;
         width: $settingbar-width * 3;
      }

      // .settingbar-top-elements .settingbar-element {
      //    width: 100%;
      //    height: auto;
      // }

      // .settingbar-elements .settingbar-element {
      //    .settingbar-element-icon-wrapper{
      //       flex-direction:row;
      //       justify-content: left;

      //       .settingbar-element-name {
      //          font-size: 100%;
      //          width: $settingbar-width * 4;
      //          max-width: 90%;
      //          text-align: left;
      //          padding-left: 1rem;
      //       }
      //    }
      // }
   }
}
</style>
