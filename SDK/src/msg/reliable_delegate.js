'use strict';
// license: https://mit-license.org
//
//  Dao-Ke-Dao: Universal Message Module
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

    /**
     *  Reliable Message Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    ReliableMessage.Delegate = Interface(null, null/*[SecureMessage.Delegate]*/);
    var ReliableMessageDelegate = ReliableMessage.Delegate;

    /*
     *  Verify the Reliable Message to Secure Message
     *
     *    +----------+      +----------+
     *    | sender   |      | sender   |
     *    | receiver |      | receiver |
     *    | time     |  ->  | time     |
     *    |          |      |          |
     *    | data     |      | data     |  1. verify(data, signature, sender.PK)
     *    | key/keys |      | key/keys |
     *    | signature|      +----------+
     *    +----------+
     */

    // /**
    //  *  1. Decode 'message.signature' from String (Base64)
    //  *
    //  * @param {String} signature     - Base64 string
    //  * @param {ReliableMessage} rMsg - reliable message
    //  * @returns {Uint8Array} signature
    //  */
    // ReliableMessageDelegate.prototype.decodeSignature = function (signature, rMsg) {};

    /**
     *  2. Verify the message data and signature with sender's public key
     *
     * @param {Uint8Array} data      - message content(encrypted) data
     * @param {Uint8Array} signature - signature for message content(encrypted) data
     * @param {ReliableMessage} rMsg - reliable message
     * @returns {boolean} true on signature matched
     */
    ReliableMessageDelegate.prototype.verifyDataSignature = function (data, signature, rMsg) {};
