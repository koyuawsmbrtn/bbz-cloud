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
import fs from 'fs-extra';
import {
  app,
  BrowserWindow,
  shell,
  dialog,
  ipcMain,
  Menu,
  Tray,
  powerMonitor,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import keytar from 'keytar';
import { clipboard } from 'electron';
import { resolveHtmlPath } from './util';

const appName = app.getName();

let zoomFaktor = 0.8;
let messageBoxIsDisplayed = false;
let updateAvailable = false;
let BrowserWindowDim = { x: 0, y: 0, width: 1600 * 0.9, height: 900 * 0.9 };
let isVisible = true;
const getAppPath = path.join(app.getPath('appData'), appName);

/*
 *** Setting general Application Menu for child windows - navbar
 */
let childZoomLevel = zoomFaktor;
const template = [
  {
    label: '⏪',
    accelerator: 'CmdOrCtrl+[',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) focusedWindow.webContents.goBack();
    },
  },
  {
    label: '⏩',
    accelerator: 'CmdOrCtrl+]',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) focusedWindow.webContents.goForward();
    },
  },
  {
    label: '🔄',
    accelerator: 'CmdOrCtrl+R',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) focusedWindow.webContents.reload();
    },
  },
  { type: 'separator' },
  {
    label: '➕🔎',
    accelerator: 'CmdOrCtrl+Plus',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        childZoomLevel += 0.1;
        focusedWindow.webContents.setZoomLevel(childZoomLevel);
      }
    },
  },
  { type: 'separator' },
  {
    label: '➖🔎',
    accelerator: 'CmdOrCtrl+-',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        childZoomLevel -= 0.1;
        focusedWindow.webContents.setZoomLevel(childZoomLevel);
      }
    },
  },
  { type: 'separator' },
  {
    label: '📋🔗',
    accelerator: 'CmdOrCtrl+L',
    click: () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow)
        clipboard.writeText(focusedWindow.webContents.getURL());
    },
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

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
  mainWindow?.webContents.setZoomFactor(zoomFaktor);
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
      mainWindow?.webContents.send('getPassword', emptyCreds);
    } else mainWindow?.webContents.send('getPassword', JSON.parse(result));
  }).catch(() => {
    mainWindow?.webContents.send('getPassword', emptyCreds);
  });
});

// Run update IPC
ipcMain.on('runUpdate', () => {
  if (process.platform !== 'darwin') {
    autoUpdater.quitAndInstall();
  } else {
    const pathMacUpdate = autoUpdater.getFeedURL();
    shell.openExternal(pathMacUpdate);
  }
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
    x: BrowserWindowDim.x,
    y: BrowserWindowDim.y,
    width: BrowserWindowDim.width,
    height: BrowserWindowDim.height,
    minWidth: 725,
    minHeight: 700,
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

  mainWindow?.loadURL(resolveHtmlPath('index.html'));

  // Kotextmenü
  const contextMenuTemplate = [
    { label: 'Ausschneiden', role: 'cut' },
    { label: 'Kopieren', role: 'copy' },
    { label: 'Einfügen', role: 'paste' },
    { type: 'separator' },
    { label: 'Alles markieren', role: 'selectall' },
  ];

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

  mainWindow.webContents.on('context-menu', (e) => {
    if (/* WebView ist schul.cloud */ true) {
      e.preventDefault();
      contextMenu.popup();
    } else {
      // zeige den Standard der WebApp an
    }
  });

  // funky workaraound (could be done via ipc communication - but might be easier like this)
  function getBrowserWindowDim() {
    mainWindow?.webContents
      .executeJavaScript('localStorage.getItem("BrowserWindowDim");', true)
      .then((result) => {
        if (result === null) {
          mainWindow?.webContents.executeJavaScript(
            `localStorage.setItem("BrowserWindowDim",'${JSON.stringify(
              BrowserWindowDim
            )}');`,
            true
          );
        } else {
          BrowserWindowDim = JSON.parse(result);
        }
      });
    return BrowserWindowDim;
  }
  mainWindow?.setBounds(getBrowserWindowDim());

  if (process.platform === 'darwin') {
    var mainWindowMenuTemplate = Menu.buildFromTemplate([
      {
        label: 'BBZ Cloud',
        submenu: [
          {
            label: 'BBZ Cloud',
            enabled: false,
          },
          { type: 'separator' },
          {
            label: 'Einstellungen',
            accelerator: 'CmdOrCtrl+,',
            click() {
              mainWindow?.show();
              mainWindow?.focus();
              mainWindow?.webContents.send('changeUrl', 'settings');
            },
          },
          {
            label: 'BBZ Cloud ausblenden',
            accelerator: 'CmdOrCtrl+H',
            click() {
              mainWindow?.hide();
            },
          },
          { type: 'separator' },
          {
            label: 'Beenden',
            accelerator: 'CmdOrCtrl+Q',
            click() {
              process.kill(process.pid, 9);
            },
          },
        ],
      },
      {
        label: 'Bearbeiten',
        submenu: [
          {
            label: 'Widerrufen',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo',
          },
          {
            label: 'Wiederholen',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo',
          },
          {
            type: 'separator',
          },
          {
            label: 'Ausschneiden',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut',
          },
          {
            label: 'Kopieren',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy',
          },
          {
            label: 'Einsetzen',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste',
          },
          {
            label: 'Alles auswählen',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectAll',
          },
        ],
      },
      {
        label: 'Darstellung',
        submenu: [
          {
            label: 'Neu laden',
            accelerator: 'CmdOrCtrl+R',
            click() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) focusedWindow.reload();
            },
          },
          {
            label: 'Vollbildmodus',
            accelerator: (() => {
              if (process.platform === 'darwin') return 'Ctrl+Command+F';
              return 'F11';
            })(),
            click() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            },
          },
        ],
      },
      {
        label: 'Fenster',
        role: 'window',
        submenu: [
          {
            label: 'Im Dock ablegen',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize',
          },
          {
            label: 'Schließen',
            accelerator: 'CmdOrCtrl+W',
            role: 'close',
          },
        ],
      },
      {
        label: 'Hilfe',
        role: 'help',
        submenu: [
          {
            label: 'Problem oder Funktionswunsch melden …',
            click() {
              mainWindow?.show();
              mainWindow?.focus();
              mainWindow?.webContents.send('changeUrl', 'Issues');
            },
          },
          {
            label: 'Mehr erfahren',
            click() {
              shell.openExternal('https://github.com/koyuawsmbrtn/bbz-cloud/');
            },
          },
        ],
      },
    ]);

    Menu.setApplicationMenu(mainWindowMenuTemplate);
  } else {
    mainWindow?.setMenu(null);
  }

  if (!isDevelopment) {
    mainWindow?.webContents.insertCSS('.debug{display:none !important;}');
  }

  // tray icon managements
  function createTray() {
    let appIcon;
    if (process.platform === 'win32' || process.platform === 'darwin') {
      appIcon = new Tray(getAssetPath('tray-lowres.png'));
    } else {
      appIcon = new Tray(getAssetPath('tray.png'));
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'BBZ Cloud',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Anzeigen',
        click() {
          mainWindow?.show();
        },
      },
      {
        label: 'Einstellungen',
        click() {
          mainWindow?.show();
          mainWindow?.focus();
          mainWindow?.webContents.send('changeUrl', 'settings');
        },
      },
      { type: 'separator' },
      {
        label: 'Beenden',
        click() {
          tray.destroy();
          app.isQuiting = true;
          process.kill(process.pid, 9);
        },
      },
    ]);

    appIcon.on('double-click', function (event) {
      mainWindow?.show();
    });
    appIcon.setToolTip('BBZ Cloud');
    appIcon.setContextMenu(contextMenu);
    return appIcon;
  }

  let tray = null;
  if (process.platform !== 'darwin') {
    tray = createTray();
  }

  ipcMain.on('openDevTools', () => {
    mainWindow?.webContents.openDevTools({ mode: 'detach' });
  });

  // delete all data and cache on call from debug menu
  ipcMain.on('deleteAndReload', (event) => {
    fs.rmdir(getAppPath, (error) => {
      if (error) {
        console.log('Path not deleted!');
      } else {
        // You should relaunch the app after clearing the app settings.
        console.log('Path deleted!');
        app.relaunch();
        tray.destroy();
        process.kill(process.pid, 9);
      }
    });
  });

  powerMonitor.on('lock-screen', () => {
    // save window dimensions and visibility state of window for reset after returning from sleep / lock
    isVisible = mainWindow?.isVisible();
  });
  powerMonitor.on('suspend', () => {
    // save window dimensions and visibility state of window for reset after returning from sleep / lock
    isVisible = mainWindow?.isVisible();
  });
  powerMonitor.on('resume', () => {
    console.log('The system is resuming');
    mainWindow?.webContents.send('reloadApp');
    mainWindow?.setBounds(getBrowserWindowDim());
    if (isVisible) {
      mainWindow?.showInactive();
    } else {
      mainWindow?.minimize(); // even if the app is completely hidden, it must return minimized, else it can't be opened
    }
  });
  powerMonitor.on('unlock-screen', () => {
    console.log('The system is unlocked');
    mainWindow?.webContents.send('reloadApp');
    mainWindow?.setBounds(getBrowserWindowDim());
    if (isVisible) {
      mainWindow?.showInactive();
    } else {
      mainWindow?.minimize(); // even if the app is completely hidden, it must return minimized, else it can't be opened
    }
  });

  mainWindow?.on('resize', () => {
    BrowserWindowDim = {
      x: mainWindow?.getBounds().x,
      y: mainWindow?.getBounds().y,
      width: mainWindow?.getBounds().width,
      height: mainWindow?.getBounds().height,
    };
    mainWindow?.webContents.executeJavaScript(
      `localStorage.setItem("BrowserWindowDim",'${JSON.stringify(
        BrowserWindowDim
      )}');`,
      true
    );
  });

  mainWindow?.on('will-resize', (event, newBounds, details) => {
    BrowserWindowDim = {
      x: newBounds.x,
      y: newBounds.y,
      width: newBounds.width,
      height: newBounds.height,
    };
    mainWindow?.webContents.executeJavaScript(
      `localStorage.setItem("BrowserWindowDim",'${JSON.stringify(
        BrowserWindowDim
      )}');`,
      true
    );
  });

  mainWindow?.on('maximize', () => {
    BrowserWindowDim = {
      x: mainWindow?.getBounds().x,
      y: mainWindow?.getBounds().y,
      width: mainWindow?.getBounds().width,
      height: mainWindow?.getBounds().height,
    };
    mainWindow?.webContents.executeJavaScript(
      `localStorage.setItem("BrowserWindowDim",'${JSON.stringify(
        BrowserWindowDim
      )}');`,
      true
    );
  });

  mainWindow?.on('close', (event) => {
    if (updateAvailable) {
      if (process.platform !== 'darwin') {
        autoUpdater.quitAndInstall();
      } else {
        event.preventDefault();
        mainWindow?.hide();
      }
    } else {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow?.on('restore', function (event) {
    mainWindow?.setBounds(getBrowserWindowDim());
    mainWindow?.show();
  });

  mainWindow?.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (
      process.env.START_MINIMIZED ||
      app.getLoginItemSettings().wasOpenedAsHidden
    ) {
      mainWindow?.show();
      mainWindow?.minimize();
    } else {
      mainWindow?.show();
    }
  });

  mainWindow?.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser - just as fallback, should never be useds
  mainWindow?.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // AutoUpdater - including debug logging in %USERPROFILE%\AppData\Roaming\bbzcloud\logs\
  const log = require('electron-log');
  log.transports.file.level = 'debug';
  autoUpdater.logger = log;
  function sendStatusToWindow(text) {
    log.info(text);
  }
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10000);
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  });
  autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
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
    updateAvailable = true;
    // if (process.platform !== 'darwin') {
    mainWindow?.webContents.send('update', 'available');
    sendStatusToWindow('Update downloaded');
    // }
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
//  '.pdf',

const keywordsMicrosoft = ['onedrive', 'onenote', 'download.aspx'];

// Filter out Download types - necessary for easier child window handling
function isDownloadType(url: string) {
  var isdt = false;
  downloadtypes.forEach((s) => {
    if (url.includes(s)) {
      isdt = true;
    }
  });
  return isdt;
}

// detect, if an URL is MS-related (necessary for new window management)
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

  // Managing new Windows opened - a bit confusing because of strange behaviour of MS-Office Sitess
  // eslint-disable-next-line no-var
  var handleNewWindow = (e, url) => {
    if (
      (isMicrosoft(url) || url.includes('download.aspx')) &&
      !url.includes('stashcat')
    ) {
      if (
        (url.includes('about:blank') ||
          url.includes('download') ||
          url.includes('sharepoint')) &&
        !(
          url.includes('https://bbzrdeckde-my.sharepoint.com/personal/') &&
          url.includes('onedrive.aspx')
        )
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
        newWin.setMenu(menu);
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
          newWin.setMenu(menu);

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

  // Manage all download related tasks
  function handleDownloads(event, item, webContents) {
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        mainWindow?.webContents.send('download', 'interrupted');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
          mainWindow?.webContents.send('download', 'paused');
        } else if (item.getTotalBytes() !== 0) {
          mainWindow?.webContents.send(
            'download',
            (item.getReceivedBytes() / item.getTotalBytes()) * 100
          );
        } else {
          mainWindow?.webContents.send('download', 'noPercent');
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
        mainWindow?.webContents.send('download', 'completed');
        const options = {
          type: 'info',
          buttons: ['Ok', 'Datei öffnen', 'Ordner öffnen'],
          title: 'Download',
          message: 'Download abgeschlossen',
        };
        if (!messageBoxIsDisplayed) {
          messageBoxIsDisplayed = true;
          dialog.showMessageBox(mainWindow, options).then((response) => {
            if (response.response === 1) {
              // shell.openPath(app.getPath('downloads'));
              shell.openPath(item.getSavePath());
            }
            if (response.response === 2) {
              // shell.openPath(app.getPath('downloads'));
              shell.openPath(path.dirname(item.getSavePath()));
            }
            messageBoxIsDisplayed = false;
          });
        }
      } else {
        mainWindow?.webContents.send('download', 'failed');
      }
    });
  }
  contents.session.on('will-download', handleDownloads);
});

app
  .whenReady()
  .then(() => {
    if (process.platform !== 'darwin') {
      const gotTheLock = app.requestSingleInstanceLock();
      if (!gotTheLock) {
        app.quit();
      } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
          // Someone tried to run a second instance, we should focus our window.
          if (mainWindow) {
            if (mainWindow?.isMinimized()) mainWindow?.restore();
            mainWindow?.show();
            mainWindow?.focus();
          }
        });
      }
    }
    createWindow();
  })
  .catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow && process.platform === 'darwin') {
    mainWindow?.show();
    mainWindow?.focus();
  }
});
