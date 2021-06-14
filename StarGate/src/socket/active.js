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
 *  Memory cache for received data
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Runner = sys.threading.Runner;

    var Socket = ns.Socket;
    var Connection = ns.Connection;
    var BaseConnection = ns.BaseConnection;

    var ActiveConnection = function (host, port) {
        BaseConnection.call(this, null);
        this.__host = host;
        this.__port = port;
        this.__connecting = 0;
    };
    sys.Class(ActiveConnection, BaseConnection, null);

    var connect = function () {
        this.setStatus(Connection.Status.CONNECTING);
        try {
            var sock = new Socket(null);
            sock.connect(this.getHost(), this.getPort());
            this._socket = sock;
            this.setStatus(Connection.Status.CONNECTED);
            return true;
        } catch (e) {
            console.error('[WebSocket] failed to connect', this, e);
            this.setStatus(Connection.Status.ERROR);
            return false;
        }
    };

    var reconnect = function () {
        var redo;
        this.__connecting += 1;
        try {
            if (this.__connecting === 1 && !this._socket) {
                redo = connect.call(this);
            } else {
                redo = false;
            }
        } finally {
            this.__connecting -= 1;
        }
        return redo;
    };

    ActiveConnection.prototype.getSocket = function () {
        if (this.isRunning()) {
            if (!this._socket) {
                reconnect.call(this);
            }
            return this._socket;
        } else {
            return null;
        }
    };

    ActiveConnection.prototype.getHost = function () {
        return this.__host;
    };
    ActiveConnection.prototype.getPort = function () {
        return this.__port;
    };

    ActiveConnection.prototype.isRunning = function () {
        // return this.__running;
        return Runner.prototype.isRunning.call(this);
    };

    ActiveConnection.prototype._receive = function () {
        var data = BaseConnection.prototype._receive.call(this);
        if (!data && reconnect.call(this)) {
            // try again
            data = BaseConnection.prototype._receive.call(this);
        }
        return data;
    };

    ActiveConnection.prototype.send = function (data) {
        var res = BaseConnection.prototype.send.call(this, data);
        if (res < 0 && reconnect.call(this)) {
            // try again
            res = BaseConnection.prototype.send.call(this, data);
        }
        return res;
    };

    //-------- namespace --------
    ns.ActiveConnection = ActiveConnection;

    ns.registers('ActiveConnection');

})(StarGate, MONKEY);
