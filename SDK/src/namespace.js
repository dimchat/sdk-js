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

(function (ns) {
    'use strict';

    //-------- namespace --------
    if (typeof ns.cpu !== 'object') {
        ns.cpu = {};
    }
    if (typeof ns.utils !== 'object') {
        ns.utils = {};
    }

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger;
    };
    Class(TwinsHelper, Object, null, null);

    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook;
    }

    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger;
    }

    //
    //  Convenient responding
    //

    TwinsHelper.prototype.respondReceipt = function (text, envelope, content, extra) {
        var res = TwinsHelper.createReceipt(text, envelope, content, extra);
        return [res];
    }

    /**
     *  Receipt command with text, original envelope, serial number & group
     *
     * @param {string} text     - respond message
     * @param {Envelope} envelope - original message envelope
     * @param {Content} content  - original message content
     * @param {*} extra    - extra info
     * @return {ReceiptCommand}
     */
    TwinsHelper.createReceipt = function (text, envelope, content, extra) {
        // create base receipt command with text, original envelope, serial number & group ID
        var res = ReceiptCommand.create(text, envelope, content);
        if (extra) {
            // add extra key-values
            var keys = Object.keys(extra);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = extra[name];
                res.setValue(name, value);
            }
        }
        return res;
    };

    //-------- namespace --------
    ns.TwinsHelper = TwinsHelper;

})(DIMP);
