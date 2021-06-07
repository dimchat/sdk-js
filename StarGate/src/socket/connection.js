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
 *  Connection
 *  ~~~~~~~~~~
 *
 */

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Connection = function () {
    };
    sys.Interface(Connection, null);

    Connection.MAX_CACHE_LENGTH = 65536;  // 64 KB
    Connection.EXPIRES = 16 * 1000;  // 16 seconds

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send data package
     *
     * @param {Uint8Array} data - package
     * @return {int} count of bytes sent, -1 on error
     */
    Connection.prototype.send = function (data) {
        console.assert(false, 'implement me!');
        return 0;
    };

    /**
     *  Get received data count
     *
     * @return {uint} count of received data
     */
    Connection.prototype.available = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    /**
     *  Get received data from cache, but not remove
     *
     * @return {Uint8Array} received data
     */
    Connection.prototype.received = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get received data from cache, and remove it
     *  (call received() to check data first)
     *
     * @param {uint} maxLength - how many bytes to receive
     * @return {Uint8Array} received data
     */
    Connection.prototype.receive = function (maxLength) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get remote address
     *
     * @return {String} IP
     */
    Connection.prototype.getHost = function () {
        console.assert(false, 'implement me!');
        return null;
    };
    /**
     *  Get remote port
     *
     * @return {uint}
     */
    Connection.prototype.getPort = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    /**
     *  Close the connection
     */
    Connection.prototype.stop = function () {
        console.assert(false, 'implement me!');
    };

    /**
     *  Check whether connection is still running
     *
     * @return {boolean} true on running
     */
    Connection.prototype.isRunning = function () {
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Get status
     *
     * @return {ConnectionStatus} connection status
     */
    Connection.prototype.getStatus = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /*
     *  @enum ConnectionStatus
     *
     *  @abstract Defined for indicating connection status
     *
     *  @discussion connection status.
     *
     *      Default     - 'initialized', or sent timeout
     *      Connecting  - sent 'PING', waiting for response
     *      Connected   - got response recently
     *      Expired     - long time, needs maintaining (still connected)
     *      Maintaining - sent 'PING', waiting for response
     *      Error       - long long time no response, connection lost
     *
     *  Bits:
     *      0000 0001 - indicates sent something just now
     *      0000 0010 - indicates sent something not too long ago
     *
     *      0001 0000 - indicates received something just now
     *      0010 0000 - indicates received something not too long ago
     *
     *      (All above are just some advices to help choosing numbers :P)
     */
    var ConnectionStatus = sys.type.Enum(null, {
        Default:     (0x00),  // 0000 0000
        Connecting:  (0x01),  // 0000 0001, sent just now
        Connected:   (0x11),  // 0001 0001, received just now
        Maintaining: (0x21),  // 0010 0001, received not long ago, sent just now
        Expired:     (0x22),  // 0010 0010, received not long ago, needs sending
        Error:       (0x88)   // 1000 1000, long time no response
    });

    /*
     *    Finite States:
     *
     *             //===============\\          (Sent)          //==============\\
     *             ||               || -----------------------> ||              ||
     *             ||    Default    ||                          ||  Connecting  ||
     *             || (Not Connect) || <----------------------- ||              ||
     *             \\===============//         (Timeout)        \\==============//
     *                                                               |       |
     *             //===============\\                               |       |
     *             ||               || <-----------------------------+       |
     *             ||     Error     ||          (Error)                 (Received)
     *             ||               || <-----------------------------+       |
     *             \\===============//                               |       |
     *                 A       A                                     |       |
     *                 |       |            //===========\\          |       |
     *                 (Error) +----------- ||           ||          |       |
     *                 |                    ||  Expired  || <--------+       |
     *                 |       +----------> ||           ||          |       |
     *                 |       |            \\===========//          |       |
     *                 |       (Timeout)           |         (Timeout)       |
     *                 |       |                   |                 |       V
     *             //===============\\     (Sent)  |            //==============\\
     *             ||               || <-----------+            ||              ||
     *             ||  Maintaining  ||                          ||  Connected   ||
     *             ||               || -----------------------> ||              ||
     *             \\===============//       (Received)         \\==============//
     */

    var ConnectionDelegate = function () {
    };
    sys.Interface(ConnectionDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Call when connection status changed
     *
     * @param {Connection} connection      - current connection
     * @param {ConnectionStatus} oldStatus - status before
     * @param {ConnectionStatus} newStatus - status after
     */
    ConnectionDelegate.prototype.onConnectionStatusChanged = function (connection, oldStatus, newStatus) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Call when received data from a connection
     *  (if data processed, must call 'connection.receive(data.length)' to remove it from cache pool)
     *
     * @param {Connection} connection - current connection
     * @param {Uint8Array} data       - received data
     */
    ConnectionDelegate.prototype.onConnectionReceivedData = function (connection, data) {
        console.assert(false, 'implement me!');
    };

    Connection.Status = ConnectionStatus;
    Connection.Delegate = ConnectionDelegate;

    //-------- namespace --------
    ns.Connection = Connection;

    ns.register('Connection');

})(StarGate, MONKEY);
