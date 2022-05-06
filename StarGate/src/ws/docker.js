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

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var ArrivalShip = ns.ArrivalShip;

    /**
     *  Plain Arrival Ship
     *  ~~~~~~~~~~~~~~~~~~
     *
     * @param {Uint8Array} data - data received
     * @param {number|null} now - received time
     */
    var PlainArrival = function (data, now) {
        ArrivalShip.call(this, now);
        this.__data = data;
    };
    sys.Class(PlainArrival, ArrivalShip, null, null);

    PlainArrival.prototype.getPackage = function () {
        return this.__data;
    };

    // Override
    PlainArrival.prototype.getSN = function () {
        // plain ship has no SN
        return null;
    };

    // Override
    PlainArrival.prototype.assemble = function (arrival) {
        console.assert(arrival === this, 'plain arrival error', arrival, this);
        // plain arrival needs no assembling
        return arrival;
    };

    //-------- namespace --------
    ns.ws.PlainArrival = PlainArrival;

    ns.ws.registers('PlainArrival');

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var DepartureShip = ns.DepartureShip;

    /**
     *  Plain Departure Ship
     *  ~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Uint8Array} data - data to be sent
     * @param {int|null} prior  - priority
     */
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0;
        }
        DepartureShip.call(this, prior, DepartureShip.DISPOSABLE);
        this.__completed = data;
        this.__fragments = [data];
    };
    sys.Class(PlainDeparture, DepartureShip, null, null);

    PlainDeparture.prototype.getPackage = function () {
        return this.__completed;
    };

    // Override
    PlainDeparture.prototype.getSN = function () {
        // plain ship has no SN
        return null;
    };

    // Override
    PlainDeparture.prototype.getFragments = function () {
        return this.__fragments;
    };

    // Override
    PlainDeparture.prototype.checkResponse = function (arrival) {
        // plain departure needs no response
        return false;
    };

    //-------- namespace --------
    ns.ws.PlainDeparture = PlainDeparture;

    ns.ws.registers('PlainDeparture');

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var UTF8 = sys.type.UTF8;
    var StarDocker = ns.StarDocker;
    var Departure = ns.port.Departure;
    var PlainArrival = ns.ws.PlainArrival;
    var PlainDeparture = ns.ws.PlainDeparture;

    /**
     *  Plain Docker
     *  ~~~~~~~~~~~~
     *
     * @param {Connection} connection
     */
    var PlainDocker = function (connection) {
        StarDocker.call(this, connection);
    };
    sys.Class(PlainDocker, StarDocker, null, {
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
            return this.send(payload, Departure.Priority.NORMAL.valueOf());
        },

        // Override
        heartbeat: function () {
            init_bytes();
            this.send(PING, Departure.SLOWER.valueOf());
        },

        // Override
        getArrival: function (data) {
            if (!data || data.length === 0) {
                return null;
            }
            return this.createArrival(data);
        },

        // Override
        checkArrival: function (arrival) {
            var data = arrival.getPackage();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    // PING -> PONG
                    this.send(PONG, Departure.Priority.SLOWER.valueOf());
                } else if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                    // ignore
                    return null;
                }
            }
            return arrival;
        }
    });

    // protected
    PlainDocker.prototype.createArrival = function (data) {
        return new PlainArrival(data, null);
    };

    // protected
    PlainDocker.prototype.createDeparture = function (data, priority) {
        return new PlainDeparture(data, priority);
    };

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
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP);
        }
    }
    var PING = 'PING';
    var PONG = 'PONG';
    var NOOP = 'NOOP';

    //-------- namespace --------
    ns.ws.PlainDocker = PlainDocker;

    ns.ws.registers('PlainDocker');

})(StarGate, MONKEY);
