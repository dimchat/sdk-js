;
// license: https://mit-license.org
//
//  Star Gate: Interfaces for network connection
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

//! require <dimp.js>
//! require 'namespace.js'

!function (ns) {
    "use strict";

    /**
     *  Completion Handler / Callback
     */
    var Delegate = function () {
    };
    Delegate.prototype.onReceived = function (response, star) {
        console.assert(response !== null, 'response empty');
        console.assert(star !== null, 'star empty');
        console.assert(false, 'implement me!');
    };
    Delegate.prototype.onStatusChanged = function (status, star) {
        console.assert(status !== null, 'status empty');
        console.assert(star !== null, 'star empty');
        console.assert(false, 'implement me!');
    };
    Delegate.prototype.onFinishSend = function (request, error, star) {
        console.assert(request !== null, 'request empty');
        console.assert(star !== null, 'star empty');
        console.assert(false, 'implement me!');
    };

    /**
     *  Connection Status
     */
    var Status = DIMP.type.Enum({
        Error:     -1,
        Init:       0,
        Connecting: 1,
        Connected:  2
    });

    //-------- namespace --------
    ns.StarDelegate = Delegate;
    ns.StarStatus = Status;

    ns.includes('StarDelegate');
    ns.includes('StarStatus');

}(StarGate);

!function (ns) {
    "use strict";

    var Star = function () {
    };

    /**
     * Get connection status
     *
     * @returns {StarStatus}
     */
    Star.prototype.getStatus = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Connect to a server
     *
     * @param options
     */
    Star.prototype.launch = function (options) {
        console.assert(options !== null, 'options empty');
        console.assert(false, 'implement me!');
    };
    /**
     *  Disconnect from current server
     */
    Star.prototype.terminate = function () {
        console.assert(false, 'implement me!');
    };

    Star.prototype.pause = function (options) {
    };
    Star.prototype.resume = function (options) {
    };

    /**
     *  Send data to the connected server
     *
     * @param payload
     * @param delegate - completionHandler for callback
     */
    Star.prototype.send = function (payload, delegate) {
        console.assert(payload !== null, 'payload empty');
        console.assert(delegate !== null, 'delegate empty');
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Star = Star;

    ns.includes('Star');

}(StarGate);
