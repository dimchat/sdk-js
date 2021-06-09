;
// license: https://mit-license.org
//
//  Finite State Machine
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
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

    var obj = sys.type.Object;

    /**
     *  Machine status
     */
    var Status = sys.type.Enum(null, {
        Stopped: 0,
        Running: 1,
        Paused: 2
    });

    /**
     *  Create a State Machine with default state name
     *
     * @param {String} defaultStateName
     * @constructor
     */
    var Machine = function (defaultStateName) {
        obj.call(this);
        this.__default = defaultStateName ? defaultStateName : 'default';
        this.__current = null;  // current state
        this.__status = Status.Stopped;
        this.__delegate = null;
    };
    sys.Class(Machine, obj, null);

    Machine.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    Machine.prototype.getDelegate = function () {
        return this.__delegate;
    };

    Machine.prototype.getCurrentState = function () {
        return this.__current;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Add state with name
     *
     * @param {State} state
     * @param {String} name
     */
    Machine.prototype.addState = function (state, name) {
        console.assert(false, 'implement me!');
    };
    // noinspection JSUnusedLocalSymbols
    Machine.prototype.getState = function (name) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Change state with name
     *
     * @param {String} name
     */
    Machine.prototype.changeState = function (name) {
        var delegate = this.getDelegate();
        var oldState = this.getCurrentState();
        var newState = this.getState(name);

        // events before state changed
        if (delegate) {
            if (oldState) {
                delegate.exitState(oldState, this);
            }
            if (newState) {
                delegate.enterState(newState, this);
            }
        }

        // change state
        this.__current = newState;

        // events after state changed
        if (oldState) {
            oldState.onExit(this);
        }
        if (newState) {
            newState.onEnter(this);
        }
    };

    /**
     *  start machine from default state
     */
    Machine.prototype.start = function () {
        if (this.__current || !Status.Stopped.equals(this.__status)) {
            throw new Error('FSM start error: ' + this.__status);
        }
        this.changeState(this.__default);
        this.__status = Status.Running;
    };
    /**
     *  stop machine and set current state to null
     */
    Machine.prototype.stop = function () {
        if (!this.__current || Status.Stopped.equals(this.__status)) {
            throw new Error('FSM stop error: ' + this.__status);
        }
        this.__status = Status.Stopped;
        this.changeState(null);
    };

    Machine.prototype.pause = function () {
        if (!this.__current || !Status.Running.equals(this.__status)) {
            throw new Error('FSM pause error: ' + this.__status);
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(this.__current, this);
        }
        this.__status = Status.Paused;
        this.__current.onPause(this);
    };
    Machine.prototype.resume = function () {
        if (!this.__current || !Status.Paused.equals(this.__status)) {
            throw new Error('FSM resume error: ' + this.__status);
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(this.__current, this);
        }
        this.__status = Status.Running;
        this.__current.onResume(this);
    };

    /**
     *  Drive the machine running forward
     */
    Machine.prototype.tick = function () {
        if (this.__current && Status.Running.equals(this.__status)) {
            this.__current.tick(this);
        }
    };

    //-------- namespace --------
    ns.Machine = Machine;

    ns.registers('Machine');

})(FiniteStateMachine, MONKEY);
