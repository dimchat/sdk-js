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

//! require 'connection.js'
//! require 'mem.js'

(function (ns, sys) {
    "use strict";

    var Runner = sys.threading.Runner;

    var MemoryCache = ns.MemoryCache;
    var Connection = ns.Connection;

    var BaseConnection = function (socket) {
        Runner.call(this);
        this._socket = socket;  // connected Socket
        this.__cache = this.createCachePool();
        this.__delegate = null;
        this.__status = Connection.Status.DEFAULT;
        this.__lastSentTime = 0;
        this.__lastReceivedTime = 0;
    };
    sys.Class(BaseConnection, Runner, [Connection]);

    BaseConnection.prototype.createCachePool = function () {
        return new MemoryCache();
    };

    BaseConnection.prototype.getDelegate = function () {
        return this.__delegate;
    };
    BaseConnection.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };

    //
    //  Socket
    //

    /**
     *  Get connected socket
     */
    BaseConnection.prototype.getSocket = function () {
        if (this.isRunning()) {
            return this._socket;
        } else {
            return null;
        }
    };

    BaseConnection.prototype.getHost = function () {
        var sock = this._socket;
        if (sock) {
            return sock.getHost();
        } else {
            return null;
        }
    };
    BaseConnection.prototype.getPort = function () {
        var sock = this._socket;
        if (sock) {
            return sock.getPort();
        } else {
            return 0;
        }
    };

    BaseConnection.prototype.isRunning = function () {
        var sock = this._socket;
        return sock && sock.isConnected();
    };

    var write = function (data) {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error('socket lost, cannot write data: ' + data.length + ' byte(s)');
        }
        sock.send(data);
        this.__lastSentTime = (new Date()).getTime();
        return data.length;
    };
    var read = function () {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error('socket lost, cannot read data');
        }
        var data = sock.receive();
        if (data) {
            this.__lastReceivedTime = (new Date()).getTime();
        }
        return data;
    };

    var close = function () {
        var sock = this._socket;
        if (sock && sock.isConnected()) {
            sock.close();
        }
        this._socket = null;
    };

    BaseConnection.prototype._receive = function () {
        try {
            return read.call(this);
        } catch (e) {
            // [TCP] failed to receive data
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null;
        }
    };
    BaseConnection.prototype.send = function (data) {
        try {
            return write.call(this, data);
        } catch (e) {
            // [TCP] failed to send data
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null;
        }
    };

    BaseConnection.prototype.available = function () {
        return this.__cache.length();
    };

    BaseConnection.prototype.received = function () {
        return this.__cache.all();
    };

    BaseConnection.prototype.receive = function (maxLength) {
        return this.__cache.shift(maxLength);
    };

    //
    //  Status
    //

    BaseConnection.prototype.getStatus = function () {
        var now = new Date();
        fsm_tick.call(this, now.getTime());
        return this.__status;
    };
    BaseConnection.prototype.setStatus = function (newStatus) {
        var oldStatus = this.__status;
        if (oldStatus.equals(newStatus)) {
            return;
        }
        this.__status = newStatus;
        if (newStatus.equals(Connection.Status.CONNECTED) &&
            !oldStatus.equals(Connection.Status.MAINTAINING)) {
            // change status to 'connected', reset times to just expired
            var now = (new Date()).getTime();
            this.__lastSentTime = now - Connection.EXPIRES - 1;
            this.__lastReceivedTime = now - Connection.EXPIRES - 1;
        }
        // callback
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionStatusChanged(this, oldStatus, newStatus);
        }
    };

    //
    //  Runner
    //

    BaseConnection.prototype.stop = function () {
        close.call(this);
        Runner.prototype.stop.call(this);
    };

    BaseConnection.prototype.setup = function () {
        this.setStatus(Connection.Status.CONNECTING);
    };

    BaseConnection.prototype.finish = function () {
        close.call(this);
        this.setStatus(Connection.Status.DEFAULT);
    };

    /**
     *  Try to receive one data package,
     *  which will be cached into a memory pool
     */
    BaseConnection.prototype.process = function () {
        // 0. check empty spaces
        var count = this.__cache.length();
        if (count >= Connection.MAX_CACHE_LENGTH) {
            // not enough spaces
            return false;
        }
        // 1. try to read bytes
        var data = this._receive();
        if (!data || data.length === 0) {
            // receive nothing to process now
            return false;
        }
        // 2. cache it
        this.__cache.push(data);
        var delegate = this.getDelegate();
        if (delegate) {
            // 3. callback
            delegate.onConnectionReceivedData(this, data);
        }
        return true;
    };

    //
    //  Finite State Machine
    //

    var fsm_tick = function (now) {
        var tick = evaluations[this.__status];
        if (typeof tick === 'function') {
            tick.call(this, now);
        } else {
            throw new EvalError('connection status error: ' + this.__status);
        }
    };

    var evaluations = {
    };
    // Connection not started yet
    evaluations[Connection.Status.DEFAULT] = function (now) {
        if (this.isRunning()) {
            // connection started, change status to 'connecting'
            this.setStatus(Connection.Status.CONNECTING);
        }
    };
    // Connection started, not connected yet
    evaluations[Connection.Status.CONNECTING] = function (now) {
        if (!this.isRunning()) {
            // connection stopped, change status to 'not_connect'
            this.setStatus(Connection.Status.DEFAULT);
        } else if (this.getSocket() != null) {
            // connection connected, change status to 'connected'
            this.setStatus(Connection.Status.CONNECTED);
        }
    };
    // Normal status of connection
    evaluations[Connection.Status.CONNECTED] = function (now) {
        if (this.getSocket() == null) {
            // connection lost, change status to 'error'
            this.setStatus(Connection.Status.ERROR);
        } else if (now > this.__lastReceivedTime + Connection.EXPIRES) {
            // long time no response, change status to 'maintain_expired'
            this.setStatus(Connection.Status.EXPIRED);
        }
    };
    // Long time no response, need maintaining
    evaluations[Connection.Status.EXPIRED] = function (now) {
        if (this.getSocket() == null) {
            // connection lost, change status to 'error'
            this.setStatus(Connection.Status.ERROR);
        } else if (now < this.__lastSentTime + Connection.EXPIRES) {
            // sent recently, change status to 'maintaining'
            this.setStatus(Connection.Status.MAINTAINING);
        }
    };
    // Heartbeat sent, waiting response
    evaluations[Connection.Status.MAINTAINING] = function (now) {
        if (this.getSocket() == null) {
            // connection lost, change status to 'error'
            this.setStatus(Connection.Status.ERROR);
        } else if (now > this.__lastReceivedTime + (Connection.EXPIRES << 4)) {
            // long long time no response, change status to 'error
            this.setStatus(Connection.Status.ERROR);
        } else if (now < this.__lastReceivedTime + Connection.EXPIRES) {
            // received recently, change status to 'connected'
            this.setStatus(Connection.Status.CONNECTED);
        } else if (now > this.__lastSentTime + Connection.EXPIRES) {
            // long time no sending, change status to 'maintain_expired'
            this.setStatus(Connection.Status.EXPIRED);
        }
    };
    // Connection lost
    evaluations[Connection.Status.ERROR] = function (now) {
        if (!this.isRunning()) {
            // connection stopped, change status to 'not_connect'
            this.setStatus(Connection.Status.DEFAULT);
        } else if (this.getSocket() != null) {
            // connection reconnected, change status to 'connected'
            this.setStatus(Connection.Status.CONNECTED);
        }
    };

    //-------- namespace --------
    ns.BaseConnection = BaseConnection;

    ns.register('BaseConnection');

})(StarGate, MONKEY);
