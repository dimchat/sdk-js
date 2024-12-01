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

    var Class       = sys.type.Class;
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
    Class(PlainArrival, ArrivalShip, null, null);

    PlainArrival.prototype.getPayload = function () {
        return this.__data;
    };

    // Override
    PlainArrival.prototype.getSN = function () {
        // plain ship has no SN
        return null;
    };

    // Override
    PlainArrival.prototype.assemble = function (arrival) {
        // console.assert(arrival === this, 'plain arrival error', arrival, this);
        // plain arrival needs no assembling
        return arrival;
    };

    //-------- namespace --------
    ns.PlainArrival = PlainArrival;

})(StarGate, MONKEY);
