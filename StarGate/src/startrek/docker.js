;
// license: https://mit-license.org
//
//  Web Socket
//
//                               Written in 2022 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require 'arrival.js'
//! require 'departure.js'

(function (ns, sys) {
    "use strict";

    var Class          = sys.type.Class;
    var UTF8           = sys.format.UTF8;
    var Departure      = ns.port.Departure;
    var StarPorter     = ns.StarPorter;
    var PlainArrival   = ns.PlainArrival;
    var PlainDeparture = ns.PlainDeparture;

    /**
     *  Plain Docker
     *  ~~~~~~~~~~~~
     *
     * @param {SocketAddress} remote
     * @param {SocketAddress} local
     */
    var PlainPorter = function (remote, local) {
        StarPorter.call(this, remote, local);
    };
    Class(PlainPorter, StarPorter, null, {

        // protected
        createArrival: function (data) {
            return new PlainArrival(data, null);
        },

        // protected
        createDeparture: function (data, priority) {
            return new PlainDeparture(data, priority);
        },

        // Override
        getArrivals: function (data) {
            if (!data || data.length === 0) {
                return [];
            }
            return [this.createArrival(data)];
        },

        // Override
        checkArrival: function (income) {
            var data = income.getPayload();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    // PING -> PONG
                    this.send(PONG, Departure.Priority.SLOWER.getValue());
                    return null;
                } else if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                    // ignore
                    return null;
                }
            }
            return income;
        },

        //
        //  Sending
        //

        /**
         *  Send data with priority
         *
         * @param {Uint8Array} payload - data to be sent
         * @param {int} priority - smaller is faster
         */
        send: function (payload, priority) {
            var ship = this.createDeparture(payload, priority);
            return this.sendShip(ship);
        },

        // Override
        sendData: function (payload) {
            var priority = Departure.Priority.NORMAL.getValue();
            return this.send(payload, priority);
        },

        // Override
        heartbeat: function () {
            init_bytes();
            var priority = Departure.Priority.SLOWER.getValue();
            this.send(PING, priority);
        }
    });

    var bytes_equal = function (data1, data2) {
        if (data1.length !== data2.length) {
            return false;
        }
        for (var i = data1.length - 1; i >= 0; --i) {
            if (data1[i] !== data2[i]) {
                return false;
            }
        }
        return true;
    };

    var init_bytes = function () {
        if (typeof PING === 'string') {
            // init once
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP);
        }
    }
    var PING = 'PING';
    var PONG = 'PONG';
    var NOOP = 'NOOP';

    //-------- namespace --------
    ns.PlainPorter = PlainPorter;

})(StarGate, MONKEY);
