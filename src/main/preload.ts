/* eslint-disable promise/always-return */
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
  invoke: (channel: string, data: any) => {
    // whitelist channels
    const validChannels = ['getDisplaySources'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
});

// inject renderer.js into the web page
window.addEventListener('DOMContentLoaded', () => {
  // Get getDisplayMedia() into renderer process
  const rendererScript = document.createElement('script');
  rendererScript.text = readFileSync(join(__dirname, 'renderer.js'), 'utf8');
  document.body.appendChild(rendererScript);
  // Append CSS to file
  const screenShareStyles = document.createElement('style');
  screenShareStyles.innerHTML = `.desktop-capturer-selection {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(30,30,30,.75);
    color: #fff;
    z-index: 10000000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .desktop-capturer-selection__scroller {
    width: 100%;
    max-height: 100vh;
    overflow-y: auto;
  }
  .desktop-capturer-selection__list {
    max-width: calc(100% - 100px);
    margin: 50px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    overflow: hidden;
    justify-content: center;
  }
  .desktop-capturer-selection__item {
    display: flex;
    margin: 4px;
  }
  .desktop-capturer-selection__btn {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 145px;
    margin: 0;
    border: 0;
    border-radius: 3px;
    padding: 4px;
    background: #252626;
    text-align: left;
    transition: background-color .15s, box-shadow .15s;
  }
  .desktop-capturer-selection__btn:hover,
  .desktop-capturer-selection__btn:focus {
    background: rgba(98,100,167,.8);
  }
  .desktop-capturer-selection__thumbnail {
    width: 100%;
    height: 81px;
    object-fit: cover;
  }
  .desktop-capturer-selection__name {
    margin: 6px 0 6px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }`;
  document.head.appendChild(screenShareStyles);
});

contextBridge.exposeInMainWorld('myCustomGetDisplayMedia', async () => {
  // ipcRenderer.on('getDisplaySources', (result) => {
  // ipcRenderer.invoke('getDisplaySources').then((result) => {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
  });
  console.log('Renderer: ', sources);
  const selectionElem = document.createElement('div');
  selectionElem.classList = 'desktop-capturer-selection';
  selectionElem.innerHTML = `
          <div class="desktop-capturer-selection__scroller">
            <ul class="desktop-capturer-selection__list">
              ${sources
                .map(
                  ({ id, name, thumbnail, display_id, appIcon }) => `
                <li class="desktop-capturer-selection__item">
                  <button class="desktop-capturer-selection__btn" data-id="${id}" title="${name}">
                    <img class="desktop-capturer-selection__thumbnail" src="${thumbnail.toDataURL()}" />
                    <span class="desktop-capturer-selection__name">${name}</span>
                  </button>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        `;
  document.body.appendChild(selectionElem);
  document
    .querySelectorAll('.desktop-capturer-selection__btn')
    .forEach((button) => {
      button.addEventListener('click', async () => {
        // try {
        const id = button.getAttribute('data-id');
        const source = sources.find((source) => source.id === id);
        /* if (!source) {
            throw new Error(`Source with id ${id} does not exist`);
          } else { */
        return source;
        /* }
        } catch (error) {
          console.error(error);
        } */
      });
    });
});
