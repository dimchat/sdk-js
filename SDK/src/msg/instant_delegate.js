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
     *  Instant Message Delegate
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    InstantMessage.Delegate = Interface(null, null);
    var InstantMessageDelegate = InstantMessage.Delegate;

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

    //
    //  Encrypt Content
    //

    /**
     *  1. Serialize 'message.content' to data (JsON / ProtoBuf / ...)
     *
     * @param {Content} content     - message.content
     * @param {SymmetricKey} pwd    - symmetric key (includes data compression algorithm)
     * @param {InstantMessage} iMsg - instant message object
     * @return {Uint8Array} serialized content data
     */
    InstantMessageDelegate.prototype.serializeContent = function (content, pwd, iMsg) {};

    /**
     *  2. Encrypt content data to 'message.data' with symmetric key
     *
     * @param {Uint8Array} data     - serialized data of message.content
     * @param {SymmetricKey} pwd    - symmetric key
     * @param {InstantMessage} iMsg - instant message object
     * @return {Uint8Array} encrypted message content data
     */
    InstantMessageDelegate.prototype.encryptContent = function (data, pwd, iMsg) {};

    // /**
    //  *  3. Encode 'message.data' to String (Base64)
    //  *
    //  * @param {Uint8Array} data     - encrypted content data
    //  * @param {InstantMessage} iMsg - instant message object
    //  * @returns {String} Base64 string
    //  */
    // InstantMessageDelegate.prototype.encodeData = function (data, iMsg) {};

    //
    //  Encrypt Key
    //

    /**
     *  4. Serialize message key to data (JsON / ProtoBuf / ...)
     *
     * @param {SymmetricKey} pwd    - symmetric key
     * @param {InstantMessage} iMsg - instant message object
     * @return {Uint8Array} serialized key data, null for reused (or broadcast message)
     */
    InstantMessageDelegate.prototype.serializeKey = function (pwd, iMsg) {};

    /**
     *  5. Encrypt key data to 'message.key' with receiver's public key
     *
     * @param {Uint8Array} data     - serialized data of symmetric key
     * @param {ID} receiver         - actual receiver (user, or group member)
     * @param {InstantMessage} iMsg - instant message object
     * @returns {Uint8Array} encrypted symmetric key data, null on visa not found
     */
    InstantMessageDelegate.prototype.encryptKey = function (data, receiver, iMsg) {};

    // /**
    //  *  6. Encode 'message.key' to String (Base64)
    //  *
    //  * @param {Uint8Array} data     - encrypted key data
    //  * @param {InstantMessage} iMsg - instant message object
    //  * @returns {String} Base64 string
    //  */
    // InstantMessageDelegate.prototype.encodeKey = function (data, iMsg) {};
