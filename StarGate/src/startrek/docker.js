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

//! require 'skywalker.js'

(function (ns, sys) {
    "use strict";

    var Handler = sys.threading.Handler;
    var Processor = sys.threading.Processor;

    var Docker = function () {
    };
    sys.Interface(Docker, [Handler, Processor]);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Pack the payload to an outgo Ship
     *
     * @param {Uint8Array} payload  - request data
     * @param {int} priority        - smaller is faster (-1 is the most fast)
     * @param {Ship.Delegate} delegate   - callback
     * @return {StarShip} a ship containing payload
     */
    Docker.prototype.pack = function (payload, priority, delegate) {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.Docker = Docker;

    ns.register('Docker');

})(StarTrek, MONKEY);
