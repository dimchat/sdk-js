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

//! require 'skywalker.js'
//! require 'gate.js'
//! require 'dock.js'

(function (ns) {
    "use strict";

    var Runner = ns.Runner;
    var Gate = ns.Gate;
    var Dock = ns.Dock;
    var StarShip = ns.StarShip;

    var StarGate = function () {
        Runner.call(this);
        this.dock = this.createDock();
        this.docker = null;
        this.delegate = null;
    };
    DIMP.Class(StarGate, Runner, [Gate]);

    StarGate.prototype.createDock = function () {
        return new Dock();
    };

    // override to customize Worker
    StarGate.prototype.createDocker = function () {
        console.assert(false, 'implement me!');
        return null;
    };
    StarGate.prototype.getDocker = function () {
        if (!this.docker) {
            this.docker = this.createDocker();
        }
        return this.docker;
    };
    StarGate.prototype.setDocker = function (worker) {
        this.docker = worker;
    };

    StarGate.prototype.getDelegate = function () {
        return this.delegate;
    };
    StarGate.prototype.setDelegate = function (delegate) {
        this.delegate = delegate;
    };

    StarGate.prototype.sendPayload = function (payload, priority, delegate) {
        var worker = this.getDocker();
        if (worker) {
            var outgo = worker.pack(payload, priority, delegate);
            return this.sendShip(outgo);
        } else {
            return false;
        }
    };

    StarGate.prototype.sendShip = function (outgo) {
        if (!this.getStatus().equals(Gate.Status.Connected)) {
            // not connect yet
            return false;
        } else if (outgo.priority > StarShip.URGENT) {
            // put the ship into a waiting queue
            return this.parkShip(outgo);
        } else {
            // send out directly
            return this.send(outgo.getPackage());
        }
    };

    //
    //  Docking
    //

    StarGate.prototype.parkShip = function (outgo) {
        return this.dock.put(outgo);
    };

    StarGate.prototype.pullShip = function (sn) {
        if (sn === '*') {
            return this.dock.pop();
        } else {
            return this.dock.get(sn);
        }
    };

    StarGate.prototype.anyShip = function () {
        return this.dock.any();
    };

    //
    //  Runner
    //

    StarGate.prototype.setup = function () {
        Runner.prototype.setup.call(this);
        // check connection
        if (!this.isRunning()) {
            // wait a second for connecting
            this.idle();
        }
        // check docker
        while (!this.getDocker() && this.isRunning()) {
            // waiting for docker
            this.idle();
        }
        // setup docker
        if (this.docker) {
            this.docker.setup();
        }
    };

    StarGate.prototype.finish = function () {
        // clean docker
        if (this.docker) {
            this.docker.finish();
        }
        Runner.prototype.finish.call(this);
    };

    StarGate.prototype.process = function () {
        if (this.docker) {
            return this.docker.process();
        } else {
            return false;
        }
    };

    //-------- namespace --------
    ns.StarGate = StarGate;

    ns.register('StarGate');

})(StarTrek);
