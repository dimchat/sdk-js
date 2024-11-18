;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

    var Class = ns.type.Class;

    var Envelope         = ns.protocol.Envelope;
    var InstantMessage   = ns.protocol.InstantMessage;
    var SecureMessage    = ns.protocol.SecureMessage;
    var ReliableMessage  = ns.protocol.ReliableMessage;

    var MessageEnvelope  = ns.msg.MessageEnvelope;
    var PlainMessage     = ns.msg.PlainMessage;
    var EncryptedMessage = ns.msg.EncryptedMessage;
    var NetworkMessage   = ns.msg.NetworkMessage;

    var random_int = function (max) {
        return Math.floor(Math.random() * max);
    };

    var MessageFactory = function () {
        Object.call(this);
        this.__sn = random_int(0x7fffffff);
    };
    Class(MessageFactory, Object, [
        Envelope.Factory, InstantMessage.Factory, SecureMessage.Factory, ReliableMessage.Factory
    ], null);

    // private
    MessageFactory.prototype.next = function () {
        var sn = this.__sn;
        if (sn < 0x7fffffff) {
            sn += 1;
        } else {
            sn = 1;
        }
        this.__sn = sn;
        return sn;
    };

    /**
     *  Envelope Factory
     *  ~~~~~~~~~~~~~~~~
     */

    // Override
    MessageFactory.prototype.createEnvelope = function (from, to, when) {
        return new MessageEnvelope(from, to, when);
    };

    // Override
    MessageFactory.prototype.parseEnvelope = function (env) {
        // check 'sender'
        if (!env['sender']) {
            // env.sender should not empty
            return null;
        }
        return new MessageEnvelope(env);
    };

    /**
     *  InstantMessage Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~
     */

    // Override
    MessageFactory.prototype.generateSerialNumber = function (msgType, now) {
        // because we must make sure all messages in a same chat box won't have
        // same serial numbers, so we can't use time-related numbers, therefore
        // the best choice is a totally random number, maybe.
        return this.next();
    };

    // Override
    MessageFactory.prototype.createInstantMessage = function (head, body) {
        return new PlainMessage(head, body);
    };

    // Override
    MessageFactory.prototype.parseInstantMessage = function (msg) {
        // check 'sender', 'content'
        if (!msg["sender"] || !msg["content"]) {
            // msg.sender should not be empty
            // msg.content should not be empty
            return null;
        }
        return new PlainMessage(msg);
    };

    /**
     *  SecureMessage Factory
     *  ~~~~~~~~~~~~~~~~~~~~~
     */

    // Override
    MessageFactory.prototype.parseSecureMessage = function (msg) {
        // check 'sender', 'data'
        if (!msg["sender"] || !msg["data"]) {
            // msg.sender should not be empty
            // msg.data should not be empty
            return null;
        }
        // check 'signature'
        if (msg['signature']) {
            return new NetworkMessage(msg);
        }
        return new EncryptedMessage(msg);
    };

    /**
     *  ReliableMessage Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */

    // Override
    MessageFactory.prototype.parseReliableMessage = function (msg) {
        // check 'sender', 'data', 'signature'
        if (!msg['sender'] || !msg['data'] || !msg['signature']) {
            // msg.sender should not empty
            // msg.data should not empty
            // msg.signature should not empty
            return null;
        }
        return new NetworkMessage(msg);
    };

    //-------- namespace --------
    ns.msg.MessageFactory = MessageFactory;

})(DIMP);
