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
 *  Star Worker
 *  ~~~~~~~~~~~
 *
 *  Processor for Star Ships
 */

//! require 'docker.js'
//! require 'gate.js'
//! require 'starship.js'

(function (ns, sys) {
    "use strict";

    var Runner = sys.threading.Runner;
    var Docker = ns.Docker;

    var StarDocker = function (gate) {
        Runner.call(this);
        this.__gate = gate;
        // time for checking heartbeat
        this.__heartbeatExpired = (new Date()).getTime() + 2000;
    };
    sys.Class(StarDocker, Runner, [Docker]);

    StarDocker.prototype.getGate = function () {
        return this.__gate;
    };

    StarDocker.prototype.process = function () {
        var gate = this.getGate();
        // 1. process income
        var income = this.getIncomeShip();
        if (income) {
            // 1.1. remove linked package
            this.removeLinkedShip(income);
            // 1.2. process income package
            var res = this.processIncomeShip(income);
            if (res) {
                // if res.priority < 0, send the response immediately;
                // or, put this ship into a waiting queue.
                gate.sendShip(res);
            }
        }
        // 2. process outgo
        var delegate;
        var outgo = this.getOutgoShip();
        if (outgo) {
            if (outgo.isExpired()) {
                // outgo ship expired, callback
                delegate = outgo.getDelegate();
                if (delegate) {
                    delegate.onShipSent(outgo, new Error('Request timeout'));
                }
            } else if (!gate.send(outgo.getPackage())) {
                // failed to send outgo package, callback
                delegate = outgo.getDelegate();
                if (delegate) {
                    delegate.onShipSent(outgo, new Error('Connection error'));
                }
            }
        }
        // 3. heartbeat
        if (income || outgo) {
            return true;
        } else {
            // check time for next heartbeat
            var now = (new Date()).getTime();
            if (now > this.__heartbeatExpired) {
                if (gate.isExpired()) {
                    var beat = this.getHeartbeat();
                    if (beat) {
                        // put the heartbeat into waiting queue
                        gate.parkShip(beat);
                    }
                }
                // try heartbeat next 2 seconds
                this.__heartbeatExpired = now + 2000;
            }
            return false;
        }
    };

    /**
     *  Get income Ship from Connection
     *
     * @return {Ship} income ship carrying payload
     */
    StarDocker.prototype.getIncomeShip = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Process income Ship
     *
     * @param {Ship} income ship carrying payload
     * @return {StarShip} outgo ship carrying response as payload
     */
    StarDocker.prototype.processIncomeShip = function (income) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Remove outgo task
     *
     * @param {Ship} income
     */
    StarDocker.prototype.removeLinkedShip = function (income) {
        var linked = this.getOutgoShip(income);
        if (linked) {
            // callback for the linked outgo ship and remove it
            var delegate = linked.getDelegate();
            if (delegate) {
                delegate.onShipSent(linked, null);
            }
        }
    };

    /**
     *  Get outgo ship
     *  1. get task with ID (income.SN)
     *  2. get next task from waiting queue
     *
     * @return {StarShip}
     */
    StarDocker.prototype.getOutgoShip = function (income) {
        var gate = this.getGate();
        if (income) {
            // get outgo task with ID (income.SN)
            return gate.pullShip(income.getSN());
        } else {
            // get outgo task from waiting queue
            var outgo = gate.pullShip('*');
            if (!outgo) {
                // no more new task now, get any expired task
                outgo = gate.anyShip();
            }
            return outgo;
        }
    };

    /**
     *  Get an empty ship for keeping connection alive
     *
     * @return {StarShip}
     */
    StarDocker.prototype.getHeartbeat = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.StarDocker = StarDocker;

    ns.register('StarDocker');

})(StarTrek, MONKEY);
