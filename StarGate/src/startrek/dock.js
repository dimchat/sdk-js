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
 *  Star Dock
 *  ~~~~~~~~~
 *
 *  Parking Star Ships
 */

//! require 'starship.js'

(function (ns) {
    "use strict";

    var StarShip = ns.StarShip;

    var Dock = function () {
        this.priorities = [];  // int[]
        this.fleets = {}       // int -> StarShip[]
    };
    DIMP.Class(Dock, null);

    /**
     *  Park this ship in the Dock for departure
     *
     * @param {StarShip} task - outgo ship
     * @return {boolean} false on duplicated
     */
    Dock.prototype.put = function (task) {
        // 1. choose an array with priority
        var prior = task.priority;
        var fleet = this.fleets[prior];
        if (!fleet) {
            // 1.1. create new array for this priority
            fleet = [];
            this.fleets[prior] = fleet;
            // 1.2. insert the priority in a sorted list
            var index = 0;
            for (; index < this.priorities.length; ++index) {
                if (prior < this.priorities[index]) {
                    // insert priority before the bigger one
                    break;
                }
            }
            this.priorities[index] = prior;
        }
        // 2. check duplicated task
        for (var i = 0; i < fleet.length; ++i) {
            if (fleet[i] === task) {
                return false;
            }
        }
        // 3. append to the tail
        fleet.push(task);
        return true;
    };

    /**
     *  Get next new ship, remove it from the park
     *
     * @return {StarShip} outgo ship
     */
    Dock.prototype.pop = function () {
        var fleet, ship;
        for (var i = 0; i < this.priorities.length; ++i) {
            fleet = this.fleets[this.priorities[i]];
            if (!fleet) {
                continue;
            }
            for (var j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (ship.getTimestamp() === 0) {
                    // update time and try
                    ship.update();
                    fleet = fleet.splice(j, 1);
                    return ship;
                }
            }
        }
        return null;
    };

    var match_sn = function (sn1, sn2) {
        if (sn1.length !== sn2.length) {
            return false;
        }
        for (var i = 0; i < sn1.length; ++i) {
            if (sn1[i] !== sn2[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     *  Get ship with ID, remove it from the park
     *
     * @param {Uint8Array} sn - ship ID
     * @return {StarShip} outgo ship
     */
    Dock.prototype.get = function (sn) {
        var fleet, ship;
        for (var i = 0; i < this.priorities.length; ++i) {
            fleet = this.fleets[this.priorities[i]];
            if (!fleet) {
                continue;
            }
            for (var j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (match_sn(ship.getSN(), sn)) {
                    // just remove it
                    fleet = fleet.splice(j, 1);
                    return ship;
                }
            }
        }
        return null;
    };

    /**
     *  Get any ship timeout/expired
     *    1. if expired, remove it from the park;
     *    2. else, update time and retry (keep it in the park)
     *
     * @return {StarShip} outgo ship
     */
    Dock.prototype.any = function () {
        var expired = (new Date()).getTime() - StarShip.EXPIRES;
        var fleet, ship;
        for (var i = 0; i < this.priorities.length; ++i) {
            fleet = this.fleets[this.priorities[i]];
            if (!fleet) {
                continue;
            }
            for (var j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                if (ship.getTimestamp() > expired) {
                    // not expired yet
                    continue;
                }
                if (ship.getRetries() < StarShip.RETRIES) {
                    // update time and retry
                    ship.update();
                    return ship;
                }
                // retried too many times
                if (ship.isExpired()) {
                    // task expired, remove it and don't retry
                    fleet = fleet.splice(j, 1);
                    return ship;
                }
            }
        }
        return null;
    };

    //-------- namespace --------
    ns.Dock = Dock;

    ns.register('Dock');

})(StarTrek);
