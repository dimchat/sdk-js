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
            proxy.onReceived(ev.data);
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
    var parse_url = function (url) {
        var pos1 = url.indexOf('://');
        if (pos1 < 0) {
            throw new URIError('URl error: ' + url);
        }
        var scheme = url.substr(0, pos1);
        var host, port;
        pos1 += 3;
        var pos2 = url.indexOf('/', pos1 + 4);
        if (pos2 > pos1) {
            // ignore the tail
            url = url.substr(0, pos2);
        }
        pos2 = url.indexOf(':', pos1 + 4);
        if (pos2 > pos1) {
            host = url.substr(pos1, pos2 - pos1);
            port = parseInt(url.substr(pos2 + 1));
        } else {
            host = url.substr(pos1);
            if (scheme === 'ws' || scheme === 'http') {
                port = 80;
            } else if (scheme === 'wss' || scheme === 'https') {
                port = 443;
            } else {
                throw new URIError('URL scheme error: ' + scheme);
            }
        }
        return {
            'scheme': scheme,
            'host': host,
            'port': port
        };
    };

    var obj = sys.type.Object;

    var Socket = function (url) {
        obj.call(this);
        this.__packages = [];
        this.__connected = false;
        if (url) {
            var info = parse_url(url);
            this.__host = info['host'];
            this.__port = info['port'];
            this.__ws = connect(url, this);
        } else {
            this.__host = null;
            this.__port = null;
            this.__ws = null;
        }
    };
    sys.Class(Socket, obj, null);

    Socket.prototype.getHost = function () {
        return this.__host;
    };
    Socket.prototype.getPort = function () {
        return this.__port;
    };

    Socket.prototype.connect = function (host, port) {
        this.close();
        this.__ws = connect(build_url(host, port), this);
    };
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null;
        }
        this.__connected = false;
    };

    Socket.prototype.isConnected = function () {
        return this.__connected;
    };

    Socket.prototype.onConnected = function () {
        this.__connected = true;
    };
    Socket.prototype.onClosed = function () {
        this.__connected = false;
    };
    Socket.prototype.onError = function (error) {
        // this.__connected = false;
    };
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data);
    };

    Socket.prototype.send = function (data) {
        this.__ws.send(data);
    };
    Socket.prototype.receive = function () {
        if (this.__packages.length > 0) {
            return this.__packages.shift();
        } else {
            return null;
        }
    };

    //-------- namespace --------
    ns.Socket = Socket;

    ns.register('Socket');

})(StarGate, MONKEY);
