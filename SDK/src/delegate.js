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

    /**
     *  Messenger Callback
     *  ~~~~~~~~~~~~~~~~~~
     */
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

    /**
     *  Messenger Completion Handler
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
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

    //-------- namespace --------
    ns.CompletionHandler = CompletionHandler;

    ns.register('CompletionHandler');

}(DIMP);

!function (ns) {
    'use strict';

    /**
     *  Messenger Delegate
     *  ~~~~~~~~~~~~~~~~~~
     */
    var MessengerDelegate = function () {
    };
    ns.Interface(MessengerDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Upload encrypted data to CDN
     *
     * @param {Uint8Array} data - encrypted file data
     * @param {InstantMessage} iMsg
     * @returns {String} - download URL
     */
    MessengerDelegate.prototype.uploadData = function (data, iMsg) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Download encrypted data from CDN
     *
     * @param {URL} url - download URL
     * @param {InstantMessage} iMsg
     * @returns {Uint8Array} - encrypted file data
     */
    MessengerDelegate.prototype.downloadData = function (url, iMsg) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send out a data package onto network
     *
     * @param {Uint8Array} data - package data
     * @param {CompletionHandler} handler
     * @param {int} priority
     * @returns {boolean}
     */
    MessengerDelegate.prototype.sendPackage = function (data, handler, priority) {
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- namespace --------
    ns.MessengerDelegate = MessengerDelegate;

    ns.register('MessengerDelegate');

}(DIMP);

!function (ns) {
    'use strict';

    /**
     *  Messenger DataSource
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var MessengerDataSource = function () {
    };
    ns.Interface(MessengerDataSource, null);

    // noinspection JSUnusedLocalSymbols
    /**
     * Save the message into local storage
     *
     * @param {InstantMessage} iMsg - instant message
     * @return true on success
     */
    MessengerDataSource.prototype.saveMessage = function (iMsg) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Suspend the received message for the sender's meta
     *
     * @param {ReliableMessage} rMsg - message received from network
     */
    MessengerDataSource.prototype.suspendReliableMessage = function (rMsg) {
        console.assert(false, 'implement me!');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Suspend the sending message for the receiver's meta & visa,
     *  or group meta when received new message
     *
     * @param {InstantMessage} iMsg - instant message to be sent
     */
    MessengerDataSource.prototype.suspendInstantMessage = function (iMsg) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.MessengerDataSource = MessengerDataSource;

    ns.register('MessengerDataSource');

}(DIMP);
