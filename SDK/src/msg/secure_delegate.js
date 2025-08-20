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
     *  Secure Message Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    SecureMessage.Delegate = Interface(null, null);
    var SecureMessageDelegate = SecureMessage.Delegate;

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

    //
    //  Decrypt Key
    //

    // /**
    //  *  1. Decode 'message.key' to encrypted symmetric key data
    //  *
    //  * @param {String} key         - Base64 string
    //  * @param {SecureMessage} sMsg - secure message object
    //  * @returns {Uint8Array} encrypted symmetric key data
    //  */
    // SecureMessageDelegate.prototype.decodeKey = function (key, sMsg) {};

    /**
     *  2. Decrypt 'message.key' with receiver's private key
     *
     * @param {Uint8Array} data    - encrypted symmetric key data
     * @param {ID} receiver        - actual receiver (user, or group member)
     * @param {SecureMessage} sMsg - secure message object
     * @returns {Uint8Array} serialized symmetric key
     */
    SecureMessageDelegate.prototype.decryptKey = function (data, receiver, sMsg) {};

    /**
     *  3. Deserialize message key from data (JsON / ProtoBuf / ...)
     *     (if key data is empty, means it should be reused, get it from key cache)
     *
     * @param {Uint8Array} data    - serialized key data, null for reused key
     * @param {SecureMessage} sMsg - secure message object
     * @returns {SymmetricKey} symmetric key
     */
    SecureMessageDelegate.prototype.deserializeKey = function (data, sMsg) {};

    //
    //  Decrypt Content
    //

    // /**
    //  *  4. Decode 'message.data' to encrypted content data
    //  *
    //  * @param {String} data        - Base64 string
    //  * @param {SecureMessage} sMsg - secure message object
    //  * @returns {Uint8Array} encrypt content data
    //  */
    // SecureMessageDelegate.prototype.decodeData = function (data, sMsg) {};

    /**
     *  5. Decrypt 'message.data' with symmetric key
     *
     * @param {Uint8Array} data    - encrypt content data
     * @param {SymmetricKey} pwd   - symmetric key
     * @param {SecureMessage} sMsg - secure message object
     * @returns {Uint8Array} serialized message content
     */
    SecureMessageDelegate.prototype.decryptContent = function (data, pwd, sMsg) {};

    /**
     *  6. Deserialize message content from data (JsON / ProtoBuf / ...)
     *
     * @param {Uint8Array} data    - serialized message content
     * @param {SymmetricKey} pwd   - symmetric key (includes data compression algorithm)
     * @param {SecureMessage} sMsg - secure message object
     * @returns {Content} message content
     */
    SecureMessageDelegate.prototype.deserializeContent = function (data, pwd, sMsg) {};

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

    //
    //  Signature
    //

    /**
     *  1. Sign 'message.data' with sender's private key
     *
     * @param {Uint8Array} data    - encrypted message data
     * @param {SecureMessage} sMsg - secure message object
     * @returns {Uint8Array} signature of encrypted message data
     */
    SecureMessageDelegate.prototype.signData = function (data, sMsg) {};

    // /**
    //  *  2. Encode 'message.signature' to String (Base64)
    //  *
    //  * @param {Uint8Array} signature - signature of message.data
    //  * @param {SecureMessage} sMsg   - secure message object
    //  * @returns {String} Base64 string
    //  */
    // SecureMessageDelegate.prototype.encodeSignature = function (signature, sMsg) {};
