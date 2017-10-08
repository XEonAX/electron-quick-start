'use strict';
const events = require('events');
const WebSocket = require('ws')
const HttpsProxyAgent = require('https-proxy-agent');
// let
var url = require('url');
var options = url.parse('http://127.0.0.1:8888');
var secoptions = url.parse('https://127.0.0.1:8888');

var agent = new HttpsProxyAgent(options);
var secagent = new HttpsProxyAgent(secoptions);
/**
 * Enum for msg action values.
 * @readonly
 * @enum {string}
 */
const Actions = {
    notice: 'notice'
};

/**
 * Enum for notice msg notices.
 * @readonly
 * @enum {string}
 */
const Notices = {
    subscribed: 'subscribed',
    browserdisconnected: 'browserdisconnected',
    logout: 'logout',
};

var wsclient = module.exports = {
    /**
     *  @type {Object.<string, WebSocket>}
     */
    Connections: {},
    Emitter: new events.EventEmitter(),

    /**
     * 
     * 
     * @param {string} url 
     */
    Connect: function Connect(url) {

        console.log('WSCLIENT:Connect:' + url);
        if (this.Connections[url] != null) {
            console.log('WSCLIENT:Connect:Connection exist in Connections:' + url);
            this.Emitter.emit('connect', url);
        } else {
            console.log('WSCLIENT:Connect:New connection to create:' + url);
            var ws = new WebSocket(url, url.startsWith('wss') ? {
                agent: secagent
            } : {
                agent: agent
            });
            ws.addEventListener('open', this.Handlers.OnOpen);
            ws.addEventListener('close', this.Handlers.OnClose);
            ws.addEventListener('message', this.Handlers.OnMessage);
            ws.addEventListener('error', this.Handlers.OnError);
        }
    },
    Subscribe: function Connect(url, ctoken) {
        console.log('WSCLIENT:Subscribe:' + url + ctoken);
        if (this.Connections[url] != null) {
            this.Connections[url].send(JSON.stringify({
                action: 'subscribe',
                ctoken: ctoken
            }), function (err) {
                if (err)
                    console.error('WSCLIENT:Subscribe:Error:' + err);
            });
        }

    },
    Tick: function Tick(servers, tickMsg) {
        console.log('WSCLIENT:Tick:' + servers);
        for (var url in servers) {
            if (servers.hasOwnProperty(url)) {
                var ctokens = servers[url];
                tickMsg.ctokens=Object.keys(ctokens);
                this.Connections[url].send(JSON.stringify(tickMsg), function (err) {
                    if (err)
                        console.error('WSCLIENT:Tick:Error:' + err);
                });
            }
        }
    },
    Handlers: {
        /**
         * 
         * 
         * @param {object} ev 
         * @param {WebSocket} ev.target
         */
        OnOpen: function OnOpen(ev) {
            console.log('WSCLIENT:Handlers:OnOpen:' + ev.target.url);
            wsclient.Connections[ev.target.url] = ev.target;
            wsclient.Emitter.emit('connect', ev.target.url, ev.target);
        },
        /**
         * 
         * 
         * @param {object} ev 
         * @param {boolean} ev.wasClean
         * @param {number} ev.code 
         * @param {string} ev.reason 
         * @param {WebSocket} ev.target 
         */
        OnClose: function OnClose(ev) {
            console.log('WSCLIENT:Handlers:OnClose:' + ev.target.url);
            delete wsclient.Connections[ev.target.url];
            wsclient.Emitter.emit('disconnect', ev.target.url, ev.target);
        },

        /**
         * 
         * 
         * @param {object} ev 
         * @param {object} ev.data
         * @param {string} ev.type
         * @param {WebSocket} ev.target
         *  
         */
        OnMessage: function OnMessage(ev) {
            console.log('WSCLIENT:Handlers:OnMessage:' + ev.target.url + ':' + ev.data);

            var msg = JSON.parse(ev.data);
            console.log('WSCLIENT:Handlers:OnMessage:msg' + msg);

            switch (msg.action) {
                case Actions.notice:
                    switch (msg.notice) {
                        case Notices.subscribed:
                            wsclient.Emitter.emit('subscribed', msg.ctoken);
                            break;
                        case Notices.browserdisconnected:
                            wsclient.Emitter.emit('browserdisconnected', msg.ctoken);
                            break;
                        case Notices.logout:
                            wsclient.Emitter.emit('logout', msg.ctoken);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }

        },
        /**
         * 
         * 
         * @param {Error} err 
         */
        OnError: function OnError(err) {
            console.log('WSCLIENT:Handlers:OnError:' + err);
        },
    }


}