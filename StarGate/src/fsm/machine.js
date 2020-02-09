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

!function (ns) {
    "use strict";

    /**
     *  Machine status
     */
    var Status = DIMP.type.Enum({
        Stopped: 0,
        Running: 1,
        Paused: 2
    });

    /**
     *  State Machine
     */
    var Machine = function (defaultStateName) {
        this.defaultStateName = defaultStateName ?  defaultStateName : 'default';
        this.currentState = null;
        this.stateMap = {}; // String -> State
        this.status = Status.Stopped;

        this.delegate = null;
    };
    DIMP.type.Class(Machine);

    /**
     *  add state with name
     *
     * @param state
     * @param name
     */
    Machine.prototype.addState = function (state, name) {
        this.stateMap[name] = state;
    };

    Machine.prototype.changeState = function (name) {
        var state = this.currentState;
        // exit current state
        if (state) {
            this.delegate.exitState(state, this);
            state.onExit(this);
        }
        // get new state by name
        state = this.stateMap[name];
        this.currentState = state;
        // enter new state
        if (state) {
            this.delegate.enterState(state, this);
            state.onEnter(this);
        }
    };

    Machine.prototype.isRunning = function () {
        return this.status.equals(Status.Running);
    };

    /**
     *  Drive the machine running forward
     */
    Machine.prototype.tick = function () {
        if (this.isRunning()) {
            this.currentState.tick(this);
        }
    };

    /**
     *  start machine from default state
     */
    Machine.prototype.start = function () {
        if (!this.status.equals(Status.Stopped) || this.currentState) {
            throw Error('FSM start error: ' + this.status);
        }
        this.changeState(this.defaultStateName);
        this.status = Status.Running;
    };
    /**
     *  stop machine and set current state to null
     */
    Machine.prototype.stop = function () {
        if (this.status.equals(Status.Stopped) || !this.currentState) {
            throw Error('FSM stop error: ' + this.status);
        }
        this.status = Status.Stopped;
        this.changeState(null);
    };

    Machine.prototype.pause = function () {
        if (!this.status.equals(Status.Running) || !this.currentState) {
            throw Error('FSM pause error: ' + this.status);
        }
        this.delegate.pauseState(this.currentState, this);
        this.status = Status.Paused;
        this.currentState.onPause(this);
    };
    Machine.prototype.resume = function () {
        if (!this.status.equals(Status.Paused) || !this.currentState) {
            throw Error('FSM resume error: ' + this.status);
        }
        this.delegate.resumeState(this.currentState, this);
        this.status = Status.Running;
        this.currentState.onResume(this);
    };

    //-------- namespace --------
    ns.Machine = Machine;

    ns.register('Machine');

}(FiniteStateMachine);
