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
//! require 'protocol/receipt.js'
//! require 'delegate.js'
//! require 'facebook.js'

!function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;

    var Meta = ns.Meta;

    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var SecureMessage = ns.SecureMessage;
    var ReliableMessage = ns.ReliableMessage;

    var FileContent = ns.protocol.FileContent;

    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;

    var ContentProcessor = ns.cpu.ContentProcessor;

    var ConnectionDelegate = ns.ConnectionDelegate;

    var Transceiver = ns.core.Transceiver;

    var Facebook = ns.Facebook;

    var Messenger = function () {
        Transceiver.call(this);
        // Environment variables as context
        this.context = {};
        // Content processing unit
        this.cpu = new ContentProcessor(this);
        // Messenger delegate for sending data
        this.delegate = null;
    };
    ns.type.Class(Messenger, Transceiver, ConnectionDelegate);

    //
    //  Environment variables as context
    //
    Messenger.prototype.getContext = function (key) {
        return this.context[key];
    };
    Messenger.prototype.setContext = function (key, value) {
        if (value) {
            this.context[key] = value;
        } else {
            delete this.context[key];
        }
    };

    //
    //  Data source for getting entity info
    //
    Messenger.prototype.getFacebook = function () {
        var facebook = this.getContext('facebook');
        if (!facebook && this.entityDelegate instanceof Facebook) {
            facebook = this.entityDelegate;
        }
        return facebook;
    };

    var select = function (receiver) {
        var facebook = this.getFacebook();
        var users = facebook.getLocalUsers();
        if (!users || users.length === 0) {
            throw Error('local users should not be empty');
        } else if (receiver.isBroadcast()) {
            // broadcast message can decrypt by anyone,
            // so just return current user
            return users[0];
        }
        if (receiver.getType().isGroup()) {
            // group message (recipient not designated)
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                // TODO: query group members
                //       (do it by application)
                return null;
            }
            for (var i = 0; i < users.length; ++i) {
                if (members.indexOf(users[i].identifier) >= 0) {
                    // set this item to be current user?
                    return users[i];
                }
            }
        } else {
            // 1. personal message
            // 2. split group message
            for (var j = 0; j < users.length; ++j) {
                if (receiver.equals(users[j].identifier)) {
                    // set this item to be current user?
                    return users[j];
                }
            }
        }
        return null;
    };

    var trim = function (msg) {
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        var user = select.call(this, receiver);
        if (!user) {
            // current users not match
            return null;
        } else if (receiver.getType().isGroup()) {
            // trim group message
            msg = msg.trim(user.identifier);
        }
        return msg;
    };

    // check whether group info empty
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        }
        var owner = facebook.getOwner(group);
        return !owner;
    };

    // check whether need to update group
    var check_group = function (content, sender) {
        // Check if it is a group message,
        // and whether the group members info needs update
        var facebook = this.getFacebook();
        var group = facebook.getIdentifier(content.getGroup());
        if (!group || group.isBroadcast()) {
            // 1. personal message
            // 2. broadcast message
            return false;
        }
        // check meta for new group ID
        var meta = facebook.getMeta(group);
        if (!meta) {
            // NOTICE: if meta for group not found,
            //         facebook should query it from DIM network automatically
            // TODO: insert the message to a temporary queue to wait meta
            //throw new NullPointerException("group meta not found: " + group);
            return true;
        }
        // query group info
        if (is_empty.call(this, group)) {
            // NOTICE: if the group info not found, and this is not an 'invite' command
            //         query group info from the sender
            if ((content instanceof InviteCommand) || (content instanceof ResetCommand)) {
                // FIXME: can we trust this stranger?
                //        may be we should keep this members list temporary,
                //        and send 'query' to the owner immediately.
                // TODO: check whether the members list is a full list,
                //       it should contain the group owner(owner)
                return false;
            } else {
                this.sendContent(GroupCommand.query(group), sender);
            }
        } else if (facebook.existsMember(sender, group)
            || facebook.existsAssistant(sender, group)
            || facebook.isOwner(sender, group)) {
            // normal membership
            return false;
        } else {
            var cmd = GroupCommand.query(group);
            var checking = false;
            // if assistants exists, query them
            var assistants = facebook.getAssistants(group);
            if (assistants) {
                for (var i = 0; i < assistants.length; ++i) {
                    if (this.sendContent(cmd, assistants[i])) {
                        checking = true;
                    }
                }
            }
            // if owner found, query it too
            var owner = facebook.getOwner(group);
            if (owner && this.sendContent(cmd, owner)) {
                checking = true;
            }
            return checking;
        }
    };

    //
    //  Transform
    //

    Messenger.prototype.verifyMessage = function (msg) {
        // Notice: check meta before calling me
        var facebook = this.getFacebook();
        var sender = msg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        var meta = Meta.getInstance(msg.getMeta());
        if (meta) {
            // [Meta Protocol]
            // save meta for sender
            if (!facebook.saveMeta(meta, sender)) {
                throw Error('save meta error: ' + sender + ', ' + meta)
            }
        } else {
            // check meta for sender
            meta = facebook.getMeta(sender);
            if (!meta) {
                // NOTICE: the application will query meta automatically
                // save this message in a queue waiting sender's meta response
                this.suspendMessage(msg);
                // throw Error('failed to get meta for sender: ' + sender);
                return null;
            }
        }
        return Transceiver.prototype.verifyMessage.call(this, msg);
    };

    Messenger.prototype.encryptMessage = function (msg) {
        var sMsg = Transceiver.prototype.encryptMessage.call(this, msg);
        var group = msg.content.getGroup();
        if (!group) {
            // NOTICE: this help the receiver knows the group ID
            //         when the group message separated to multi-messages,
            //         if don't want the others know you are the group members,
            //         remove it.
            sMsg.envelope.setGroup(group);
        }
        // NOTICE: copy content type to envelope
        //         this help the intermediate nodes to recognize message type
        sMsg.envelope.setType(msg.content.type);
        return sMsg;
    };

    Messenger.prototype.decryptMessage = function (msg) {
        // trim message
        var sMsg = trim.call(this, msg);
        if (!sMsg) {
            // not for you?
            throw Error('receiver error:' + msg);
        }
        // decrypt message
        return Transceiver.prototype.decryptMessage.call(this, sMsg);
    };

    //-------- De/serialize message, content and symmetric key

    Messenger.prototype.deserializeMessage = function (data) {
        if (!data) {
            return null;
        }
        return Transceiver.prototype.deserializeMessage.call(this, data);
    };

    //
    //  InstantMessageDelegate
    //

    Messenger.prototype.encryptContent = function (content, pwd, msg) {
        var key = SymmetricKey.getInstance(pwd);
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var data = content.getData();
            // encrypt and upload file data onto CDN and save the URL in message content
            data = key.encrypt(data);
            var url = this.delegate.uploadData(data, msg);
            if (url) {
                // replace 'data' with 'URL'
                content.setURL(url);
                content.setData(null);
            }
        }
        return Transceiver.prototype.encryptContent.call(this, content, pwd, msg);
    };

    Messenger.prototype.encryptKey = function (pwd, receiver, msg) {
        var facebook = this.getFacebook();
        receiver = facebook.getIdentifier(receiver);
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            var meta = facebook.getMeta(receiver);
            if (!meta) {
                // save this message in a queue waiting receiver's meta response
                this.suspendMessage(msg);
                // throw Error('failed to get encrypt key for receiver: ' + receiver);
                return null;
            }
        }
        return Transceiver.prototype.encryptKey.call(this, pwd, receiver, msg);
    };

    //
    //  SecureMessageDelegate
    //

    Messenger.prototype.decryptContent = function (data, pwd, msg) {
        var key = SymmetricKey.getInstance(pwd);
        var content = Transceiver.prototype.decryptContent.call(this, data, pwd, msg);
        if (!content) {
            throw Error('failed to decrypt message content: ' + msg);
        }
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var iMsg = InstantMessage.newMessage(content, msg.envelope);
            // download from CDN
            var fileData = this.delegate.downloadData(content.getURL(), iMsg);
            if (fileData) {
                // decrypt file data
                content.setData(key.decrypt(fileData));
                // content.setURL(null);
            } else {
                // save symmetric key for decrypted file data after download from CDN
                content.setPassword(key);
            }
        }
        return content;
    };

    //
    //  Send message
    //

    /**
     *  Send message content to receiver
     *
     * @param content
     * @param receiver
     * @param callback - OPTIONAL
     * @param split - OPTIONAL; whether split group message
     * @returns {boolean}
     */
    Messenger.prototype.sendContent = function (content, receiver, callback, split) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        var env = Envelope.newEnvelope(user.identifier, receiver);
        var msg = InstantMessage.newMessage(content, env);
        return this.sendMessage(msg, callback, split);
    };

    /**
     *  Send instant message (encrypt and sign) onto DIM network
     *
     * @param msg - instant message
     * @param callback - OPTIONAL; if needs callback, set it here
     * @param split - OPTIONAL; whether split group message
     * @returns {boolean}
     */
    Messenger.prototype.sendMessage = function (msg, callback, split) {
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        // Send message (secured + certified) to target station
        var sMsg = this.encryptMessage(msg);
        var rMsg = this.signMessage(sMsg);
        var ok = true;
        if (split && receiver.getType().isGroup()) {
            // split for each members
            var messages = null;
            var members = facebook.getMembers(receiver);
            if (members && members.length > 0) {
                messages = rMsg.split(members);
            }
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    if (send_message.call(this, messages[i], callback)) {
                        ok = false;
                    }
                }
            } else {
                // failed to split message, send it to group
                ok = send_message.call(this, rMsg, callback);
            }
        } else {
            ok = send_message.call(this, rMsg, callback);
        }
        // TODO: if OK, set iMsg.state = sending; else set iMsg.state = waiting
        /*
        if (!this.saveMessage(msg)) {
            return false;
        }
         */
        return ok;
    };

    var send_message = function (msg, callback) {
        var handler = {
            onSuccess: function () {
                callback.onFinished(msg, null);
            },
            onFailed: function (error) {
                callback.onFinished(error);
            }
        };
        var data = this.serializeMessage(msg);
        return this.delegate.sendPackage(data, handler);
    };

    //
    //  Message
    //
    /**
     *  Save the message into local storage
     *
     * @param msg
     * @returns {boolean}
     */
    Messenger.prototype.saveMessage = function (msg) {
        console.assert(msg !== null, 'message empty');
        console.assert(false, 'implement me!');
        return false;
    };
    /**
     *  Suspend the received reliable message for the sender's meta,
     *  or received instant message for group's meta,
     *  or sending instant message for receiver's meta.
     *
     * @param msg - ReliableMessage|InstantMessage
     * @returns {boolean}
     */
    Messenger.prototype.suspendMessage = function (msg) {
        console.assert(msg !== null, 'message empty');
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  ConnectionDelegate
    //

    Messenger.prototype.onReceivePackage = function (data) {
        // 1. deserialize message
        var rMsg = this.deserializeMessage(data);
        if (!rMsg) {
            // no message received
            return null;
        }
        // 2. process message
        var response = this.process(rMsg);
        if (!response) {
            // nothing to response
            return null;
        }
        // 3. pack response
        var facebook = this.getFacebook();
        var sender = facebook.getIdentifier(rMsg.envelope.sender);
        var receiver = facebook.getIdentifier(rMsg.envelope.receiver);
        var user = select.call(this, receiver);
        if (!user) {
            // not for you?
            // delivering message to other receiver?
            user = facebook.getCurrentUser();
            if (!user) {
                throw Error('current user not found!');
            }
        }
        var env = Envelope.newEnvelope(user.identifier, sender);
        var iMsg = InstantMessage.newMessage(response, env);
        var nMsg = this.signMessage(this.encryptMessage(iMsg));
        // serialize message
        return this.serializeMessage(nMsg);
    };

    Messenger.prototype.process = function (msg) {
        if (msg instanceof ReliableMessage) {
            var sMsg = this.verifyMessage(msg);
            if (!sMsg) {
                // waiting for sender's meta if not exists
                return null;
            }
            // TODO: override to check broadcast message before calling it
            // TODO: override to deliver to the receiver when catch exception "receiver error ..."
            // continue to process it
            return this.process(sMsg);
        } else if (msg instanceof SecureMessage) {
            // try to decrypt
            var iMsg = this.decryptMessage(msg);
            // continue to process it
            return this.process(iMsg);
        } else if (msg instanceof InstantMessage) {
            var content = msg.content;
            var sender = msg.envelope.sender;
            sender = this.getFacebook().getIdentifier(sender);
            if (check_group.call(this, content, sender)) {
                // save this message in a queue to wait group meta response
                this.suspendMessage(msg);
                return null;
            }
            var res = this.cpu.process(content, sender, msg);
            if (!this.saveMessage(msg)) {
                // error
                return null;
            }
            // TODO: override to filter the response
            return res;
        }
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

}(DIMP);
