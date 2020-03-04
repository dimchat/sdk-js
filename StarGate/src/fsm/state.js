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
     *  State
     */
    var State = function () {
        this.transitions = [];
    };
    DIMP.Class(State, DIMP.type.Object, null);

    /**
     *  Append a transition for this state
     *
     * @param {Transition} transition
     */
    State.prototype.addTransition = function (transition) {
        if (this.transitions.indexOf(transition) >= 0) {
            throw Error('transition exists: ' + transition);
        }
        this.transitions.push(transition);
    };

    /**
     *  Evaluate all transitions for this state
     *  (called by machine.tick)
     *
     * @param {Machine} machine
     */
    State.prototype.tick = function (machine) {
        var transition;
        for (var i = 0; i < this.transitions.length; ++i) {
            transition = this.transitions[i];
            if (transition.evaluate(machine)) {
                // OK
                machine.changeState(transition.target);
                break;
            }
        }
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when enter state
     *
     * @param {Machine} machine
     */
    State.prototype.onEnter = function (machine) {
        console.assert(false, 'implement me!');
    };
    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when exit state
     *
     * @param {Machine} machine
     */
    State.prototype.onExit = function (machine) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when state paused
     *
     * @param {Machine} machine
     */
    State.prototype.onPause = function (machine) {
        //console.assert(false, 'implement me!');
    };
    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when state resumed
     *
     * @param {Machine} machine
     */
    State.prototype.onResume = function (machine) {
        //console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.State = State;

    ns.register('State');

}(FiniteStateMachine);
