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
  // desktopCapturer,
  Menu,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import keytar from 'keytar';
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
ipcMain.handle('getDisplaySources', async (event) => {
  desktopCapturer
    .getSources({ types: ['window', 'screen'] })
    .then((sources) => {
      console.log('Main: ', JSON.stringify(sources));
      return JSON.stringify(sources);
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
    if (process.platform !== 'darwin') {
      dialog.showMessageBox(mainWindow, {
        message:
          'Ein Update ist verfügbar! Download über kurzelinks.de/bbz-cloud',
        type: 'info',
        buttons: ['Ok'],
        title: 'Updater',
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
    sendStatusToWindow('Update downloaded');
  });
  autoUpdater.checkForUpdates();
};

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
// Open third-party links in browser
app.on('web-contents-created', (event, contents) => {
  var handleRedirect = (e, url) => {
    if (
      url.includes('https://bbb.bbz-rd-eck.de/html5client/join?sessionToken')
      // || url.includes('meet.stashcat.com')
    ) {
      e.preventDefault();
      const videoWin = new BrowserWindow({
        width: 1240,
        height: 728,
        minWidth: 700,
        minHeight: 400,
        webPreferences: {
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
          // nodeIntegration: false, // is default value after Electron v5
          // contextIsolation: true, // protect against prototype pollution
        },
      });
      videoWin.webContents.session.setPermissionCheckHandler(
        (webContents, permission, details) => {
          return true;
        }
      );
      videoWin.webContents.session.setPermissionRequestHandler(
        (webContents, permission, callback, details) => {
          callback(true);
        }
      );
      videoWin.loadURL(url);
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
    item.on('done', (event, state) => {
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
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
