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

(function (ns, sys) {
    "use strict";

    var StarShip = ns.StarShip;

    var Dock = function () {
        Object.call(this);
        this.__priorities = [];  // int[]
        this.__fleets = {}       // int -> StarShip[]
    };
    sys.Class(Dock, Object, null);

    /**
     *  Park this ship in the Dock for departure
     *
     * @param {StarShip} task - outgo ship
     * @return {boolean} false on duplicated
     */
    Dock.prototype.park = function (task) {
        // 1. choose an array with priority
        var prior = task.priority;
        var fleet = this.__fleets[prior];
        if (!fleet) {
            // 1.1. create new array for this priority
            fleet = [];
            this.__fleets[prior] = fleet;
            // 1.2. insert the priority in a sorted list
            var index = 0;
            for (; index < this.__priorities.length; ++index) {
                if (prior < this.__priorities[index]) {
                    // insert priority before the bigger one
                    break;
                }
            }
            this.__priorities[index] = prior;
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
     *  Pull out a waiting ship, remove it from the Dock
     *  1. when sn is '*', get a new ship and update time and retries;
     *  2. or, get ship with ID (which is sn).
     *
     * @param {Uint8Array|String} sn - ship ID
     * @return {StarShip} outgo ship
     */
    Dock.prototype.pull = function (sn) {
        if (sn === '*') {
            // Get next new ship(time == 0), remove it from the Dock
            return seek(this, function (ship) {
                if (ship.getTimestamp() === 0) {
                    // update time and retires
                    ship.update();
                    return -1;
                } else {
                    return 0;
                }
            });
        } else {
            // Get ship with ID, remove it from the Dock
            return seek(this, function (ship) {
                var sn1 = ship.getSN();
                if (sn1.length !== sn.length) {
                    return 0;
                }
                for (var i = 0; i < sn1.length; ++i) {
                    if (sn1[i] !== sn[i]) {
                        return 0;
                    }
                }
                return -1;
            });
        }
    };

    var seek = function (dock, checking) {
        var fleet, ship, flag;
        var i, j;
        for (i = 0; i < dock.__priorities.length; ++i) {
            fleet = dock.__fleets[dock.__priorities[i]];
            if (!fleet) {
                continue;
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                flag = checking(ship);
                if (flag === -1) {
                    // remove and return it
                    fleet.splice(j, 1);
                    return ship;
                } else if (flag === 1) {
                    // just return
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
        return seek(this, function (ship) {
            if (ship.getTimestamp() > expired) {
                // not expired yet
                return 0;
            }
            if (ship.getRetries() < StarShip.RETRIES) {
                // update time and retries
                ship.update();
                return 1;
            }
            // retried too many times
            if (ship.isExpired()) {
                // task expired, remove it and don't retry
                return -1;
            }
        });
    };

    //-------- namespace --------
    ns.Dock = Dock;

    ns.registers('Dock');

})(StarTrek, MONKEY);
