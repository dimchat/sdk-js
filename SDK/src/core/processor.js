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
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Processor = ns.Processor;
    var TwinsHelper = ns.TwinsHelper;

    var MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory();
    };
    Class(MessageProcessor, TwinsHelper, [Processor], {

        // protected
        createFactory: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var creator = this.createCreator();
            return new ns.cpu.ContentProcessorFactory(facebook, messenger, creator);
        },

        // protected
        createCreator: function () {
            // override for creating customized CPUs
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ContentProcessorCreator(facebook, messenger);
        },

        //-------- Processor

        // Override
        processPackage: function (data) {
            var messenger = this.getMessenger();
            // 1. deserialize message
            var rMsg = messenger.deserializeMessage(data);
            if (!rMsg) {
                // no valid message received
                return null;
            }
            // 2. process message
            var responses = messenger.processReliableMessage(rMsg);
            if (!responses) {
                // nothing to respond
                return null;
            }
            // 3. serialize messages
            var packages = [];
            var pack;
            for (var i = 0; i < responses.length; ++i) {
                pack = messenger.serializeMessage(responses[i]);
                if (!pack) {
                    // should not happen
                    continue;
                }
                packages.push(pack);
            }
            return packages;
        },

        // Override
        processReliableMessage: function (rMsg) {
            var messenger = this.getMessenger();
            // TODO: override to check broadcast message before calling it
            // 1. verify message
            var sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                // waiting for sender's meta if not exists
                return null;
            }
            // 2. process message
            var responses = messenger.processSecureMessage(sMsg, rMsg);
            if (!responses) {
                // nothing to respond
                return null;
            }
            // 3. sign messages
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.signMessage(responses[i]);
                if (!msg) {
                    // should not happen
                    continue;
                }
                messages.push(msg);
            }
            return messages;
            // TODO: override to deliver to the receiver when catch exception "receiver error ..."
        },

        // Override
        processSecureMessage: function (sMsg, rMsg) {
            var messenger = this.getMessenger();
            // 1. decrypt message
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                // cannot decrypt this message, not for you?
                // delivering message to other receiver?
                return null;
            }
            // 2. process message
            var responses = messenger.processInstantMessage(iMsg, rMsg);
            if (!responses) {
                // nothing to respond
                return null;
            }
            // 3. encrypt message
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.encryptMessage(responses[i]);
                if (!msg) {
                    // should not happen
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },

        // Override
        processInstantMessage: function (iMsg, rMsg) {
            var messenger = this.getMessenger();
            // 1. process content
            var responses = messenger.processContent(iMsg.getContent(), rMsg);
            if (!responses) {
                // nothing to respond
                return null;
            }

            // 2. select a local user to build message
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            var uid = user.getIdentifier();

            // 3. pack messages
            var messages = [];
            var res, env, msg;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    // should not happen
                    continue;
                }
                env = Envelope.create(uid, sender, null);
                msg = InstantMessage.create(env, res);
                if (!msg) {
                    // should not happen
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },

        // Override
        processContent: function (content, rMsg) {
            // TODO: override to check group
            var cpu = this.getProcessor(content);
            if (!cpu) {
                // default content processor
                cpu = this.getContentProcessor(0);
            }
            return cpu.process(content, rMsg);
            // TODO: override to filter the response(s)
        }
    });

    MessageProcessor.prototype.getProcessor = function (content) {
        return this.__factory.getProcessor(content);
    };

    MessageProcessor.prototype.getContentProcessor = function (type) {
        return this.__factory.getContentProcessor(type);
    };

    MessageProcessor.prototype.getCommandProcessor = function (type, command) {
        return this.__factory.getCommandProcessor(type, command);
    };

    //-------- namespace --------
    ns.MessageProcessor = MessageProcessor;

})(DIMP);
