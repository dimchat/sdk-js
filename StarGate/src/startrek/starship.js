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

(function (ns) {
    "use strict";

    var Ship = ns.Ship;

    var StarShip = function (priority, delegate) {
        this.priority = priority;
        this.delegate = delegate;
        // for retry
        this.last_time = 0;  // milliseconds
        this.retries = -1;
    };
    DIMP.Class(StarShip, null, [Ship]);

    // retry
    StarShip.EXPIRES = 120 * 1000;  // 2 minutes
    StarShip.RETRIES = 2;

    // priorities
    StarShip.URGENT = -1;
    StarShip.NORMAL = 0;
    StarShip.SLOWER = 1;

    StarShip.prototype.getDelegate = function () {
        return this.delegate;
    };

    StarShip.prototype.getTimestamp = function () {
        return this.last_time;
    };

    StarShip.prototype.getRetries = function () {
        return this.retries;
    };

    StarShip.prototype.isExpired = function () {
        var now = new Date();
        return now.getTime() > this.last_time + StarShip.EXPIRES * (StarShip.RETRIES + 2);
    };

    StarShip.prototype.update = function () {
        this.last_time = (new Date()).getTime();
        this.retries += 1;
    };

    //-------- namespace --------
    ns.StarShip = StarShip;

    ns.register('StarShip');

})(StarTrek);
