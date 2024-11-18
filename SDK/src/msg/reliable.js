;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

    var Class             = ns.type.Class;
    var SecureMessage     = ns.protocol.SecureMessage;

    var ReliableMessagePacker = function (messenger) {
        this.__transceiver = messenger;  // ReliableMessageDelegate
    };
    Class(ReliableMessagePacker, null, null, null);

    ReliableMessagePacker.prototype.getReliableMessageDelegate = function () {
        return this.__transceiver;
    };

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

    /**
     *  Verify 'data' and 'signature' field with sender's public key
     *
     * @param {ReliableMessage|SecureMessage|Mapper} rMsg - network message
     * @return {SecureMessage} null if signature not matched
     */
    ReliableMessagePacker.prototype.verifyMessage = function (rMsg) {
        var transceiver = this.getReliableMessageDelegate();

        //
        //  0. Decode 'message.data' to encrypted content data
        //
        var ciphertext = rMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            // ERROR: failed to decode message data
            return null;
        }

        //
        //  1. Decode 'message.signature' from String (Base64)
        //
        var signature = rMsg.getSignature();
        if (!signature || signature.length === 0) {
            // ERROR: failed to decode message signature
            return null;
        }

        //
        //  2. Verify the message data and signature with sender's public key
        //
        var ok = transceiver.verifyDataSignature(ciphertext, signature, rMsg);
        if (!ok) {
            // ERROR: message signature not match
            return null;
        }

        // OK, pack message
        var info = rMsg.copyMap(false);
        delete info['signature'];
        return SecureMessage.parse(info);
    };

    //-------- namespace --------
    ns.msg.ReliableMessagePacker = ReliableMessagePacker;

})(DIMP);
