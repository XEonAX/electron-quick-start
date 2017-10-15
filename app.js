'use strict';
const electron = require('electron');
const constants = require('./constants');
const clipboardWatcher = require('electron-clipboard-watcher');

/**
 * @type {clipboardWatcher}
 */
let watcher;
require('electron-debug')({
  enabled: true
});
console.log('App:Starting...');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const syncer = require('./syncer');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow;
let appIcon = null;

const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  console.log('App:NextInstanceLaunched:' + commandLine);
  //setTimeout(syncer.Sync,100,commandLine);
  syncer.Sync(commandLine);
});

if (isSecondInstance) {
  console.log('App:QuitNextInstance');
  app.quit();
  return;
}


function createMainWindowAndTrayIcon() {
  // Create the browser window.

  console.log('App:CreateMainWindow');
  mainWindow = new BrowserWindow({
    width: 940,
    height: 280,
    show: false,
    frame: false,
    transparent: true,
    resizable: false //constants.DebugMode //Resizable in Debug Mode
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  syncer.Init(mainWindow);

  // Open the DevTools.
  if (constants.DebugMode)
    mainWindow.webContents.openDevTools();

  mainWindow.on('close', function (e) {
    console.log('App:MainWindow:Close->Hide');
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
  console.log('APP:ProcessExePath:' + process.execPath)

  const iconName = process.platform === 'win32' ? 'jar-client.ico' : 'jar-client.png';
  const iconPath = path.join(__dirname, 'resources', 'img', iconName);

  console.log('APP:CreateTray');
  appIcon = new electron.Tray(iconPath);
  const contextMenu = electron.Menu.buildFromTemplate(
    [{
      label: 'Show Confirmation Window',
      click: function () {
        mainWindow.show();
      }
    }, {
      label: 'Uninstall',
      click: function () {
        app.removeAsDefaultProtocolClient(constants.Protocol);
      }
    }, {
      label: 'Monitor Clipboard',
      click: function (menuitem) {
        if (menuitem.checked) {
          StartWatcher();
        } else if (watcher != null)
          watcher.stop();
      },
      type: "checkbox"
    }, {
      label: 'Exit',
      click: function () {
        app.exit();
      }
    }]
  );

  console.log('APP:SetContextMenuAndTitle');
  appIcon.setToolTip(constants.Title);
  appIcon.setContextMenu(contextMenu);

  let DefaultProtocolHandlerSet;
  if (!constants.DebugMode) {
    DefaultProtocolHandlerSet = app.setAsDefaultProtocolClient(constants.Protocol);
    console.log('APP:SetProtoHandler:' + constants.Protocol + ':' + DefaultProtocolHandlerSet);
  } else {
    console.log('APP:ProtoHandlerCMD:' + '"' + path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe') + '" "' + __dirname + '" "%1"');
    DefaultProtocolHandlerSet = app.setAsDefaultProtocolClient(constants.Protocol, path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe'), [__dirname]);
    console.log('APP:SetProtoHandler:' + constants.Protocol + ':' + DefaultProtocolHandlerSet);
  }

  if (!DefaultProtocolHandlerSet) {
    contextMenu.items[2].checked = true;
    StartWatcher();
  }

  console.log('APP:AttemptFirstClientInstanceClientSync');
  mainWindow.once('ready-to-show', function () {
    syncer.Sync(process.argv)
  });
  //setTimeout(syncer.Sync,500,process.argv);
  //syncer.Sync(process.argv);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindowAndTrayIcon);

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindowAndTrayIcon();
  }
});


function StartWatcher() {
  console.log('APP:clipboardWatcher:Start');
  watcher = clipboardWatcher({
    watchDelay: 1000,
    onTextChange: function (text) {
      if (text.startsWith(constants.Protocol)) {
        console.log('APP:clipboardWatcher:textStartWithProto' + text);
        electron.clipboard.clear();
        syncer.Sync([text]);
      }
    }
  });
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.