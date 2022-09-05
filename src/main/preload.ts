/* eslint-disable promise/catch-or-return */
/* eslint-disable import/prefer-default-export */
const { contextBridge, ipcRenderer, desktopCapturer } = require('electron');
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
  const rendererScript = document.createElement('script');
  rendererScript.text = readFileSync(join(__dirname, 'renderer.js'), 'utf8');
  document.body.appendChild(rendererScript);
});

contextBridge.exposeInMainWorld('myCustomGetDisplayMedia', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  });

  // you should create some kind of UI to prompt the user
  // to select the correct source like Google Chrome does
  const selectedSource = sources[0]; // this is just for testing purposes

  return selectedSource;
});
