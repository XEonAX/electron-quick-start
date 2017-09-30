'use strict';
const electron = require('electron');

require('electron-debug')({
  enabled: true
});
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const clientSyncer = require('./ClientSyncer');

const wsClient = require('./wsClient');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let appIcon = null;

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  clientSyncer.Sync(commandLine);
});

if (isSecondInstance) {
  app.quit();
  return;
}


function createTrayIcon() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 931,
    height: 262,
    show: false,
    frame: false,
    transparent: true,
    resizable: false
  });

  clientSyncer.Init(wsClient, mainWindow);
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('close', function (e) {
    e.preventDefault();
    mainWindow.hide();
  });
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  console.log('defproto' + app.setAsDefaultProtocolClient('jarclient'));//Keep this commented or uncommented on the type of build

  const iconName = process.platform === 'win32' ? 'jar-client.ico' : 'jar-client.png';
  const iconPath = path.join(__dirname, 'resources', 'img', iconName);
  appIcon = new electron.Tray(iconPath);
  const contextMenu = electron.Menu.buildFromTemplate(
    [{
      label: 'Show Confirmation Window',
      click: function () {
        mainWindow.show();
      }
    }, {
      label: 'Exit',
      click: function () {
        app.exit();
      }
    }, {
      label: 'Uninstall',
      click: function () {
        app.removeAsDefaultProtocolClient('jarx');
      }
    }]
  );
  appIcon.setToolTip('JAR - Client');
  appIcon.setContextMenu(contextMenu);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createTrayIcon);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createTrayIcon();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.