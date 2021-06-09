;
// license: https://mit-license.org
//
//  Star Gate: Interfaces for network connection
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

//! require 'startrek/stargate.js'
//! require 'socket/connection.js'
//! require 'docker.js'

(function (ns, base, sys) {
    "use strict";

    var Gate = base.Gate;
    var StarGate = base.StarGate;

    var Connection = ns.Connection;
    var WSDocker = ns.WSDocker;

    var WSGate = function (connection) {
        StarGate.call(this);
        this.connection = connection;
    };
    sys.Class(WSGate, StarGate, [Connection.Delegate]);

    WSGate.prototype.createDocker = function () {
        return new WSDocker(this);
    };

    WSGate.prototype.isRunning = function () {
        var running = StarGate.prototype.isRunning.call(this);
        return running && this.connection.isRunning();
    };

    WSGate.prototype.isExpired = function () {
        var status = this.connection.getStatus();
        return Connection.Status.EXPIRED.equals(status);
    };

    WSGate.prototype.getStatus = function () {
        var status = this.connection.getStatus();
        return WSGate.getStatus(status);
    };
    WSGate.getStatus = function (connStatus) {
        if (Connection.Status.CONNECTING.equals(connStatus)) {
            // CONNECTING -> CONNECTING
            return Gate.Status.CONNECTING;
        } else if (Connection.Status.CONNECTED.equals(connStatus)) {
            // CONNECTED -> CONNECTED
            return Gate.Status.CONNECTED;
        } else if (Connection.Status.MAINTAINING.equals(connStatus)) {
            // MAINTAINING -> CONNECTED
            return Gate.Status.CONNECTED;
        } else if (Connection.Status.EXPIRED.equals(connStatus)) {
            // EXPIRED -> CONNECTED
            return Gate.Status.CONNECTED;
        } else if (Connection.Status.ERROR.equals(connStatus)) {
            // ERROR -> ERROR
            return Gate.Status.ERROR;
        } else {
            // DEFAULT -> INIT
            return Gate.Status.INIT;
        }
    };

    WSGate.prototype.send = function (pack) {
        var conn = this.connection;
        if (conn.isRunning()) {
            return conn.send(pack) === pack.length;
        } else {
            return false;
        }
    };

    WSGate.prototype.receive = function (length, remove) {
        var available = this.connection.available();
        if (available < length) {
            return null;
        }
        return this.connection.receive(length);
    };

    //
    //  Connection Delegate
    //

    WSGate.prototype.onConnectionStatusChanged = function (connection, oldStatus, newStatus) {
        var s1 = WSGate.getStatus(oldStatus);
        var s2 = WSGate.getStatus(newStatus);
        if (!s1.equals(s2)) {
            var delegate = this.getDelegate();
            if (delegate) {
                delegate.onGateStatusChanged(this, s1, s2);
            }
        }
    };

    WSGate.prototype.onConnectionReceivedData = function (connection, data) {
        // received data will be processed in run loop,
        // do nothing here
    };

    //-------- namespace --------
    ns.WSGate = WSGate;

    ns.registers('WSGate');

})(StarGate, StarTrek, MONKEY);
