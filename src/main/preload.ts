/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
const { contextBridge, ipcRenderer } = require('electron');
const { readFileSync } = require('fs');
const { join } = require('path');

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
      'getDisplaySources',
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
      'getDisplaySources',
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

// inject renderer.js into the web page
window.addEventListener('DOMContentLoaded', () => {
  // Get getDisplayMedia() into renderer process
  const rendererScript = document.createElement('script');
  rendererScript.text = readFileSync(join(__dirname, 'renderer.js'), 'utf8');
  document.body.appendChild(rendererScript);
});

contextBridge.exposeInMainWorld('myCustomGetDisplayMedia', async () => {
  // ipcRenderer.on('getDisplaySources', (result) => {
  let sourceId = '';
  ipcRenderer.on('getDisplaySources', async (result) => {
    sourceId = result.toString(); // is the String delivered correctly?
  });
  ipcRenderer.send('getDisplaySources');
  while (sourceId === '') {
    window.setTimeout(() => {});
  }
  return sourceId;
});
