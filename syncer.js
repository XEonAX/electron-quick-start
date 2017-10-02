'use strict';
let wsclient = null;

var jdenticon = require('./node_modules/jdenticon/dist/jdenticon');
/**
 * Connection Confirmation Window
 * @type {Electron.BrowserWindow}
 */
let mainWindow = null;
var URL = require('url');
module.exports = {
    /**
     * Initialize the Client Syncer
     * 
     * @param {any} _wssclient Websockets client 
     * @param {Electron.BrowserWindow} _mainWindow Connection Confirmation UI 
     */
    Init: function Init(_wssclient, _mainWindow) {
        console.log('Syncer:Init..');
        wsclient = _wssclient;
        mainWindow = _mainWindow;
    },
    /**
     * Shows the MainWindow with Server name and Ident according to protocol launcher commandline
     * 
     * @param {string[]} commandLine Must contain an argument starting with `jarclient://`
     */
    Sync: function Sync(commandLine) {
        console.log('Syncer:Sync:' + commandLine);
        let protostr = commandLine[commandLine.length - 1];
        if (!protostr.startsWith('jarclient://'))
            return;
        try {
            let wsurl = URL.parse(protostr.substring('jarclient://'.length), true);
            console.log('Syncer:Sync:GotValidWSUrl:' + wsurl.href);
            if (!mainWindow.isVisible()) {
                mainWindow.webContents.send("UpdateUI", {
                    hostname: wsurl.hostname,
                    identsvg: jdenticon.toSvg(wsurl.href, 200, 0.1),
                    wsHost: wsurl.protocol + '//' + wsurl.host,
                    wsToken: wsurl.pathname.substr(1)
                });
            }
        } catch (error) {
            console.error('Syncer:Sync:UrlError:' + error);
        }
    },
    /**
     * Establish websocket connection to wsHost and subscribe to a room identified by the Token 
     * 
     * @param {string} _wsHost 
     * @param {string} _wsToken 
     */
    Connect: function Connect(_wsHost, _wsToken) {
        console.log('Syncer:Connect:' + _wsHost + ',' + _wsToken);
    }
};