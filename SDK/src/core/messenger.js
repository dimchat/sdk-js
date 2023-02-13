;
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

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Cipher Key Delegate
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var CipherKeyDelegate = Interface(null, null);

    /**
     *  Get cipher key for encrypt message from 'sender' to 'receiver'
     *
     * @param {ID} from          - sender (user or contact ID)
     * @param {ID} to            - receiver (contact or user/group ID)
     * @param {boolean} generate - generate when key not exists
     * @returns {SymmetricKey}
     */
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        throw new Error('NotImplemented');
    };

    /**
     *  Cache cipher key for reusing, with the direction (from 'sender' to 'receiver')
     *
     * @param {ID} from          - sender (user or contact ID)
     * @param {ID} to            - receiver (contact or user/group ID)
     * @param {SymmetricKey} key
     */
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        throw new Error('NotImplemented');
    };

    //-------- namespace --------
    ns.CipherKeyDelegate = CipherKeyDelegate;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Transceiver = ns.Transceiver;

    var Messenger = function () {
        Transceiver.call(this);
    };
    Class(Messenger, Transceiver, null, null);

    // protected
    Messenger.prototype.getCipherKeyDelegate = function () {
        throw new Error('NotImplemented');
    };

    // protected
    Messenger.prototype.getPacker = function () {
        throw new Error('NotImplemented');
    };

    // protected
    Messenger.prototype.getProcessor = function () {
        throw new Error('NotImplemented');
    };

    //
    //  Interfaces for Cipher Key
    //

    // Override
    Messenger.prototype.getCipherKey = function (from, to, generate) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(from, to, generate);
    };

    // Override
    Messenger.prototype.cacheCipherKey = function (from, to, key) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.cacheCipherKey(from, to, key);
    };

    //
    //  Interfaces for Packing Message
    //

    // Override
    Messenger.prototype.getOvertGroup = function (content) {
        var packer = this.getPacker();
        return packer.getOvertGroup(content);
    };

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

    // Override
    Messenger.prototype.serializeMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.serializeMessage(rMsg);
    };

    // Override
    Messenger.prototype.deserializeMessage = function (data) {
        var packer = this.getPacker();
        return packer.deserializeMessage(data);
    };

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

    //
    //  SecureMessage Delegate
    //

    // Override
    Messenger.prototype.deserializeKey = function (data, sender, receiver, sMsg) {
        if (!data) {
            // get key fro cache
            return this.getCipherKey(sender, receiver, false);
        }
        return Transceiver.prototype.deserializeKey.call(this, data, sender, receiver, sMsg);
    };

    // Override
    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!is_broadcast(sMsg)) {
            // check and cache key for reuse
            var group = this.getOvertGroup(content);
            if (group) {
                // group message (excludes group command)
                // cache the key with direction (sender => group)
                this.cacheCipherKey(sMsg.getSender(), group, pwd);
            } else {
                // personal message or (group) command
                // cache key with direction (sender => receiver)
                this.cacheCipherKey(sMsg.getSender(), sMsg.getReceiver(), pwd);
            }
        }
        // NOTICE: check attachment for File/Image/Audio/Video message content
        //         after deserialize content, this job should be do in subclass
        return content;
    };

    var is_broadcast = function (msg) {
        // var receiver = msg.getGroup();
        // if (!receiver) {
        //     receiver = msg.getReceiver();
        // }
        // return receiver.isBroadcast();
        return Transceiver.prototype.isBroadcast(msg);
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

})(DIMP);
