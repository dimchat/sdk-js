'use strict';
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

//! require 'namespace.js'

    /**
     *  Message Packer
     *  ~~~~~~~~~~~~~~
     */
    sdk.core.Packer = Interface(null, null);
    var Packer = sdk.core.Packer;

    //
    //  InstantMessage -> SecureMessage -> ReliableMessage -> Data
    //

    /**
     *  Encrypt message content
     *
     * @param {InstantMessage} iMsg - plain message
     * @return {SecureMessage} encrypted message
     */
    Packer.prototype.encryptMessage = function (iMsg) {};

    /**
     *  Sign content data
     *
     * @param {SecureMessage} sMsg - encrypted message
     * @return {ReliableMessage} network message
     */
    Packer.prototype.signMessage = function (sMsg) {};

    // /**
    //  *  Serialize network message
    //  *
    //  * @param {ReliableMessage} rMsg - network message
    //  * @return {Uint8Array} data package
    //  */
    // Packer.prototype.serializeMessage = function (rMsg) {};

    //
    //  Data -> ReliableMessage -> SecureMessage -> InstantMessage
    //

    // /**
    //  *  Deserialize network message
    //  *
    //  * @param {Uint8Array} data - data package
    //  * @return {ReliableMessage} network message
    //  */
    // Packer.prototype.deserializeMessage = function (data) {};

    /**
     *  Verify encrypted content data
     *
     * @param {ReliableMessage} rMsg - network message
     * @return {SecureMessage} encrypted message
     */
    Packer.prototype.verifyMessage = function (rMsg) {};

    /**
     *  Decrypt message content
     *
     * @param {SecureMessage} sMsg - encrypted message
     * @return {InstantMessage} plain message
     */
    Packer.prototype.decryptMessage = function (sMsg) {};
