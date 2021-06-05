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

    /**
     *  Message Transmitter
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var Transmitter = function () {
    };
    ns.Interface(Transmitter, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send message content to receiver
     *
     * @param {ID} sender - sender ID
     * @param {ID} receiver - receiver ID
     * @param {Content} content - message content
     * @param {Callback} callback - if needs callback, set it here
     * @param {int} priority
     * @return {boolean} true on success
     */
    Transmitter.prototype.sendContent = function (sender, receiver, content,
                                                  callback, priority) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send instant message (encrypt and sign) onto DIM network
     *
     * @param {InstantMessage} iMsg - instant message
     * @param {Callback} callback - if needs callback, set it here
     * @param {int} priority
     * @return {boolean} true on success
     */
    Transmitter.prototype.sendInstantMessage = function (iMsg, callback, priority) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Send reliable message onto DIM network
     *
     * @param {ReliableMessage} rMsg - reliable message
     * @param {Callback} callback - if needs callback, set it here
     * @param {int} priority
     * @return {boolean} true on success
     */
    Transmitter.prototype.sendReliableMessage = function (rMsg, callback, priority) {
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- namespace --------
    ns.Transmitter = Transmitter;

    ns.register('Transmitter');

})(DIMP);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;

    var CompletionHandler = ns.CompletionHandler;
    var Transmitter = ns.Transmitter;

    var MessageTransmitter = function (messenger) {
        obj.call(this);
        this.messenger = messenger;
    };
    ns.Class(MessageTransmitter, obj, [Transmitter]);

    MessageTransmitter.prototype.getMessenger = function () {
        return this.messenger;
    };

    MessageTransmitter.prototype.getFacebook = function () {
        return this.getMessenger().getFacebook();
    };

    MessageTransmitter.prototype.sendContent = function (sender, receiver, content, callback, priority) {
        // Application Layer should make sure user is already login before it send message to server.
        // Application layer should put message into queue so that it will send automatically after user login.
        if (!sender) {
            var user = this.getFacebook().getCurrentUser();
            if (!user) {
                throw new ReferenceError('current user not set');
            }
            sender = user.identifier;
        }
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, content);
        return this.getMessenger().sendInstantMessage(iMsg, callback, priority);
    };

    MessageTransmitter.prototype.sendInstantMessage = function (iMsg, callback, priority) {
        var messenger = this.getMessenger();
        // Send message (secured + certified) to target station
        var sMsg = messenger.encryptMessage(iMsg);
        if (sMsg == null) {
            // public key not found?
            return false;
            //throw new ReferenceError("failed to encrypt message: " + iMsg.getMap());
        }
        var rMsg = messenger.signMessage(sMsg);
        if (rMsg == null) {
            // TODO: set iMsg.state = error
            throw new ReferenceError("failed to sign message: " + sMsg.getMap());
        }

        var OK = messenger.sendReliableMessage(rMsg, callback, priority);
        // TODO: if OK, set iMsg.state = sending; else set iMsg.state = waiting

        return messenger.saveMessage(iMsg) && OK;
    };

    MessageTransmitter.prototype.sendReliableMessage = function (rMsg, callback, priority) {
        var handler = null;
        if (callback != null) {
            handler = new MessageCallbackHandler(rMsg, callback);
        }
        var messenger = this.getMessenger();
        var data = messenger.serializeMessage(rMsg);
        return messenger.sendPackage(data, handler, priority);
    };

    var MessageCallbackHandler = function (rMsg, callback) {
        obj.call(this);
        this.message = rMsg;
        this.callback = callback;
    };
    ns.Class(MessageCallbackHandler, obj, [CompletionHandler]);

    MessageCallbackHandler.prototype.onSuccess = function () {
        this.callback.onFinished(this.message, null);
    };

    // noinspection JSUnusedLocalSymbols
    MessageCallbackHandler.prototype.onFailed = function (error) {
        this.callback.onFinished(this.message, error);
    };

    //-------- namespace --------
    ns.MessageTransmitter = MessageTransmitter;

    ns.register('MessageTransmitter');

})(DIMP);
