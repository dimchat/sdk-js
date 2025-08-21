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
//! require 'msg/base.js'

    /**
     *  Message Transceiver
     *  ~~~~~~~~~~~~~~~~~~~
     *
     *  Converting message format between PlainMessage and NetworkMessage
     */
    sdk.core.Transceiver = function () {
        BaseObject.call(this);
    };
    var Transceiver = sdk.core.Transceiver;

    Class(Transceiver, BaseObject, [
        InstantMessageDelegate, SecureMessageDelegate, ReliableMessageDelegate
    ], null);

    // protected
    Transceiver.prototype.getFacebook = function () {};

    // protected
    Transceiver.prototype.getCompressor = function () {};

    /**
     *  Serialize network message
     *
     * @param {ReliableMessage|mk.type.Mapper} rMsg
     * @return {Uint8Array} data package
     */
    Transceiver.prototype.serializeMessage = function (rMsg) {
        var info = rMsg.toMap();
        var compressor = this.getCompressor();
        return compressor.compressReliableMessage(info);
    };

    /**
     *  Deserialize network message
     *
     * @param {Uint8Array} data
     * @return {ReliableMessage}
     */
    Transceiver.prototype.deserializeMessage = function (data) {
        var compressor = this.getCompressor();
        var info = compressor.extractReliableMessage(data);
        return ReliableMessage.parse(info);
    };

    //-------- InstantMessage Delegate --------

    // Override
    Transceiver.prototype.serializeContent = function (content, pwd, iMsg) {
        // NOTICE: check attachment for File/Image/Audio/Video message content
        //         before serialize content, this job should be do in subclass
        var compressor = this.getCompressor();
        return compressor.compressContent(content.toMap(), pwd.toMap());
    };

    // Override
    Transceiver.prototype.encryptContent = function (data, pwd, iMsg) {
        // store 'IV' in iMsg for AES decryption
        return pwd.encrypt(data, iMsg.toMap());
    };

    // // Override
    // Transceiver.prototype.encodeData = function (data, iMsg) {
    //     if (BaseMessage.isBroadcast(iMsg)) {
    //         // broadcast message content will not be encrypted (just encoded to JsON),
    //         // so no need to encode to Base64 here
    //         return UTF8.decode(data);
    //     }
    //     // message content had been encrypted by a symmetric key,
    //     // so the data should be encoded here (with algorithm 'base64' as default).
    //     return TransportableData.encode(data);
    // };

    // Override
    Transceiver.prototype.serializeKey = function (pwd, iMsg) {
        if (BaseMessage.isBroadcast(iMsg)) {
            // broadcast message has no key
            return null;
        }
        var compressor = this.getCompressor();
        return compressor.compressSymmetricKey(pwd.toMap());
    };

    // Override
    Transceiver.prototype.encryptKey = function (keyData, receiver, iMsg) {
        var facebook = this.getEntityDelegate();
        // TODO: make sure the receiver's public key exists
        var contact = facebook.getUser(receiver);
        if (!contact) {
            // error
            return null;
        }
        // encrypt with public key of the receiver (or group member)
        return contact.encrypt(keyData);
    };

    // // Override
    // Transceiver.prototype.encodeKey = function (keyData, iMsg) {
    //     // message key had been encrypted by a public key,
    //     // so the data should be encode here (with algorithm 'base64' as default).
    //     return TransportableData.encode(keyData);
    // };

    //-------- SecureMessage Delegate --------

    // // Override
    // Transceiver.prototype.decodeKey = function (key, sMsg) {
    //     return TransportableData.decode(key);
    // };

    // Override
    Transceiver.prototype.decryptKey = function (keyData, receiver, sMsg) {
        // NOTICE: the receiver must be a member ID
        //         if it's a group message
        var facebook = this.getEntityDelegate();
        var user = facebook.getUser(receiver);
        if (!user) {
            // error
            return null;
        }
        // decrypt with private key of the receiver (or group member)
        return user.decrypt(keyData);
    };

    // Override
    Transceiver.prototype.deserializeKey = function (keyData, sMsg) {
        if (!keyData) {
            // key data is empty
            // reused key? get it from cache
            return null;
        }
        var compressor = this.getCompressor();
        var info = compressor.extractSymmetricKey(keyData);
        return SymmetricKey.parse(info);
    };

    // // Override
    // Transceiver.prototype.decodeData = function (data, sMsg) {
    //     if (BaseMessage.isBroadcast(sMsg)) {
    //         // broadcast message content will not be encrypted (just encoded to JsON),
    //         // so return the string data directly
    //         return UTF8.encode(data);
    //     }
    //     // message content had been encrypted by a symmetric key,
    //     // so the data should be encoded here (with algorithm 'base64' as default).
    //     return TransportableData.decode(data);
    // };

    // Override
    Transceiver.prototype.decryptContent = function (data, pwd, sMsg) {
        // check 'IV' in sMsg for AES decryption
        return pwd.decrypt(data, sMsg.toMap());
    };

    // Override
    Transceiver.prototype.deserializeContent = function (data, pwd, sMsg) {
        var compressor = this.getCompressor();
        var info = compressor.extractContent(data, pwd.toMap());
        return Content.parse(info);
        // NOTICE: check attachment for File/Image/Audio/Video message content
        //         after deserialize content, this job should be do in subclass
    };

    // Override
    Transceiver.prototype.signData = function (data, sMsg) {
        var facebook = this.getEntityDelegate();
        var sender = sMsg.getSender();
        var user = facebook.getUser(sender);
        return user.sign(data);
    };

    // // Override
    // Transceiver.prototype.encodeSignature = function (signature, sMsg) {
    //     return TransportableData.encode(signature);
    // };

    //-------- ReliableMessage Delegate --------

    // // Override
    // Transceiver.prototype.decodeSignature = function (signature, rMsg) {
    //     return TransportableData.decode(signature);
    // };

    // Override
    Transceiver.prototype.verifyDataSignature = function (data, signature, rMsg) {
        var facebook = this.getEntityDelegate();
        var sender = rMsg.getSender();
        var contact = facebook.getUser(sender);
        if (!contact) {
            // error
            return false;
        }
        return contact.verify(data, signature);
    };
