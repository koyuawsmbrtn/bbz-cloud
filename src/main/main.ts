/* eslint-disable promise/no-nesting */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-empty */
/* eslint-disable no-inner-declarations */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable vars-on-top */
/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  dialog,
  ipcMain,
  Menu,
  Tray,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import keytar from 'keytar';
import fs from 'fs';
import { resolveHtmlPath } from './util';

let zoomFaktor = 1.0;
let messageBoxIsDisplayed = false;
/*
 *** ipcCommunication
 */

// Communication with renderer for Autostart func (Mac/Windows)
ipcMain.on('autostart', (event, args) => {
  app.setLoginItemSettings({
    openAtLogin: args,
    openAsHidden: true,
  });
});

// Communication with renderer for Zooming the App
ipcMain.on('zoom', (event, args) => {
  zoomFaktor = args;
  mainWindow.webContents.setZoomFactor(zoomFaktor);
});

ipcMain.on('savePassword', (event, cred) => {
  keytar.setPassword('bbzcloud', 'credentials', JSON.stringify(cred));
});

ipcMain.on('getPassword', (event) => {
  // Idee: Ein Sammelobjekt übertragen statt einzelner ipc-Anfragen
  const emptyCreds = {
    outlookUsername: '',
    outlookPassword: '',
    moodleUsername: '',
    moodlePassword: '',
    bbbUsername: '',
    bbbPassword: '',
  };
  const pw = keytar.getPassword('bbzcloud', 'credentials');
  // eslint-disable-next-line promise/always-return
  pw.then((result) => {
    if (result === null) {
      mainWindow.webContents.send('getPassword', emptyCreds);
    } else mainWindow.webContents.send('getPassword', JSON.parse(result));
  }).catch(() => {
    mainWindow.webContents.send('getPassword', emptyCreds);
  });
});

/*
 ***
 */

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webviewTag: true,
      partition: 'persist:bbzcloud',
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  Menu.setApplicationMenu(null);

  if (!isDevelopment) {
    mainWindow.webContents.insertCSS('.debug{display:none !important;}');
  }

  function createTray() {
    const appIcon = new Tray(getAssetPath('tray.png'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Anzeigen',
        click() {
          mainWindow.show();
        },
      },
      {
        label: 'Beenden',
        click() {
          tray.destroy();
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    appIcon.on('double-click', function (event) {
      mainWindow.show();
    });
    appIcon.setToolTip('BBZ Cloud');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
  }

  let tray = createTray();

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('restore', function (event) {
    mainWindow.show();
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (
      process.env.START_MINIMIZED ||
      app.getLoginItemSettings().wasOpenedAsHidden
    ) {
      mainWindow.show();
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.setMenu(null);

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // AutoUpdater - including debug loggin in %USERPROFILE%\AppData\Roaming\bbzcloud\logs\
  const log = require('electron-log');
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;
  function sendStatusToWindow(text) {
    log.info(text);
  }
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  });
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
    if (process.platform === 'darwin') {
      dialog
        .showMessageBox(mainWindow, {
          title: 'Neues Update verfügbar',
          message:
            'Ein neues Update steht bereit. Wollen Sie es herunterladen oder ablehnen?',
          type: 'info',
          buttons: [
            'Update nicht herunterladen',
            'Website zum Download öffnen',
          ],
        })
        .then((response) => {
          if (response.response === 1) {
            shell.openExternal('https://kurzelinks.de/bbz-cloud');
          }
          messageBoxIsDisplayed = false;
        });
    }
  });
  autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');
  });
  autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow('Error in auto-updater.');
  });
  autoUpdater.on('download-progress', (_ev, progressObj) => {
    sendStatusToWindow('Download progress...');
  });
  autoUpdater.on('update-downloaded', (ev, info) => {
    if (process.platform !== 'darwin') {
      dialog
        .showMessageBox(mainWindow, {
          title: 'Neues Update verfügbar',
          message: info.releaseNotes,
          type: 'info',
          buttons: ['Ok', 'App jetzt neu starten'],
        })
        .then((response) => {
          if (response.response === 1) {
            tray.destroy();
            autoUpdater.quitAndInstall();
          }
          messageBoxIsDisplayed = false;
        });
    }
    sendStatusToWindow('Update downloaded');
  });
  autoUpdater.checkForUpdates();
};

// ********************** Auto-Updater *******************************

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const downloadtypes = [
  '.mp4',
  '.mp3',
  '.ogg',
  '.flac',
  '.wav',
  '.mkv',
  '.mov',
  '.wmv',
  '.oga',
  '.ogv',
  '.opus',
  '.pdf',
  '.xls',
  '.xlsx',
  '.ppt',
  '.zip',
  '.exe',
  '.AppImage',
  '.snap',
  '.bin',
  '.sh',
  '.doc',
  '.docx',
  '.fls',
];

const keywordsMicrosoft = ['onedrive', 'onenote', 'download.aspx'];

function isDownloadType(url: string) {
  var isdt = false;
  downloadtypes.forEach((s) => {
    if (url.includes(s)) {
      isdt = true;
    }
  });
  return isdt;
}

function isMicrosoft(url: string) {
  var isms = false;
  keywordsMicrosoft.forEach((s) => {
    if (url.includes(s)) {
      isms = true;
    }
  });
  return isms;
}
// Open third-party links in browser - used for BBB and Jitsi conferences
app.on('web-contents-created', (event, contents) => {
  var handleRedirect = (e, url) => {
    if (
      url.includes('bbb.bbz-rd-eck.de/bigbluebutton/api/join?') ||
      url.includes('meet.stashcat.com')
    ) {
      e.preventDefault();
      // bad style, but necessary to close empty BrowserWindow
      BrowserWindow.getAllWindows().forEach((w) => {
        if (w.getTitle() === 'Electron' || w.getTitle() === 'bbzcloud') {
          w.close();
        }
      });
      shell.openExternal(url);
    }
  };
  contents.on('will-redirect', handleRedirect);

  // eslint-disable-next-line no-var
  var handleNewWindow = (e, url) => {
    if (
      (isMicrosoft(url) || url.includes('download.aspx')) &&
      !url.includes('stashcat')
    ) {
      if (
        url.includes('about:blank') ||
        url.includes('download') ||
        url.includes('sharepoint')
      ) {
        e.preventDefault();
        const newWin = new BrowserWindow({
          width: 1024,
          height: 728,
          minWidth: 600,
          minHeight: 300,
          show: false,
        });
        newWin.loadURL(url);
      } else if (!isDownloadType(url)) {
        if (!url.includes('onedrive')) {
          e.preventDefault();
          const newWin = new BrowserWindow({
            width: 1280,
            height: 728,
            minWidth: 600,
            minHeight: 300,
            show: false,
          });
          newWin.loadURL(url);
          newWin.setMenu(null);
          e.newGuest = newWin;
          if (!url.includes('about:blank') || !url.includes('download')) {
            newWin.show();
          }
        } else {
          e.preventDefault();
          contents.loadURL(url);
        }
      }
    }
  };
  contents.on('new-window', handleNewWindow);

  function handleDownloads(event, item, webContents) {
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else if (item.getTotalBytes() !== 0) {
          console.log(
            `Percentage of Download: ${
              (item.getTotalBytes() / item.getReceivedBytes()) * 100
            }`
          );
        } else {
          console.log(`Total Bytes downloaded: ${item.getReceivedBytes()}`);
        }
      }
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        const RESOURCES_PATH = app.isPackaged
          ? path.join(process.resourcesPath, 'assets')
          : path.join(__dirname, '../../assets');
        const getAssetPath = (...paths: string[]): string => {
          return path.join(RESOURCES_PATH, ...paths);
        };
        const options = {
          type: 'info',
          buttons: ['Ok', 'Downloads-Ordner öffnen'],
          title: 'Download',
          message: 'Download abgeschlossen',
        };
        if (!messageBoxIsDisplayed) {
          messageBoxIsDisplayed = true;
          dialog.showMessageBox(mainWindow, options).then((response) => {
            if (response.response === 1) {
              shell.openPath(app.getPath('downloads'));
            }
            messageBoxIsDisplayed = false;
          });
        }
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  }
  contents.session.on('will-download', handleDownloads);
});

app
  .whenReady()
  .then(() => {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      /* const options = {
        type: 'error',
        buttons: ['Ok'],
        title: 'Fehler',
        message:
          'Die BBZ Cloud App läuft bereits und kann nicht mehrfach gestartet werden. Beenden Sie bitte die App, bevor Sie sie neu starten.',
      };
      dialog.showMessageBoxSync(mainWindow, options); */
      app.quit();
    } else {
      app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      });
    }
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
