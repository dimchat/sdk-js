;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

!function (ns) {
    'use strict';

    var Callback = function () {
    };
    ns.Interface(Callback, null);

    // noinspection JSUnusedLocalSymbols
    Callback.prototype.onFinished = function (result, error) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Callback = Callback;

    ns.register('Callback');

}(DIMP);

!function (ns) {
    'use strict';

    var CompletionHandler = function () {
    };
    ns.Interface(CompletionHandler, null);

    CompletionHandler.prototype.onSuccess = function () {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    CompletionHandler.prototype.onFailed = function (error) {
        console.assert(false, 'implement me!');
    };

    CompletionHandler.newHandler = function (onSuccess, onFailed) {
        var handler = new CompletionHandler();
        handler.onSuccess = onSuccess;
        handler.onFailed = onFailed;
        return handler;
    };

    //-------- namespace --------
    ns.CompletionHandler = CompletionHandler;

    ns.register('CompletionHandler');

}(DIMP);

!function (ns) {
    'use strict';

    var ConnectionDelegate = function () {
    };
    ns.Interface(ConnectionDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Receive data package
     *
     * @param {Uint8Array} data - package from network connection
     * @returns {Uint8Array} data response to sender
     */
    ConnectionDelegate.prototype.onReceivePackage = function (data) {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.ConnectionDelegate = ConnectionDelegate;

    ns.register('ConnectionDelegate');

}(DIMP);

!function (ns) {
    'use strict';

    var MessengerDelegate = function () {
    };
    ns.Interface(MessengerDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Upload encrypted data to CDN
     *
     * @param {Uint8Array} data - encrypted file data
     * @param {InstantMessage} msg
     * @returns {String} - download URL
     */
    MessengerDelegate.prototype.uploadData = function (data, msg) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Download encrypted data from CDN
     *
     * @param {URL} url - download URL
     * @param {InstantMessage} msg
     * @returns {Uint8Array} - encrypted file data
     */
    MessengerDelegate.prototype.downloadData = function (url, msg) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send out a data package onto network
     *
     * @param {Uint8Array} data - package data
     * @param {CompletionHandler} handler
     * @returns {boolean}
     */
    MessengerDelegate.prototype.sendPackage = function (data, handler) {
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- namespace --------
    ns.MessengerDelegate = MessengerDelegate;

    ns.register('MessengerDelegate');

}(DIMP);
