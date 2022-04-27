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
 *  Star Ship
 *  ~~~~~~~~~
 *
 *  Container carrying data package
 */

//! require 'ship.js'

(function (ns, sys) {
    "use strict";

    var Ship = ns.Ship;

    var StarShip = function (priority, delegate) {
        Object.call(this);
        this.priority = priority;
        this.__delegate = delegate;
        // for retry
        this.__timestamp = 0;  // milliseconds
        this.__retries = -1;
    };
    sys.Class(StarShip, Object, [Ship]);

    // retry
    StarShip.EXPIRES = 120 * 1000;  // 2 minutes
    StarShip.RETRIES = 2;

    // priorities
    StarShip.URGENT = -1;
    StarShip.NORMAL = 0;
    StarShip.SLOWER = 1;

    StarShip.prototype.getDelegate = function () {
        return this.__delegate;
    };

    StarShip.prototype.getTimestamp = function () {
        return this.__timestamp;
    };

    StarShip.prototype.getRetries = function () {
        return this.__retries;
    };

    StarShip.prototype.isExpired = function () {
        var now = new Date();
        return now.getTime() > this.__timestamp + StarShip.EXPIRES * (StarShip.RETRIES + 2);
    };

    StarShip.prototype.update = function () {
        this.__timestamp = (new Date()).getTime();
        this.__retries += 1;
    };

    //-------- namespace --------
    ns.StarShip = StarShip;

    ns.registers('StarShip');

})(StarTrek, MONKEY);
