export const shortcutEvents: { [key: string]: { l18n: string; l18nParam?: string | number; context?: 'tab' }} = {
   'open-new-tab': { l18n: 'message.openNewTab', context: 'tab' },
   'close-tab': { l18n: 'message.closeTab', context: 'tab' },
   'next-tab': { l18n: 'message.nextTab', context: 'tab' },
   'prev-tab': { l18n: 'message.previousTab', context: 'tab' },
   'open-all-connections': { l18n: 'message.openAllConnections' },
   'toggle-console': { l18n: 'message.toggleConsole' },
   'save-content': { l18n: 'message.saveContent' },
   'run-or-reload': { l18n: 'message.runOrReload' },
   'create-connection': { l18n: 'message.createNewConnection' },
   'open-settings': { l18n: 'message.openSettings' },
   'open-scratchpad': { l18n: 'message.openScratchpad' }
};

interface ShortcutRecord {
   event: string;
   keys: Electron.Accelerator[] | string[];
   /** Needed for default shortcuts */
   os: NodeJS.Platform[];
}

/**
 * Default shortcuts
 */
const shortcuts: ShortcutRecord[] = [
   {
      event: 'run-or-reload',
      keys: ['F5'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'save-content',
      keys: ['CommandOrControl+S'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'open-new-tab',
      keys: ['CommandOrControl+T'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'close-tab',
      keys: ['CommandOrControl+W'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'next-tab',
      keys: ['Alt+CommandOrControl+Right'],
      os: ['darwin', 'win32']
   },
   {
      event: 'prev-tab',
      keys: ['Alt+CommandOrControl+Left'],
      os: ['darwin', 'win32']
   },
   {
      event: 'next-tab',
      keys: ['CommandOrControl+PageDown'],
      os: ['linux', 'win32']
   },
   {
      event: 'prev-tab',
      keys: ['CommandOrControl+PageUp'],
      os: ['linux', 'win32']
   },
   {
      event: 'open-all-connections',
      keys: ['Shift+CommandOrControl+Space'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'toggle-console',
      keys: ['CommandOrControl+F12'],
      os: ['darwin', 'linux', 'win32']
   },
   {
      event: 'toggle-console',
      keys: ['CommandOrControl+`'],
      os: ['darwin', 'linux', 'win32']
   }
];

for (let i = 1; i <= 9; i++) {
   shortcutEvents[`select-tab-${i}`] = {
      l18n: 'message.selectTabNumber',
      l18nParam: i
   };

   shortcuts.push({
      event: `select-tab-${i}`,
      keys: [`CommandOrControl+${i}`],
      os: ['darwin', 'linux', 'win32']
   });
}

export { shortcuts, ShortcutRecord };
