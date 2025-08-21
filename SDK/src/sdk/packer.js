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

    sdk.MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__instantPacker  = this.createInstantMessagePacker(messenger);
        this.__securePacker   = this.createSecureMessagePacker(messenger);
        this.__reliablePacker = this.createReliableMessagePacker(messenger);
    };
    var MessagePacker = sdk.MessagePacker;

    Class(MessagePacker, TwinsHelper, [Packer], null);

    // protected
    MessagePacker.prototype.createInstantMessagePacker = function (delegate) {
        return new InstantMessagePacker(delegate);
    };
    MessagePacker.prototype.createSecureMessagePacker = function (delegate) {
        return new SecureMessagePacker(delegate);
    };
    MessagePacker.prototype.createReliableMessagePacker = function (delegate) {
        return new ReliableMessagePacker(delegate);
    };

    // protected
    MessagePacker.prototype.getInstantMessagePacker = function () {
        return this.__instantPacker;
    };
    MessagePacker.prototype.getSecureMessagePacker = function () {
        return this.__securePacker;
    };
    MessagePacker.prototype.getReliableMessagePacker = function () {
        return this.__reliablePacker;
    };

    // protected
    MessagePacker.prototype.getArchivist = function () {
        var facebook = this.getFacebook();
        if (facebook) {
            return facebook.getArchivist();
        } else {
            return null;
        }
    };

    //
    //  InstantMessage -> SecureMessage -> ReliableMessage -> Data
    //

    // Override
    MessagePacker.prototype.encryptMessage = function (iMsg) {
        // TODO: check receiver before calling this, make sure the visa.key exists;
        //       otherwise, suspend this message for waiting receiver's visa/meta;
        //       if receiver is a group, query all members' visa too!
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();

        var sMsg;
        // NOTICE: before sending group message, you can decide whether expose the group ID
        //      (A) if you don't want to expose the group ID,
        //          you can split it to multi-messages before encrypting,
        //          replace the 'receiver' to each member and keep the group hidden in the content;
        //          in this situation, the packer will use the personal message key (user to user);
        //      (B) if the group ID is overt, no need to worry about the exposing,
        //          you can keep the 'receiver' being the group ID, or set the group ID as 'group'
        //          when splitting to multi-messages to let the remote packer knows it;
        //          in these situations, the local packer will use the group msg key (user to group)
        //          to encrypt the message, and the remote packer can get the overt group ID before
        //          decrypting to take the right message key.
        var receiver = iMsg.getReceiver();

        //
        //  1. get message key with direction (sender -> receiver) or (sender -> group)
        //
        var password = messenger.getEncryptKey(iMsg);
        if (!password) {
            // failed to get msg key
            return null;
        }
        var instantPacker = this.getInstantMessagePacker();

        //
        //  2. encrypt 'content' to 'data' for receiver/group members
        //
        if (receiver.isGroup()) {
            // group message
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                // group not ready
                return null;
            }
            // a station will never send group message, so here must be a client;
            // the client messenger should check the group's meta & members before encrypting,
            // so we can trust that the group members MUST exist here.
            sMsg = instantPacker.encryptMessage(iMsg, password, members);
        } else {
            // personal message (or split group message)
            sMsg = instantPacker.encryptMessage(iMsg, password, null);
        }
        if (sMsg == null) {
            // public key for encryption not found
            // TODO: suspend this message for waiting receiver's meta
            return null;
        }

        // NOTICE: copy content type to envelope
        //         this help the intermediate nodes to recognize message type
        sMsg.getEnvelope().setType(iMsg.getContent().getType());

        // OK
        return sMsg;
    };

    // Override
    MessagePacker.prototype.signMessage = function (sMsg) {
        var securePacker = this.getSecureMessagePacker();
        // sign 'data' by sender
        return securePacker.signMessage(sMsg);
    };

    // // Override
    // MessagePacker.prototype.serializeMessage = function (rMsg) {
    //     var compressor = this.getCompressor();
    //     return compressor.compressReliableMessage(rMsg.toMap());
    // };

    //
    //  Data -> ReliableMessage -> SecureMessage -> InstantMessage
    //

    // // Override
    // MessagePacker.prototype.deserializeMessage = function (data) {
    //     var compressor = this.getCompressor();
    //     var info = compressor.extractReliableMessage(data);
    //     return ReliableMessage.parse(info);
    // };

    /**
     *  Check meta & visa
     *
     * @param {ReliableMessage|dkd.protocol.Message} rMsg - received message
     * @return {boolean} false on error
     */
    // protected
    MessagePacker.prototype.checkAttachments = function (rMsg) {
        var archivist = this.getArchivist();
        if (!archivist) {
            // archivist not ready
            return false;
        }
        var sender = rMsg.getSender();
        // [Meta Protocol]
        var meta = MessageUtils.getMeta(rMsg);
        if (meta) {
            archivist.saveMeta(meta, sender);
        }
        // [Visa Protocol]
        var visa = MessageUtils.getVisa(rMsg);
        if (visa) {
            archivist.saveDocument(visa);
        }
        //
        //  TODO: check [Visa Protocol] before calling this
        //        make sure the sender's meta(visa) exists
        //        (do it by application)
        //
        return true;
    };

    // Override
    MessagePacker.prototype.verifyMessage = function (rMsg) {
        // make sure sender's meta exists before verifying message
        if (this.checkAttachments(rMsg)) {} else {
            return null;
        }
        var reliablePacker = this.getReliableMessagePacker();
        // verify 'data' with 'signature'
        return reliablePacker.verifyMessage(rMsg);
    };

    // Override
    MessagePacker.prototype.decryptMessage = function (sMsg) {
        // TODO: check receiver before calling this, make sure you are the receiver,
        //       or you are a member of the group when this is a group message,
        //       so that you will have a private key (decrypt key) to decrypt it.
        var receiver = sMsg.getReceiver();
        var facebook = this.getFacebook();
        var me = facebook.selectLocalUser(receiver);
        if (me == null) {
            // not for you?
            throw new ReferenceError('receiver error: ' + receiver.toString()
                + ', from ' + sMsg.getSender().toString() + ', ' + sMsg.getGroup());
        }
        var securePacker = this.getSecureMessagePacker();
        // decrypt 'data' to 'content'
        return securePacker.decryptMessage(sMsg, me);

        // TODO: check top-secret message
        //       (do it by application)
    };
