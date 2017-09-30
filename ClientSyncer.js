'use strict';
let wsClient = null;
let mainWindow = null;
var URL = require('url');
module.exports = {
    Sync: function Sync(commandLine) {

        let protourl;
        /** @type {string} */
        let protostr = commandLine[commandLine.length-1];
        if (!protostr.startsWith('jarclient://')) return;
        try {
            let wsurl = URL.parse(protostr.substring('jarclient://'.length),true);
            mainWindow.wsUrl = wsurl;
        } catch (error) {
            
        }
    },
    Init: function Init(_wsClient, _mainWindow) {
        wsClient = _wsClient;
        mainWindow =_mainWindow;
    }
};