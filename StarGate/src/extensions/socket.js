;
// license: https://mit-license.org
//
//  Star Gate: Interfaces for network connection
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require 'fence.js'

!function (ns) {
    "use strict";

    var Fence = ns.extensions.Fence;

    /**
     *  Simple gate
     *
     * @param {StarDelegate} delegate
     * @constructor
     */
    var SocketClient = function (delegate) {
        Fence.call(this, delegate);
        this.ws = null;
    };
    DIMP.Class(SocketClient, Fence, null);

    /**
     *  Connect to a server
     *
     * @param {String} host
     * @param {Number} port
     */
    SocketClient.prototype.connect = function (host, port) {
        var protocol = 'ws';
        if ('https' === window.location.protocol.split(':')[0]) {
            protocol = 'wss';
        }
        var url = protocol + '://' + host + ':' + port;
        var ws = new WebSocket(url);
        ws.client = this;
        ws.onopen = function (ev) {
            this.client.onConnected();
        };
        ws.onclose = function (ev) {
            this.client.onClosed();
        };
        ws.onerror = function (ev) {
            var error = new Error('ws error: ' + ev);
            this.client.onError(error);
        };
        ws.onmessage = function (ev) {
            this.client.onReceived(ev.data);
        };
        this.ws = ws;
    };
    SocketClient.prototype.disconnect = function () {
        if (!this.ws) {
            return;
        }
        // if (this.ws.readyState)
        this.ws.close();
        this.ws = null;
    };

    SocketClient.prototype.onConnected = function () {
        Fence.prototype.onConnected.call(this);
        var task;
        while (true) {
            task = this.getTask();
            if (!task) {
                break;
            }
            this.ws.send(task.data);
            if (task.delegate) {
                task.delegate.onSent(task.data, null, this);
            }
        }
    };

    /**
     *  Send request data onto the connected server
     *
     * @param {Uint8Array} data
     * @param {StarDelegate|*} delegate
     */
    SocketClient.prototype.send = function (data, delegate) {
        if (this.isConnected()) {
            this.ws.send(data);
            if (delegate) {
                delegate.onSent(data, null, this);
            }
        } else {
            Fence.prototype.send.call(this, data, delegate);
        }
    };

    //-------- namespace --------
    ns.extensions.SocketClient = SocketClient;

    ns.extensions.register('SocketClient');

}(StarGate);
