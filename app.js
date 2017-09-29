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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let appIcon = null;

function createTrayIcon() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  console.log('defproto'+ app.setAsDefaultProtocolClient('jarx'));

  const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  
  if (isSecondInstance) {
    app.quit()
  }
  const iconName = process.platform === 'win32' ? 'jar-client.ico' : 'jar-client.png';
  const iconPath = path.join(__dirname, 'resources', iconName);
  appIcon = new electron.Tray(iconPath);
  const contextMenu = electron.Menu.buildFromTemplate([{
    label: 'Exit',
    click: function () {
      app.exit();
    }
  }, {
    label: 'Uninstall',
    click: function () {
      app.removeAsDefaultProtocolClient('jarx');;
    }
  }]);
  appIcon.setToolTip('JAR - Client');
  appIcon.setContextMenu(contextMenu)

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createTrayIcon);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
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