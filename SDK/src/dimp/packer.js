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

    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Packer = ns.core.Packer;
    var TwinsHelper = ns.TwinsHelper;

    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(MessagePacker, TwinsHelper, [Packer], {

        // Override
        getOvertGroup: function (content) {
            var group = content.getGroup();
            if (!group) {
                return null;
            }
            if (group.isBroadcast()) {
                // broadcast message is always overt
                return group;
            }
            if (ns.Interface.conforms(content, Command)) {
                // group command should be sent to each member directly, so
                // don't expose group ID
                return null;
            }
            return group;
        },

        //
        //  InstantMessage -> SecureMessage -> ReliableMessage -> Data
        //

        // Override
        encryptMessage: function (iMsg) {
            var messenger = this.getMessenger();
            // check message delegate
            if (!iMsg.getDelegate()) {
                iMsg.setDelegate(messenger);
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            // if 'group' exists and the 'receiver' is a group ID,
            // they must be equal

            // NOTICE: while sending group message, don't split it before encrypting.
            //         this means you could set group ID into message content, but
            //         keep the "receiver" to be the group ID;
            //         after encrypted (and signed), you could split the message
            //         with group members before sending out, or just send it directly
            //         to the group assistant to let it split messages for you!
            //    BUT,
            //         if you don't want to share the symmetric key with other members,
            //         you could split it (set group ID into message content and
            //         set contact ID to the "receiver") before encrypting, this usually
            //         for sending group command to assistant robot, which should not
            //         share the symmetric key (group msg key) with other members.

            // 1. get symmetric key
            var group = messenger.getOvertGroup(iMsg.getContent());
            var password;
            if (group) {
                // group message (excludes group command)
                password = messenger.getCipherKey(sender, group, true);
            } else {
                // personal message or (group) command
                password = messenger.getCipherKey(sender, receiver, true);
            }

            // 2. encrypt 'content' to 'data' for receiver/group members
            var sMsg;
            if (receiver.isGroup()) {
                var facebook = this.getFacebook();
                // group message
                var grp = facebook.getGroup(receiver);
                if (!grp) {
                    // group not ready
                    // TODO: suspend this message for waiting group's meta
                    return null;
                }
                var members = grp.getMembers();
                if (!members || members.length === 0) {
                    // group members not found
                    // TODO: suspend this message for waiting group's membership
                    return null;
                }
                sMsg = iMsg.encrypt(password, members);
            } else {
                // personal message (or split group message)
                sMsg = iMsg.encrypt(password, null);
            }
            if (!sMsg) {
                // public key for encryption not found
                // TODO: suspend this message for waiting receiver's meta
                return null;
            }

            // overt group ID
            if (group && !receiver.equals(group)) {
                // NOTICE: this help the receiver knows the group ID
                //         when the group message separated to multi-messages,
                //         if don't want the others know you are the group members,
                //         remove it.
                sMsg.getEnvelope().setGroup(group);
            }

            // NOTICE: copy content type to envelope
            //         this help the intermediate nodes to recognize message type
            sMsg.getEnvelope().setType(iMsg.getContent().getType());

            // OK
            return sMsg;
        },

        // Override
        signMessage: function (sMsg) {
            // check message delegate
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            // sign 'data' by sender
            return sMsg.sign();
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

        // Override
        verifyMessage: function (rMsg) {
            var facebook = this.getFacebook();
            var sender = rMsg.getSender();
            // [Meta Protocol]
            var meta = rMsg.getMeta();
            if (meta) {
                facebook.saveMeta(meta, sender)
            }
            // [Visa Protocol]
            var visa = rMsg.getVisa();
            if (visa) {
                facebook.saveDocument(visa);
            }
            // check message delegate
            if (!rMsg.getDelegate()) {
                var messenger = this.getMessenger();
                rMsg.setDelegate(messenger);
            }
            //
            //  TODO: check [Meta Protocol]
            //        make sure the sender's meta exists
            //        (do in by application)
            //

            // verify 'data' with 'signature'
            return rMsg.verify();
        },

        // Override
        decryptMessage: function (sMsg) {
            var facebook = this.getFacebook();
            var receiver = sMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            var trimmed;
            if (!user) {
                // current users not match
                trimmed = null;
            } else if (receiver.isGroup()) {
                // trim group message
                trimmed = sMsg.trim(user.getIdentifier());
            } else {
                trimmed = sMsg;
            }
            if (!trimmed) {
                // not for you?
                throw new ReferenceError("receiver error: " + sMsg.toMap());
            }
            // check message delegate
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            //
            //  NOTICE: make sure the receiver is YOU!
            //          which means the receiver's private key exists;
            //          if the receiver is a group ID, split it first
            //

            // decrypt 'data' to 'content'
            return sMsg.decrypt();

            // TODO: check top-secret message
            //       (do it by application)
        }
    });

    //-------- namespace --------
    ns.MessagePacker = MessagePacker;

    ns.registers('MessagePacker');

})(DIMP);
