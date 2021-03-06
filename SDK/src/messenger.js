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
//! require 'cpu/content.js'
//! require 'delegate.js'
//! require 'facebook.js'

(function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;

    var Transceiver = ns.core.Transceiver;

    var Messenger = function () {
        Transceiver.call(this);
        this.__delegate = null;
        this.__datasource = null;
        this.__transmitter = null;
    };
    ns.Class(Messenger, Transceiver, null);

    Messenger.prototype.getFacebook = function () {
        return this.getEntityDelegate();
    }

    Messenger.prototype.setDelegate = function (delegate) {
        this.__delegate = delegate;
    };
    Messenger.prototype.getDelegate = function () {
        return this.__delegate;
    };

    Messenger.prototype.setDataSource = function (datasource) {
        this.__datasource = datasource;
    };
    Messenger.prototype.getDataSource = function () {
        return this.__datasource;
    };

    Messenger.prototype.setTransmitter = function (transmitter) {
        this.__transmitter = transmitter;
    };
    Messenger.prototype.getTransmitter = function () {
        return this.__transmitter;
    };

    var get_fpu = function (messenger) {
        var cpu = ns.cpu.ContentProcessor.getProcessor(ContentType.FILE);
        cpu.setMessenger(messenger);
        return cpu;
    }

    //
    //  InstantMessageDelegate
    //

    Messenger.prototype.serializeContent = function (content, pwd, iMsg) {
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.uploadFileContent(content, pwd, iMsg);
        }
        return Transceiver.prototype.serializeContent.call(this, content, pwd, iMsg);
    };

    Messenger.prototype.encryptKey = function (data, receiver, iMsg) {
        var key = this.getFacebook().getPublicKeyForEncryption(receiver);
        if (key == null) {
            // save this message in a queue waiting receiver's meta/document response
            this.suspendInstantMessage(iMsg);
            //throw new NullPointerException("failed to get encrypt key for receiver: " + receiver);
            return null;
        }
        return Transceiver.prototype.encryptKey.call(this, data, receiver, iMsg);
    };

    //
    //  SecureMessageDelegate
    //

    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw new Error('failed to deserialize message content: ' + sMsg);
        }
        // check attachment for File/Image/Audio/Video message content
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.downloadFileContent(content, pwd, sMsg);
        }
        return content;
    };


    //
    //  Interfaces for transmitting Message
    //

    Messenger.prototype.sendContent = function (sender, receiver, content, callback, priority) {
        return this.getTransmitter().sendContent(sender, receiver, content, callback, priority);
    };

    Messenger.prototype.sendInstantMessage = function (iMsg, callback, priority) {
        return this.getTransmitter().sendInstantMessage(iMsg, callback, priority);
    };
    Messenger.prototype.sendReliableMessage = function (rMsg, callback, priority) {
        return this.getTransmitter().sendReliableMessage(rMsg, callback, priority);
    };

    //
    //  Interfaces for Station
    //

    Messenger.prototype.uploadData = function (data, iMsg) {
        return this.getDelegate().uploadData(data, iMsg);
    };

    Messenger.prototype.downloadData = function (url, iMsg) {
        return this.getDelegate().downloadData(url, iMsg);
    };

    Messenger.prototype.sendPackage = function (data, handler, priority) {
        return this.getDelegate().sendPackage(data, handler, priority);
    };

    //
    //  Interfaces for Message Storage
    //

    Messenger.prototype.saveMessage = function (iMsg) {
        return this.getDataSource().saveMessage(iMsg);
    };

    Messenger.prototype.suspendReliableMessage = function (rMsg) {
        return this.getDataSource().suspendReliableMessage(rMsg);
    };

    Messenger.prototype.suspendInstantMessage = function (iMsg) {
        return this.getDataSource().suspendInstantMessage(iMsg);
    };

    //-------- namespace --------
    ns.Messenger = Messenger;

    ns.registers('Messenger');

})(DIMSDK);
