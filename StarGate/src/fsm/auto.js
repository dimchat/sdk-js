;
// license: https://mit-license.org
//
//  Finite State Machine
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

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Runnable = sys.threading.Runnable;
    var Thread = sys.threading.Thread;

    var Machine = ns.Machine;

    /**
     *  Create a State Machine with default state name
     *
     * @param {String} defaultStateName
     * @constructor
     */
    var AutoMachine = function (defaultStateName) {
        Machine.call(this, defaultStateName);
        this.__states = {}; // String -> State
        this.__thread = null;
    };
    sys.Class(AutoMachine, Machine, [Runnable]);

    AutoMachine.prototype.addState = function (state, name) {
        this.__states[name] = state;
    };
    AutoMachine.prototype.getState = function (name) {
        return this.__states[name];
    };

    AutoMachine.prototype.start = function () {
        Machine.prototype.start.call(this);
        force_stop(this);
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start();
    };

    var force_stop = function (machine) {
        var thread = machine.__thread;
        machine.__thread = null;
        if (thread) {
            thread.stop();
        }
    };

    AutoMachine.prototype.stop = function () {
        Machine.prototype.stop.call(this);
        force_stop(this);
    };

    // return true for sleeping a while to continued
    // return false to stop running
    AutoMachine.prototype.run = function () {
        this.tick();
        // when machine is stopped, current state will be set to null
        // if it's not null, return true to sleep a while to continue ticking.
        return this.getCurrentState() != null;
    };

    //-------- namespace --------
    ns.AutoMachine = AutoMachine;

    ns.registers('AutoMachine');

})(FiniteStateMachine, MONKEY);
