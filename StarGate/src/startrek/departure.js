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

    var Class         = sys.type.Class;
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
        DepartureShip.call(this, prior, 1);
        this.__completed = data;
        this.__fragments = [data];
    };
    Class(PlainDeparture, DepartureShip, null, null);

    PlainDeparture.prototype.getPayload = function () {
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

    // Override
    PlainDeparture.prototype.isImportant = function (arrival) {
        // plain departure needs no response
        return false;
    };

    //-------- namespace --------
    ns.PlainDeparture = PlainDeparture;

})(StarGate, MONKEY);
