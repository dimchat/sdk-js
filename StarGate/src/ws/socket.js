;
// license: https://mit-license.org
//
//  Web Socket
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

/**
 *  Web Socket Client
 *  ~~~~~~~~~~~~~~~~~
 */

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;

    var connect = function (url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function (ev) {
            proxy.onConnected();
        };
        ws.onclose = function (ev) {
            proxy.onClosed();
        };
        ws.onerror = function (ev) {
            var error = new Error('WebSocket error: ' + ev);
            proxy.onError(error);
        };
        ws.onmessage = function (ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return;
            } else if (typeof data === 'string') {
                data = sys.format.UTF8.encode(data);
            } else if (data instanceof Uint8Array) {
                // do nothing
            } else {
                // convert ArrayLike<number> to Uint8Array
                data = new Uint8Array(data);
            }
            proxy.onReceived(data);
        };
        return ws;
    };

    var build_url = function (host, port) {
        if ('https' === window.location.protocol.split(':')[0]) {
            return 'wss://' + host + ':' + port;
        } else {
            return 'ws://' + host + ':' + port;
        }
    };
    // var parse_url = function (url) {
    //     var pos1 = url.indexOf('://');
    //     if (pos1 < 0) {
    //         throw new URIError('URl error: ' + url);
    //     }
    //     var scheme = url.substr(0, pos1);
    //     var host, port;
    //     pos1 += 3;
    //     var pos2 = url.indexOf('/', pos1 + 4);
    //     if (pos2 > pos1) {
    //         // ignore the tail
    //         url = url.substr(0, pos2);
    //     }
    //     pos2 = url.indexOf(':', pos1 + 4);
    //     if (pos2 > pos1) {
    //         host = url.substr(pos1, pos2 - pos1);
    //         port = parseInt(url.substr(pos2 + 1));
    //     } else {
    //         host = url.substr(pos1);
    //         if (scheme === 'ws' || scheme === 'http') {
    //             port = 80;
    //         } else if (scheme === 'wss' || scheme === 'https') {
    //             port = 443;
    //         } else {
    //             throw new URIError('URL scheme error: ' + scheme);
    //         }
    //     }
    //     return {
    //         'scheme': scheme,
    //         'host': host,
    //         'port': port
    //     };
    // };

    var Socket = function () {
        Object.call(this);
        this.__packages = [];
        this.__connected = -1;
        this.__closed = -1;
        this.__host = null;
        this.__port = null;
        this.__ws = null;
        this.__remote = null;
        this.__local = null;
    };
    Class(Socket, Object, null);

    Socket.prototype.getHost = function () {
        return this.__host;
    };
    Socket.prototype.getPort = function () {
        return this.__port;
    };

    Socket.prototype.onConnected = function () {
        this.__connected = true;
    };
    Socket.prototype.onClosed = function () {
        this.__closed = true;
    };
    Socket.prototype.onError = function (error) {
        this.__connected = false;
    };
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data);
    };

    // Override
    Socket.prototype.configureBlocking = function () {
        // do nothing
    };

    // Override
    Socket.prototype.isBlocking = function () {
        return false;
    };

    // Override
    Socket.prototype.isOpen = function () {
        return this.__closed === false;
    };

    // Override
    Socket.prototype.isConnected = function () {
        return this.__connected === true;
    };

    // Override
    Socket.prototype.isBound = function () {
        return this.__connected === true;
    };

    // Override
    Socket.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound());
    };

    // Override
    Socket.prototype.getRemoteAddress = function () {
        return this.__remote;
    };

    // Override
    Socket.prototype.getLocalAddress = function () {
        return this.__local;
    };

    // Override
    Socket.prototype.bind = function (local) {
        this.__local = local;
        // do nothing
    };

    /**
     *  Connect to remote address
     *
     * @param {SocketAddress} remote
     */
    // Override
    Socket.prototype.connect = function (remote) {
        this.close();
        this.__closed = false;
        this.__connected = false;
        this.__remote = remote;
        this.__host = remote.getHost();
        this.__port = remote.getPort();
        var url = build_url(this.__host, this.__port);
        this.__ws = connect(url, this);
    };

    // Override
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null;
        }
    };

    // Override
    Socket.prototype.read = function (maxLen) {
        if (this.__packages.length > 0) {
            return this.__packages.shift();
        } else {
            return null;
        }
    };

    // Override
    Socket.prototype.write = function (data) {
        this.__ws.send(data);
        return data.length;
    };

    // Override
    Socket.prototype.receive = function (maxLen) {
        return this.read(maxLen);
    };

    // Override
    Socket.prototype.send = function (data, remote) {
        return this.write(data);
    };

    //-------- namespace --------
    ns.ws.Socket = Socket;

})(StarGate, MONKEY);
