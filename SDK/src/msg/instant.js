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
    var UTF8              = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var SecureMessage     = ns.protocol.SecureMessage;
    var BaseMessage       = ns.msg.BaseMessage;

    var InstantMessagePacker = function (messenger) {
        this.__transceiver = messenger;  // InstantMessageDelegate
    };
    Class(InstantMessagePacker, null, null, null);

    InstantMessagePacker.prototype.getInstantMessageDelegate = function () {
        return this.__transceiver;
    };

    /*
     *  Encrypt the Instant Message to Secure Message
     *
     *    +----------+      +----------+
     *    | sender   |      | sender   |
     *    | receiver |      | receiver |
     *    | time     |  ->  | time     |
     *    |          |      |          |
     *    | content  |      | data     |  1. data = encrypt(content, PW)
     *    +----------+      | key/keys |  2. key  = encrypt(PW, receiver.PK)
     *                      +----------+
     */

    /**
     *  1. Encrypt message, replace 'content' field with encrypted 'data'
     *  2. Encrypt group message, replace 'content' field with encrypted 'data'
     *
     * @param {InstantMessage|Message|Mapper} iMsg - plain message
     * @param {SymmetricKey} password              - symmetric key
     * @param {ID[]} members                       - group members for group message
     * @return {SecureMessage} encrypted message, null on visa not found
     */
    InstantMessagePacker.prototype.encryptMessage = function (iMsg, password, members) {
        // TODO: check attachment for File/Image/Audio/Video message content
        //      (do it by application)
        var transceiver = this.getInstantMessageDelegate();

        //
        //  1. Serialize 'message.content' to data (JsON / ProtoBuf / ...)
        //
        var body = transceiver.serializeContent(iMsg.getContent(), password, iMsg);

        //
        //  2. Encrypt content data to 'message.data' with symmetric key
        //
        var ciphertext = transceiver.encryptContent(body, password, iMsg);

        //
        //  3. Encode 'message.data' to String (Base64)
        //
        var encodedData;
        if (BaseMessage.isBroadcast(iMsg)) {
            // broadcast message content will not be encrypted (just encoded to JsON),
            // so no need to encode to Base64 here
            encodedData = UTF8.decode(ciphertext);
        } else {
            // message content had been encrypted by a symmetric key,
            // so the data should be encoded here (with algorithm 'base64' as default).
            encodedData = TransportableData.encode(ciphertext);
        }

        // replace 'content' with encrypted 'data'
        var info = iMsg.copyMap(false);
        delete info['content'];
        info['data'] = encodedData;

        //
        //  4. Serialize message key to data (JsON / ProtoBuf / ...)
        //
        var pwd = transceiver.serializeKey(password, iMsg);
        if (!pwd) {
            // A) broadcast message has no key
            // B) reused key
            return SecureMessage.parse(info);
        }
        var receiver;

        var encryptedKey;  // Uint8Array
        var encodedKey;
        if (!members) // personal message
        {
            receiver = iMsg.getReceiver();
            //
            //  5. Encrypt key data to 'message.key/keys' with receiver's public key
            //
            encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
            if (!encryptedKey) {
                // public key for encryption not found
                // TODO: suspend this message for waiting receiver's visa
                return null;
            }
            //
            //  6. Encode message key to String (Base64)
            //
            encodedKey = TransportableData.encode(encryptedKey);
            // insert as 'key'
            info['key'] = encodedKey;
        }
        else // group message
        {
            var keys = {};  // string => string
            for (var i = 0; i < members.length; ++i) {
                receiver = members[i];
                //
                //  5. Encrypt key data to 'message.keys' with member's public key
                //
                encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
                if (!encryptedKey) {
                    // public key for encryption not found
                    // TODO: suspend this message for waiting receiver's visa
                    return null;
                }
                //
                //  6. Encode message key to String (Base64)
                //
                encodedKey = TransportableData.encode(encryptedKey);
                // insert to 'message.keys' with member ID
                keys[receiver.toString()] = encodedKey;
            }
            if (Object.keys(keys).length === 0) {
                // public key for member(s) not found
                // TODO: suspend this message for waiting member's visa
                return null;
            }
            // insert as 'keys'
            info['keys'] = keys;
        }

        // OK, pack message
        return SecureMessage.parse(info);
    };

    //-------- namespace --------
    ns.msg.InstantMessagePacker = InstantMessagePacker;

})(DIMP);
