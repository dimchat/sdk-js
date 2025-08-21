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

//! require <dimp.js>

//! require 'core/delegate.js'
//! require 'core/packer.js'
//! require 'core/processor.js'
//! require 'core/transceiver.js'

    sdk.Messenger = function () {
        Transceiver.call(this);
    };
    var Messenger = sdk.Messenger;

    Class(Messenger, Transceiver, [Packer, Processor], null);

    // protected
    Messenger.prototype.getCipherKeyDelegate = function () {};

    // protected
    Messenger.prototype.getPacker = function () {};

    // protected
    Messenger.prototype.getProcessor = function () {};

    //-------- SecureMessageDelegate

    // Override
    Messenger.prototype.deserializeKey = function (keyData, sMsg) {
        if (!keyData) {
            // get key from cache with direction: sender -> receiver(group)
            return this.getDecryptKey(sMsg);
        }
        var password = Transceiver.prototype.deserializeKey.call(this, keyData, sMsg);
        // cache decrypt key when success
        if (password) {
            // cache the key with direction: sender -> receiver(group)
            this.cacheDecryptKey(password, sMsg);
        }
        return password;
    };

    //
    //  Interfaces for Cipher Key
    //

    // Override
    Messenger.prototype.getEncryptKey = function (iMsg) {
        var sender = iMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(iMsg);
        var db = this.getCipherKeyDelegate();
        return db.getCipherKey(sender, target, true);
    };

    // Override
    Messenger.prototype.getDecryptKey = function (sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var db = this.getCipherKeyDelegate();
        return db.getCipherKey(sender, target, false);
    };

    // Override
    Messenger.prototype.cacheDecryptKey = function (key, sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var db = this.getCipherKeyDelegate();
        return db.cacheCipherKey(sender, target, key);
    };

    //
    //  Interfaces for Packing Message
    //

    // Override
    Messenger.prototype.encryptMessage = function (iMsg) {
        var packer = this.getPacker();
        return packer.encryptMessage(iMsg);
    };

    // Override
    Messenger.prototype.signMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.signMessage(sMsg);
    };

    // // Override
    // Messenger.prototype.serializeMessage = function (rMsg) {
    //     var packer = this.getPacker();
    //     return packer.serializeMessage(rMsg);
    // };
    //
    // // Override
    // Messenger.prototype.deserializeMessage = function (data) {
    //     var packer = this.getPacker();
    //     return packer.deserializeMessage(data);
    // };

    // Override
    Messenger.prototype.verifyMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.verifyMessage(rMsg);
    };

    // Override
    Messenger.prototype.decryptMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.decryptMessage(sMsg);
    };

    //
    //  Interfaces for Processing Message
    //

    // Override
    Messenger.prototype.processPackage = function (data) {
        var processor = this.getProcessor();
        return processor.processPackage(data);
    };

    // Override
    Messenger.prototype.processReliableMessage = function (rMsg) {
        var processor = this.getProcessor();
        return processor.processReliableMessage(rMsg);
    };

    // Override
    Messenger.prototype.processSecureMessage = function (sMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processSecureMessage(sMsg, rMsg);
    };

    // Override
    Messenger.prototype.processInstantMessage = function (iMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processInstantMessage(iMsg, rMsg);
    };

    // Override
    Messenger.prototype.processContent = function (content, rMsg) {
        var processor = this.getProcessor();
        return processor.processContent(content, rMsg);
    };
