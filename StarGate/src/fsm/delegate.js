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
     *  State machine delegate
     */
    var Delegate = function () {
    };
    DIMP.Interface(Delegate, null);

    /**
     *  Callback when entering a new state
     *
     * @param state {State}
     * @param machine {Machine}
     */
    Delegate.prototype.enterState = function (state, machine) {
        console.assert(state !== null, 'state empty');
        console.assert(machine !== null, 'machine empty');
        console.assert(false, 'implement me!');
    };
    /**
     *  Callback when exit from current state
     *
     * @param state {State}
     * @param machine {Machine}
     */
    Delegate.prototype.exitState = function (state, machine) {
        console.assert(state !== null, 'state empty');
        console.assert(machine !== null, 'machine empty');
        console.assert(false, 'implement me!');
    };

    /**
     *  Callback when pause current state
     *
     * @param state {State}
     * @param machine {Machine}
     */
    Delegate.prototype.pauseState = function (state, machine) {
        console.assert(state !== null, 'state empty');
        console.assert(machine !== null, 'machine empty');
    };
    /**
     *  Callback when resume current state
     *
     * @param state {State}
     * @param machine {Machine}
     */
    Delegate.prototype.resumeState = function (state, machine) {
        console.assert(state !== null, 'state empty');
        console.assert(machine !== null, 'machine empty');
    };

    //-------- namespace --------
    ns.StateDelegate = Delegate;

    ns.register('StateDelegate');

}(FiniteStateMachine);
