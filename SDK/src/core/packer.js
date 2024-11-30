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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Class                 = ns.type.Class;
    var ReliableMessage       = ns.protocol.ReliableMessage;
    var InstantMessagePacker  = ns.msg.InstantMessagePacker;
    var SecureMessagePacker   = ns.msg.SecureMessagePacker;
    var ReliableMessagePacker = ns.msg.ReliableMessagePacker
    var MessageHelper         = ns.msg.MessageHelper;
    var TwinsHelper           = ns.TwinsHelper;
    var Packer                = ns.Packer;

    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        // protected
        this.instantPacker  = new InstantMessagePacker(messenger);
        this.securePacker   = new SecureMessagePacker(messenger);
        this.reliablePacker = new ReliableMessagePacker(messenger);
    };
    Class(MessagePacker, TwinsHelper, [Packer], {

        //
        //  InstantMessage -> SecureMessage -> ReliableMessage -> Data
        //

        // Override
        encryptMessage: function (iMsg) {
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

            //
            //  2. encrypt 'content' to 'data' for receiver/group members
            //
            if (receiver.isGroup()) {
                // group message
                var members = facebook.getMembers(receiver);
                // a station will never send group message, so here must be a client;
                // the client messenger should check the group's meta & members before encrypting,
                // so we can trust that the group members MUST exist here.
                sMsg = this.instantPacker.encryptMessage(iMsg, password, members);
            } else {
                // personal message (or split group message)
                sMsg = this.instantPacker.encryptMessage(iMsg, password, null);
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
        },

        // Override
        signMessage: function (sMsg) {
            // sign 'data' by sender
            return this.securePacker.signMessage(sMsg);
        },

        // Override
        serializeMessage: function (rMsg) {
            var dict = rMsg.toMap();
            var json = ns.format.JSON.encode(dict);
            return ns.format.UTF8.encode(json);
        },

        //
        //  Data -> ReliableMessage -> SecureMessage -> InstantMessage
        //

        // Override
        deserializeMessage: function (data) {
            var json = ns.format.UTF8.decode(data);
            if (!json) {
                // message data error
                return null;
            }
            var dict = ns.format.JSON.decode(json);
            // TODO: translate short keys
            //       'S' -> 'sender'
            //       'R' -> 'receiver'
            //       'W' -> 'time'
            //       'T' -> 'type'
            //       'G' -> 'group'
            //       ------------------
            //       'D' -> 'data'
            //       'V' -> 'signature'
            //       'K' -> 'key'
            //       ------------------
            //       'M' -> 'meta'
            return ReliableMessage.parse(dict);
        },

        /**
         *  Check meta & visa
         *
         * @param {ReliableMessage|Message} rMsg - received message
         * @return {boolean} false on error
         */
        // protected
        checkAttachments: function (rMsg) {
            var sender = rMsg.getSender();
            var facebook = this.getFacebook();
            // [Meta Protocol]
            var meta = MessageHelper.getMeta(rMsg);
            if (meta) {
                facebook.saveMeta(meta, sender);
            }
            // [Visa Protocol]
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                facebook.saveDocument(visa);
            }
            //
            //  TODO: check [Visa Protocol] before calling this
            //        make sure the sender's meta(visa) exists
            //        (do it by application)
            //
            return true;
        },

        // Override
        verifyMessage: function (rMsg) {
            // make sure sender's meta exists before verifying message
            if (this.checkAttachments(rMsg)) {} else {
                return null;
            }
            // verify 'data' with 'signature'
            return this.reliablePacker.verifyMessage(rMsg);
        },

        // Override
        decryptMessage: function (sMsg) {
            // TODO: check receiver before calling this, make sure you are the receiver,
            //       or you are a member of the group when this is a group message,
            //       so that you will have a private key (decrypt key) to decrypt it.
            var receiver = sMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            if (user == null) {
                // not for you?
                throw new ReferenceError('receiver error: $receiver, from ${sMsg.sender}, ${sMsg.group}');
            }
            // decrypt 'data' to 'content'
            return this.securePacker.decryptMessage(sMsg, user.getIdentifier());

            // TODO: check top-secret message
            //       (do it by application)
        }
    });

    //-------- namespace --------
    ns.MessagePacker = MessagePacker;

})(DIMP);
