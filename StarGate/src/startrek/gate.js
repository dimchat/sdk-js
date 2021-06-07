;
// license: https://mit-license.org
//
//  Star Trek: Interstellar Transport
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
 *  Star Gate
 *  ~~~~~~~~~
 *
 *  Connected remote peer
 */

//! require 'starship.js'

(function (ns, sys) {
    "use strict";

    var Gate = function () {
    };
    sys.Interface(Gate, null);

    /**
     *  Get callback
     *
     * @return {GateDelegate} gate delegate
     */
    Gate.prototype.getDelegate = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Check whether Connection Status is expired for maintaining
     *
     * @return {boolean} true on waiting for heartbeat
     */
    Gate.prototype.isExpired = function () {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send payload to the remote peer
     *
     * @param {Uint8Array} payload     - request data
     * @param {int} priority           - smaller is faster, -1 means send it synchronously
     * @param {Ship.Delegate} delegate - completion handler
     * @return {boolean} false on error
     */
    Gate.prototype.sendPayload = function (payload, priority, delegate) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send ship carrying payload
     *
     * @param {StarShip} outgo - outgo ship
     * @return {boolean} false on error
     */
    Gate.prototype.sendShip = function (outgo) {
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  Connection
    //

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send data package
     *
     * @param {Uint8Array} pack - data package
     * @return {boolean} false on error
     */
    Gate.prototype.send = function (pack) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get received data from cache
     *
     * @param {int} length     - how many bytes to receive
     * @param {boolean} remove - whether remove from cache
     * @return {Uint8Array} received data
     */
    Gate.prototype.receive = function (length, remove) {
        console.assert(false, 'implement me!');
        return null;
    };

    //
    //  Ship Docking
    //

    // noinspection JSUnusedLocalSymbols
    /**
     *  Park this outgo Ship in a waiting queue for departure
     *
     * @param {StarShip} outgo - outgo ship
     * @return {boolean} false on duplicated
     */
    Gate.prototype.parkShip = function (outgo) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Pull out an outgo Ship from waiting queue
     *  1. Get a Ship(with SN as ID) and remove it from the Dock
     *  2. Get a new Ship(time == 0) and remove it from the Dock
     *
     * @param {Uint8Array|String} sn - ship ID (or '*' for any ship)
     * @return {StarShip} outgo Ship
     */
    Gate.prototype.pullShip = function (sn) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get any Ship timeout/expired (keep it in the waiting queue)
     *
     * @return {StarShip} outgo Ship
     */
    Gate.prototype.anyShip = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    //
    //  Gate Status
    //

    /**
     *  Get connection status
     *
     * @return {GateStatus} gate status
     */
    Gate.prototype.getStatus = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    var GateStatus = sys.type.Enum(null, {
        Error:     -1,
        Init:       0,
        Connecting: 1,
        Connected:  2
    });

    /**
     *  Gate Delegate
     *  ~~~~~~~~~~~~~
     */
    var GateDelegate = function () {
    };
    sys.Interface(GateDelegate, null);
    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when connection status changed
     *
     * @param {Gate} gate            - remote gate
     * @param {GateStatus} oldStatus - last status
     * @param {GateStatus} newStatus - current status
     */
    GateDelegate.prototype.onGateStatusChanged = function (gate, oldStatus, newStatus) {
        console.assert(false, 'implement me!');
    };
    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when new package received
     *
     * @param {Gate} gate      - remote gate
     * @param {Ship} ship      - data package container
     * @return {Uint8Array} response
     */
    GateDelegate.prototype.onGateReceived = function (gate, ship) {
        console.assert(false, 'implement me!');
        return null;
    };

    Gate.Status = GateStatus;
    Gate.Delegate = GateDelegate;

    //-------- namespace --------
    ns.Gate = Gate;

    ns.register('Gate');

})(StarTrek, MONKEY);
