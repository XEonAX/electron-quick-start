'use strict';
console.log('Syncer:Required');
var jdenticon = require('./node_modules/jdenticon/dist/jdenticon');
const notifier = require('node-notifier');
const path = require('path');
const constants = require('./constants');
/**
 * Connection Confirmation Window
 * @type {Electron.BrowserWindow}
 */
let mainWindow = null;
var URL = require('url');


/**
 * Enum for Room State values.
 * @readonly
 * @enum {number}
 */
const RoomStates = {
    new: 0,
    subscribing: 1,
    subscribed: 2,
    disconnected: 3
};
var wscx = require('./wsclient');
const ticker = require('./ticker')
var syncer = module.exports = {
    /**
     * Initialize the Client Syncer
     * 
     * @param {Electron.BrowserWindow} _mainWindow Connection Confirmation UI 
     */
    Init: function Init(_mainWindow) {
        console.log('Syncer:Init..');
        mainWindow = _mainWindow;
        wscx.Emitter.on('connect', this.Handlers.OnConnect);
        wscx.Emitter.on('disconnect', this.Handlers.OnDisconnect);
        wscx.Emitter.on('browserdisconnected', this.Handlers.OnBrowserDisconnected);
        wscx.Emitter.on('browserconnected', this.Handlers.OnBrowserConnected);
        wscx.Emitter.on('subscribed', this.Handlers.OnSubscribed);
        wscx.Emitter.on('logout', this.Handlers.OnLogout);
    },
    /**
     * Shows the MainWindow with Server name and Ident according to protocol launcher commandline
     * 
     * @param {string[]} commandLine Must contain an argument starting with `jarclient://`
     */
    Sync: function Sync(commandLine) {
        console.log('Syncer:Sync:' + commandLine);
        let protostr = commandLine[commandLine.length - 1];
        mainWindow.webContents.executeJavaScript('console.log("protostr:' + protostr + '");');
        if (!protostr.startsWith('jarclient://'))
            return;
        try {
            let wsurl = URL.parse(protostr.substring('jarclient://'.length), true);
            let wsHostUrl = wsurl.protocol + '//' + wsurl.host;
            let wsToken = wsurl.pathname.substr(1);

            console.log('Syncer:Sync:GotValidWSUrl:' + wsurl.href);
            if (this.Rooms[wsToken] != null) {
                console.log('Syncer:Sync:Room Exists for ctoken:' + wsToken);
                this.Rooms[wsToken].state = RoomStates.new;
            } else {
                console.log('Syncer:Sync:New room for ctoken:' + wsToken);
                this.Rooms[wsToken] = {
                    state: RoomStates.new,
                    ctoken: wsToken,
                    url: wsHostUrl
                };
            }
            if (!mainWindow.isVisible()) {
                mainWindow.webContents.send("UpdateUI", {
                    hostname: wsurl.hostname,
                    identsvg: jdenticon.toSvg(wsurl.href+ constants.PreSharedSecret, 200, 0),
                    wsHost: wsHostUrl,
                    wsToken: wsToken
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
        wscx.Connect(_wsHost);
    },
    Tick: function Tick(tickMsg) {
        console.log('Syncer:Tick:' + tickMsg);
        var Servers = {};
        for (var ctoken in this.Rooms) {
            if (this.Rooms.hasOwnProperty(ctoken)) {
                var room = this.Rooms[ctoken];
                if (room.state == RoomStates.subscribed) {
                    if (Servers[room.url] == null) Servers[room.url] = {};
                    Servers[room.url][room.ctoken] = true;
                }
            }
        }
        if (Object.keys(Servers).length > 0)
            wscx.Tick(Servers, tickMsg);
    },
    Handlers: {
        OnConnect: function (hostname) {
            console.log('Syncer:Handlers:OnConnect:' + hostname);
            notifier.notify({
                title: constants.Title,
                message: 'Connected to ' + hostname,
                icon: path.join(__dirname, 'resources', 'img', 'jar-client.png'), // Absolute path (doesn't work on balloons)
                sound: false, // Only Notification Center or Windows Toasters
                wait: false // Wait with callback, until user action is taken against notification
            });
            for (var ctoken in syncer.Rooms) {
                if (syncer.Rooms.hasOwnProperty(ctoken)) {
                    var room = syncer.Rooms[ctoken];
                    if (room.url == hostname && room.state == RoomStates.new) {
                        room.state = RoomStates.subscribing;
                        wscx.Subscribe(room.url, room.ctoken);
                    }
                }
            }
        },
        OnDisconnect: function (hostname) {
            notifier.notify({
                title: constants.Title,
                message: 'Disconnected from ' + hostname,
                icon: path.join(__dirname, 'resources', 'img', 'jar-client.png'), // Absolute path (doesn't work on balloons)
                sound: false, // Only Notification Center or Windows Toasters
                wait: false // Wait with callback, until user action is taken against notification
            });
            for (var ctoken in syncer.Rooms) {
                if (syncer.Rooms.hasOwnProperty(ctoken)) {
                    var room = syncer.Rooms[ctoken];
                    if (room.url == hostname)
                        delete syncer.Rooms[ctoken];
                }
            }
            var pauseTicker = true;
            for (var _ctoken in syncer.Rooms) {
                if (syncer.Rooms.hasOwnProperty(_ctoken)) {
                    var _room = syncer.Rooms[_ctoken];
                    if (_room.state == RoomStates.subscribed) {
                        pauseTicker = false;
                        break;
                    }
                }
            }
            if (pauseTicker) {
                ticker.Pause();
            }
        },
        OnBrowserConnected: function (ctoken) {
            syncer.Rooms[ctoken].state = RoomStates.subscribed;
            ticker.Start();
        },
        OnBrowserDisconnected: function (ctoken) {
            syncer.Rooms[ctoken].state = RoomStates.disconnected;

            var pauseTicker = true;
            for (var _ctoken in syncer.Rooms) {
                if (syncer.Rooms.hasOwnProperty(_ctoken)) {
                    var _room = syncer.Rooms[_ctoken];
                    if (_room.state == RoomStates.subscribed) {
                        pauseTicker = false;
                        break;
                    }
                }
            }
            if (pauseTicker) {
                ticker.Pause();
            }
        },
        OnLogout: function (ctoken) {
            delete syncer.Rooms[ctoken];

            var pauseTicker = true;
            for (var _ctoken in syncer.Rooms) {
                if (syncer.Rooms.hasOwnProperty(_ctoken)) {
                    var _room = syncer.Rooms[_ctoken];
                    if (_room.state == RoomStates.subscribed) {
                        pauseTicker = false;
                        break;
                    }
                }
            }
            if (pauseTicker) {
                ticker.Pause();
            }
        },
        OnSubscribed: function (ctoken) {
            if (syncer.Rooms[ctoken] != null && syncer.Rooms[ctoken].state == RoomStates.subscribing) {
                syncer.Rooms[ctoken].state = RoomStates.subscribed;
                ticker.Start();
                notifier.notify({
                    title: constants.Title,
                    message: 'Subscribed to ' + syncer.Rooms[ctoken].url,
                    icon: path.join(__dirname, 'resources', 'img', 'jar-client.png'), // Absolute path (doesn't work on balloons)
                    sound: false, // Only Notification Center or Windows Toasters
                    wait: false // Wait with callback, until user action is taken against notification
                });
            }
        },

    },

    /**
     * @typedef {Object} Room
     * @property {RoomState} state
     * @property {string} url
     * @property {string} ctoken
     */

    /**
     * @type {Object<string,Room>}
     */
    Rooms: {},
};