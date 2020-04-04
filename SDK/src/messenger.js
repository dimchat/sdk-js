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
    var EncryptKey = ns.crypto.EncryptKey;

    var Meta = ns.Meta;

    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var ReliableMessage = ns.ReliableMessage;

    var FileContent = ns.protocol.FileContent;

    var ContentProcessor = ns.cpu.ContentProcessor;

    var CompletionHandler = ns.CompletionHandler;
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
    ns.Class(Messenger, Transceiver, [ConnectionDelegate]);

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
        if (receiver.isGroup()) {
            // group message (recipient not designated)
            for (var i = 0; i < users.length; ++i) {
                if (facebook.existsMember(users[i].identifier, receiver)) {
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
            msg = null;
        } else if (receiver.isGroup()) {
            // trim group message
            msg = msg.trim(user.identifier);
        }
        return msg;
    };

    //
    //  Transform
    //

    Messenger.prototype.verifyMessage = function (rMsg) {
        // Notice: check meta before calling me
        var facebook = this.getFacebook();
        var sender = rMsg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        var meta = Meta.getInstance(rMsg.getMeta());
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
                this.suspendMessage(rMsg);
                // throw Error('failed to get meta for sender: ' + sender);
                return null;
            }
        }
        return Transceiver.prototype.verifyMessage.call(this, rMsg);
    };

    Messenger.prototype.decryptMessage = function (sMsg) {
        // trim message
        var msg = trim.call(this, sMsg);
        if (!msg) {
            // not for you?
            throw Error('receiver error:' + sMsg);
        }
        // decrypt message
        return Transceiver.prototype.decryptMessage.call(this, msg);
    };

    //
    //  Serialization
    //

    // noinspection JSUnusedGlobalSymbols
    /**
     *  Encode reliable message to JSON string data
     *
     * @param {ReliableMessage} rMsg
     * @returns {Uint8Array}
     */
    Messenger.prototype.serializeMessage = function (rMsg) {
        var json = ns.format.JSON.encode(rMsg);
        return ns.type.String.from(json).getBytes('UTF-8');
    };

    // noinspection JSUnusedGlobalSymbols
    /**
     *  Decode reliable message from JSON string data
     *
     * @param {Uint8Array} data
     * @returns {ReliableMessage}
     */
    Messenger.prototype.deserializeMessage = function (data) {
        var str = new ns.type.String(data, 'UTF-8');
        var dict = ns.format.JSON.decode(str.toString());
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
        return ReliableMessage.getInstance(dict);
    };

    //
    //  InstantMessageDelegate
    //

    Messenger.prototype.serializeContent = function (content, pwd, iMsg) {
        var key = SymmetricKey.getInstance(pwd);
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var data = content.getData();
            // encrypt and upload file data onto CDN and save the URL in message content
            data = key.encrypt(data);
            var url = this.delegate.uploadData(data, iMsg);
            if (url) {
                // replace 'data' with 'URL'
                content.setURL(url);
                content.setData(null);
            }
        }
        return Transceiver.prototype.serializeContent.call(this, content, key, iMsg);
    };

    Messenger.prototype.encryptKey = function (data, receiver, iMsg) {
        var facebook = this.getFacebook();
        receiver = facebook.getIdentifier(receiver);
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            var meta = facebook.getMeta(receiver);
            if (!meta || !ns.Interface.conforms(meta.key, EncryptKey)) {
                // save this message in a queue waiting receiver's meta/profile response
                this.suspendMessage(iMsg);
                // throw Error('failed to get encrypt key for receiver: ' + receiver);
                return null;
            }
        }
        return Transceiver.prototype.encryptKey.call(this, data, receiver, iMsg);
    };

    //
    //  SecureMessageDelegate
    //

    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var key = SymmetricKey.getInstance(pwd);
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw Error('failed to decrypt message content: ' + sMsg);
        }
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var iMsg = InstantMessage.newMessage(content, sMsg.envelope);
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
     * @param {Content} content
     * @param {ID|String} receiver
     * @param {Callback} callback - OPTIONAL
     * @param {boolean} split - OPTIONAL; whether split group message
     * @returns {boolean}
     */
    Messenger.prototype.sendContent = function (content, receiver, callback, split) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        var env = Envelope.newEnvelope(user.identifier, receiver, 0);
        var iMsg = InstantMessage.newMessage(content, env);
        return this.sendMessage(iMsg, callback, split);
    };

    /**
     *  Send instant message (encrypt and sign) onto DIM network
     *
     * @param {InstantMessage|ReliableMessage} msg
     * @param {Callback} callback - OPTIONAL; if needs callback, set it here
     * @param {boolean} split - OPTIONAL; whether split group message
     * @returns {boolean}
     */
    Messenger.prototype.sendMessage = function (msg, callback, split) {
        if (msg instanceof InstantMessage) {
            return send_instant_message.call(this, msg, callback, split);
        } else if (msg instanceof ReliableMessage) {
            return send_reliable_message.call(this, msg, callback);
        } else {
            throw TypeError('message error: ' + msg);
        }
    };

    var send_instant_message = function (iMsg, callback, split) {
        var facebook = this.getFacebook();
        var receiver = iMsg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        // Send message (secured + certified) to target station
        var sMsg = this.encryptMessage(iMsg);
        var rMsg = this.signMessage(sMsg);
        var ok = true;
        if (split && receiver.isGroup()) {
            // split for each members
            var messages = null;
            var members = facebook.getMembers(receiver);
            if (members && members.length > 0) {
                messages = rMsg.split(members);
            }
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    if (send_reliable_message.call(this, messages[i], callback)) {
                        ok = false;
                    }
                }
            } else {
                // failed to split message, send it to group
                ok = send_reliable_message.call(this, rMsg, callback);
            }
        } else {
            ok = send_reliable_message.call(this, rMsg, callback);
        }
        // TODO: if OK, set iMsg.state = sending; else set iMsg.state = waiting

        if (!this.saveMessage(iMsg)) {
            return false;
        }
        return ok;
    };

    var send_reliable_message = function (rMsg, callback) {
        var handler = CompletionHandler.newHandler(
            function () {
                callback.onFinished(rMsg, null);
            },
            function (error) {
                callback.onFinished(error);
            }
        );
        var data = this.serializeMessage(rMsg);
        return this.delegate.sendPackage(data, handler);
    };

    //
    //  Message
    //

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save the message into local storage
     *
     * @param {InstantMessage} iMsg
     * @returns {boolean}
     */
    Messenger.prototype.saveMessage = function (iMsg) {
        console.assert(false, 'implement me!');
        return false;
    };
    // noinspection JSUnusedLocalSymbols
    /**
     *  Suspend the received reliable message for the sender's meta,
     *  or received instant message for group's meta,
     *  or sending instant message for receiver's meta.
     *
     * @param {ReliableMessage|InstantMessage} msg
     * @returns {boolean}
     */
    Messenger.prototype.suspendMessage = function (msg) {
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
        rMsg = this.processReliableMessage(rMsg);
        if (!rMsg) {
            // nothing to response
            return null;
        }
        // 3. serialize message
        return this.serializeMessage(rMsg);
    };

    // TODO: override to check broadcast message before calling it
    // TODO: override to deliver to the receiver when catch exception "receiver error ..."
    Messenger.prototype.processReliableMessage = function (rMsg) {
        // 1. verify message
        var sMsg = this.verifyMessage(rMsg);
        if (!sMsg) {
            // waiting for sender's meta if not exists
            return null;
        }
        // 2. process message
        sMsg = this.processSecureMessage(sMsg);
        if (!sMsg) {
            // nothing to respond
            return null;
        }
        // 3. sign message
        return this.signMessage(sMsg);
    };

    Messenger.prototype.processSecureMessage = function (sMsg) {
        // 1. decrypt message
        var iMsg = this.decryptMessage(sMsg);
        if (!iMsg) {
            // cannot decrypt this message, not for you?
            // delivering message to other receiver?
            return null;
        }
        // 2. process message
        iMsg = this.processInstantMessage(iMsg);
        if (!iMsg) {
            // nothing to respond
            return null;
        }
        // 3. encrypt message
        return this.encryptMessage(iMsg);
    };

    // TODO: override to check group
    // TODO: override to filter the response
    Messenger.prototype.processInstantMessage = function (iMsg) {
        var facebook = this.getFacebook();
        var content = iMsg.content;
        var env = iMsg.envelope;
        var sender = facebook.getIdentifier(env.sender);

        // process content from sender
        var res = this.cpu.process(content, sender, iMsg);
        if (!this.saveMessage(iMsg)) {
            // error
            return null;
        }
        if (!res) {
            // nothing to respond
            return null;
        }

        // check receiver
        var receiver = facebook.getIdentifier(env.receiver);
        var user = select.call(this, receiver);

        // pack message
        env = Envelope.newEnvelope(user.identifier, sender, 0);
        return InstantMessage.newMessage(res, env);
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

    ns.register('Messenger');

}(DIMP);
