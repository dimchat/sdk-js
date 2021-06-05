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

!function (ns) {
    'use strict';

    var CorePacker = ns.core.Packer;

    var MessagePacker = function (messenger) {
        CorePacker.call(this, messenger);
    };
    ns.Class(MessagePacker, CorePacker, null);

    MessagePacker.prototype.getMessenger = function () {
        return this.getTransceiver();
    };

    MessagePacker.prototype.getFacebook = function () {
        return this.getMessenger().getFacebook();
    };

    var is_waiting = function (identifier, facebook) {
        if (identifier.isGroup()) {
            // checking group meta
            return !facebook.getMeta(identifier);
        } else {
            return !facebook.getPublicKeyForEncryption(identifier);
        }
    };

    MessagePacker.prototype.encryptMessage = function (iMsg) {
        var receiver = iMsg.getReceiver();
        var group = iMsg.getGroup();
        if (!(receiver.isBroadcast() || (group && group.isBroadcast()))) {
            // this message is not a broadcast message
            var fb = this.getFacebook();
            if (is_waiting(receiver, fb) || (group && is_waiting(group, fb))) {
                // NOTICE: the application will query visa automatically,
                //         save this message in a queue waiting sender's visa response
                this.getMessenger().suspendMessage(iMsg);
                return null;
            }
        }

        // make sure visa.key exists before encrypting message
        return CorePacker.prototype.encryptMessage.call(this, iMsg);
    };

    MessagePacker.prototype.verifyMessage = function (rMsg) {
        var facebook = this.getFacebook();
        var sender = rMsg.getSender();
        // [Meta Protocol]
        var meta = rMsg.getMeta();
        if (!meta) {
            // get from local storage
            meta = facebook.getMeta(sender);
        } else if (!facebook.saveMeta(meta, sender)) {
            // failed to save meta attached to message
            meta = null;
        }
        if (!meta) {
            // NOTICE: the application will query meta automatically,
            //         save this message in a queue waiting sender's meta response
            this.getMessenger().suspendMessage(rMsg);
            return null;
        }
        // [Visa Protocol]
        var visa = rMsg.getVisa();
        if (visa != null) {
            // check visa attached to message
            facebook.saveDocument(visa);
        }

        // make sure meta exists before verifying message
        return CorePacker.prototype.verifyMessage.call(this, rMsg);
    };

    MessagePacker.prototype.decryptMessage = function (sMsg) {
        var messenger = this.getMessenger();
        // check message delegate
        if (sMsg.getDelegate() == null) {
            sMsg.setDelegate(messenger);
        }
        var receiver = sMsg.getReceiver();
        var user = messenger.selectLocalUser(receiver);
        var trimmed;
        if (!user) {
            // current users not match
            trimmed = null;
        } else if (receiver.isGroup()) {
            // trim group message
            trimmed = sMsg.trim(user.identifier);
        } else {
            trimmed = sMsg;
        }
        if (!trimmed) {
            // not for you?
            throw new ReferenceError("receiver error: " + sMsg.getMap());
        }

        // make sure private key (decrypt key) exists before decrypting message
        return CorePacker.prototype.decryptMessage.call(this, sMsg);
    };

    //-------- namespace --------
    ns.MessagePacker = MessagePacker;

    ns.register('MessagePacker');

}(DIMP);
