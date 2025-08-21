'use strict';
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2025 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2025 Albert Moky
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


    sdk.core.Shortener = Interface(null, null);
    var Shortener = sdk.core.Shortener;

    /*  Short Keys

      ======+==================================================+==================
            |   Message        Content        Symmetric Key    |    Description
      ------+--------------------------------------------------+------------------
      "A"   |                                 "algorithm"      |
      "C"   |   "content"      "command"                       |
      "D"   |   "data"                        "data"           |
      "F"   |   "sender"                                       |   (From)
      "G"   |   "group"        "group"                         |
      "I"   |                                 "iv"             |
      "K"   |   "key", "keys"                                  |
      "M"   |   "meta"                                         |
      "N"   |                  "sn"                            |   (Number)
      "P"   |   "visa"                                         |   (Profile)
      "R"   |   "receiver"                                     |
      "S"   |   ...                                            |
      "T"   |   "type"         "type"                          |
      "V"   |   "signature"                                    |   (Verification)
      "W"   |   "time"         "time"                          |   (When)
      ======+==================================================+==================

      Note:
          "S" - deprecated (ambiguous for "sender" and "signature")
     */

    /**
     *  Compress Content
     *
     * @param {{}} content
     * @return {{}}
     */
    Shortener.prototype.compressContent = function (content) {};
    Shortener.prototype.extractContent = function (content) {};

    /**
     *  Compress SymmetricKey
     *
     * @param {{}} key
     * @return {{}}
     */
    Shortener.prototype.compressSymmetricKey = function (key) {};
    Shortener.prototype.extractSymmetricKey = function (key) {};

    /**
     *  Compress ReliableMessage
     *
     * @param {{}} msg
     * @return {{}}
     */
    Shortener.prototype.compressReliableMessage = function (msg) {};
    Shortener.prototype.extractReliableMessage = function (msg) {};


    sdk.core.MessageShortener = function () {
        BaseObject.call(this);
    };
    var MessageShortener = sdk.core.MessageShortener;

    Class(MessageShortener, BaseObject, [Shortener], null);

    // protected
    MessageShortener.prototype.moveKey = function (from, to, info) {
        var value = info[from];
        if (value) {
            delete info[from];
            info[to] = value;
        }
    };

    /**
     *  Move values from long keys to short keys
     *
     * @param {String[]} keys
     * @param {{}} info
     */
    // protected
    MessageShortener.prototype.shortenKeys = function (keys, info) {
        for (var i = 1; i < keys.length; i += 2) {
            this.moveKey(keys[i], keys[i - 1], info);
        }
    };

    /**
     *  Move values from short keys to long keys
     *
     * @param {String[]} keys
     * @param {{}} info
     */
    // protected
    MessageShortener.prototype.restoreKeys = function (keys, info) {
        for (var i = 1; i < keys.length; i += 2) {
            this.moveKey(keys[i - 1], keys[i], info);
        }
    };

    ///
    ///  Compress Content
    ///
    MessageShortener.prototype.contentShortKeys = [
        "T", "type",
        "N", "sn",
        "W", "time",        // When
        "G", "group",
        "C", "command"
    ];

    // Override
    MessageShortener.prototype.compressContent = function (content) {
        this.shortenKeys(this.contentShortKeys, content);
        return content;
    };

    // Override
    MessageShortener.prototype.extractContent = function (content) {
        this.restoreKeys(this.contentShortKeys, content);
        return content;
    };

    ///
    ///  Compress SymmetricKey
    ///
    MessageShortener.prototype.cryptoShortKeys = [
        "A", "algorithm",
        "D", "data",
        "I", "iv"           // Initial Vector
    ];

    // Override
    MessageShortener.prototype.compressSymmetricKey = function (key) {
        this.shortenKeys(this.cryptoShortKeys, key);
        return key;
    };

    // Override
    MessageShortener.prototype.extractSymmetricKey = function (key) {
        this.restoreKeys(this.cryptoShortKeys, key);
        return key;
    };

    ///
    ///  Compress ReliableMessage
    ///
    MessageShortener.prototype.messageShortKeys = [
        "F", "sender",      // From
        "R", "receiver",    // Rcpt to
        "W", "time",        // When
        "T", "type",
        "G", "group",
        //------------------
        "K", "key",         // or "keys"
        "D", "data",
        "V", "signature",   // Verification
        //------------------
        "M", "meta",
        "P", "visa"         // Profile
    ];

    // Override
    MessageShortener.prototype.compressReliableMessage = function (msg) {
        this.moveKey("keys", "K", msg);
        this.shortenKeys(this.messageShortKeys, msg);
        return msg;
    };

    // Override
    MessageShortener.prototype.extractReliableMessage = function (msg) {
        var keys = msg['K'];
        if (!keys) {
            // check message data?
        } else if (IObject.isString(keys)) {
            delete msg['K'];
            msg['key'] = keys;
        } else {
            delete msg['K'];
            msg['keys'] = keys;
        }
        this.restoreKeys(this.messageShortKeys, msg);
        return msg;
    };
