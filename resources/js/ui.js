'use strict';
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
let ServerName = document.getElementById('ServerName');
let identidiv = document.getElementById('identidiv');
let wsHost = null;
let wsToken = null;
let remote = require('electron').remote;
let _window = remote.getCurrentWindow();
const ClientSyncer = remote.require('./syncer');

require('electron').ipcRenderer.on('UpdateUI', (event, message) => {
  console.log('Renderer:UpdateUI:message:' + message);
  ServerName.innerText = message.hostname;
  identidiv.innerHTML = message.identsvg;
  wsHost = message.wsHost;
  wsToken = message.wsToken;
  _window.show();
});

function SendYes() {
  console.log('Renderer:SendYes:' + wsHost + ',' + wsToken);
  ClientSyncer.Connect(wsHost, wsToken);
  close();
}

function SendNo() {
  console.log('Renderer:SendNo:' + wsHost + ',' + wsToken);
  wsHost = null;
  wsToken = null;
  close();
}