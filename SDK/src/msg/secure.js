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
    var TransportableData = ns.format.TransportableData;
    var InstantMessage    = ns.protocol.InstantMessage;
    var SecureMessage     = ns.protocol.SecureMessage;
    var ReliableMessage   = ns.protocol.ReliableMessage;

    var SecureMessagePacker = function (messenger) {
        this.__transceiver = messenger;  // SecureMessageDelegate
    };
    Class(SecureMessagePacker, null, null, null);

    SecureMessagePacker.prototype.getSecureMessageDelegate = function () {
        return this.__transceiver;
    };

    /*
     *  Decrypt the Secure Message to Instant Message
     *
     *    +----------+      +----------+
     *    | sender   |      | sender   |
     *    | receiver |      | receiver |
     *    | time     |  ->  | time     |
     *    |          |      |          |  1. PW      = decrypt(key, receiver.SK)
     *    | data     |      | content  |  2. content = decrypt(data, PW)
     *    | key/keys |      +----------+
     *    +----------+
     */

    /**
     *  Decrypt message, replace encrypted 'data' with 'content' field
     *
     * @param {SecureMessage|Message|Mapper} sMsg - encrypted message
     * @param {ID} receiver                       - actual receiver (local user)
     * @return {InstantMessage} plain message
     */
    SecureMessagePacker.prototype.decryptMessage = function (sMsg, receiver) {
        var transceiver = this.getSecureMessageDelegate();

        //
        //  1. Decode 'message.key' to encrypted symmetric key data
        //
        var encryptedKey = sMsg.getEncryptedKey();
        var keyData;  // Uint8Array
        if (encryptedKey) {
            //
            //  2. Decrypt 'message.key' with receiver's private key
            //
            keyData = transceiver.decryptKey(encryptedKey, receiver, sMsg);
            if (!keyData) {
                // A: my visa updated but the sender doesn't got the new one;
                // B: key data error.
                throw new ReferenceError('failed to decrypt message key: ' + encryptedKey.length + ' byte(s) '
                    + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
                // TODO: check whether my visa key is changed, push new visa to this contact
            }
        }

        //
        //  3. Deserialize message key from data (JsON / ProtoBuf / ...)
        //     (if key is empty, means it should be reused, get it from key cache)
        //
        var password = transceiver.deserializeKey(keyData, sMsg);
        if (!password) {
            // A: key data is empty, and cipher key not found from local storage;
            // B: key data error.
            throw new ReferenceError('failed to get message key: ' + keyData.length + ' byte(s) '
                + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
            // TODO: ask the sender to send again (with new message key)
        }

        //
        //  4. Decode 'message.data' to encrypted content data
        //
        var ciphertext = sMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            // ERROR: failed to decode message data
            return null;
        }

        //
        //  5. Decrypt 'message.data' with symmetric key
        //
        var body = transceiver.decryptContent(ciphertext, password, sMsg);
        if (!body) {
            // A: password is a reused key loaded from local storage, but it's expired;
            // B: key error.
            throw new ReferenceError('failed to decrypt message data with key: ' + password
                + ', data length: ' + ciphertext.length + ' byte(s)');
            // TODO: ask the sender to send again
        }

        //
        //  6. Deserialize message content from data (JsON / ProtoBuf / ...)
        //
        var content = transceiver.deserializeContent(body, password, sMsg);
        if (!content) {
            // ERROR: failed to deserialize content
            return null;
        }

        // TODO: check attachment for File/Image/Audio/Video message content
        //      if URL exists, means file data was uploaded to a CDN,
        //          1. save password as 'content.key';
        //          2. try to download file data from CDN;
        //          3. decrypt downloaded data with 'content.key'.
        //      (do it by application)

        // OK, pack message
        var info = sMsg.copyMap(false);
        delete info['key'];
        delete info['keys'];
        delete info['data'];
        info['content'] = content.toMap();
        return InstantMessage.parse(info);
    };

    /*
     *  Sign the Secure Message to Reliable Message
     *
     *    +----------+      +----------+
     *    | sender   |      | sender   |
     *    | receiver |      | receiver |
     *    | time     |  ->  | time     |
     *    |          |      |          |
     *    | data     |      | data     |
     *    | key/keys |      | key/keys |
     *    +----------+      | signature|  1. signature = sign(data, sender.SK)
     *                      +----------+
     */

    /**
     *  Sign message.data, add 'signature' field
     *
     * @param {SecureMessage|Mapper} sMsg - encrypted message
     * @return {ReliableMessage} network message
     */
    SecureMessagePacker.prototype.signMessage = function (sMsg) {
        var transceiver = this.getSecureMessageDelegate();

        //
        //  0. decode message data
        //
        var ciphertext = sMsg.getData();

        //
        //  1. Sign 'message.data' with sender's private key
        //
        var signature = transceiver.signData(ciphertext, sMsg);

        //
        //  2. Encode 'message.signature' to String (Base64)
        //
        var base64 = TransportableData.encode(signature);

        // OK, pack message
        var info = sMsg.copyMap(false);
        info['signature'] = base64;
        return ReliableMessage.parse(info);
    };

    //-------- namespace --------
    ns.msg.SecureMessagePacker = SecureMessagePacker;

})(DIMP);
