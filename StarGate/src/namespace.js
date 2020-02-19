;
// license: https://mit-license.org
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

//! require <dimp.js>

if (typeof FiniteStateMachine !== 'object') {
    FiniteStateMachine = {};
}

if (typeof StarGate !== 'object') {
    StarGate = {};
}

!function (sg, fsm) {
    "use strict";

    //-------- namespace --------
    if (typeof StarGate.extensions !== 'object') {
        sg.extensions = {};
    }
    if (typeof StarGate.network !== 'object') {
        sg.network = {};
    }

    DIMP.namespace(fsm);
    DIMP.namespace(sg);
    DIMP.namespace(sg.extensions);
    DIMP.namespace(sg.network);

    sg.register('extensions');
    sg.register('network');

}(StarGate, FiniteStateMachine);
