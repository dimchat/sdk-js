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
    ns.type.Interface(Callback);

    Callback.prototype.onFinished = function (result, error) {
        console.assert(result || error, 'result empty');
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Callback = Callback;

}(DIMP);

!function (ns) {
    'use strict';

    var CompletionHandler = function () {
    };
    ns.type.Interface(CompletionHandler);

    CompletionHandler.prototype.onSuccess = function () {
        console.assert(false, 'implement me!');
    };

    CompletionHandler.prototype.onFailed = function (error) {
        console.assert(error !== null, 'result empty');
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.CompletionHandler = CompletionHandler;

}(DIMP);

!function (ns) {
    'use strict';

    var ConnectionDelegate = function () {
    };
    ns.type.Interface(ConnectionDelegate);

    /**
     *  Receive data package
     *
     * @param data - package from network connection (Uint8Array)
     * @returns {Uint8Array} data response to sender
     */
    ConnectionDelegate.prototype.onReceivePackage = function (data) {
        console.assert(data !== null, 'data empty');
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- namespace --------
    ns.ConnectionDelegate = ConnectionDelegate;

}(DIMP);

!function (ns) {
    'use strict';

    var MessengerDelegate = function () {
    };
    ns.type.Interface(MessengerDelegate);

    /**
     *  Upload encrypted data to CDN
     *
     * @param data - encrypted file data (Uint8Array)
     * @param msg - instant message
     * @returns {String} - download URL
     */
    MessengerDelegate.prototype.uploadData = function (data, msg) {
        console.assert(data !== null, 'data empty');
        console.assert(msg !== null, 'msg empty');
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Download encrypted data from CDN
     *
     * @param url - download URL
     * @param msg - instant message
     * @returns {Uint8Array} - encrypted file data
     */
    MessengerDelegate.prototype.downloadData = function (url, msg) {
        console.assert(url !== null, 'URL empty');
        console.assert(msg !== null, 'msg empty');
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Send out a data package onto network
     *
     * @param data - package data (Uint8Array)
     * @param handler - completion handler
     * @returns {boolean}
     */
    MessengerDelegate.prototype.sendPackage = function (data, handler) {
        console.assert(data !== null, 'data empty');
        console.assert(handler !== null, 'handler empty');
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- namespace --------
    ns.MessengerDelegate = MessengerDelegate;

}(DIMP);
