/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [
      'autostart',
      'zoom',
      'savePassword',
      'getPassword',
      'notifications',
      'download',
      'update',
      'runUpdate',
      'changeUrl',
      'resize',
<<<<<<< HEAD
      'download',
      'update',
      'runUpdate',
      'changeUrl',
      'resize',
=======
      'notifications',
>>>>>>> 21-feature-new-notification-management
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = [
      'fromMain',
      'savePassword',
      'getPassword',
      'download',
      'update',
      'runUpdate',
      'changeUrl',
      'resize',
      'notifications',
<<<<<<< HEAD
      'download',
      'update',
      'runUpdate',
      'changeUrl',
      'resize',
=======
      'notifications',
>>>>>>> 21-feature-new-notification-management
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
