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

/**
 *  Command message: {
 *      type : 0x88,
 *      sn   : 123,  // the same serial number with the original message
 *
 *      command   : "receipt",
 *      message   : "...",
 *      // -- extra info
 *      sender    : "...",
 *      receiver  : "...",
 *      time      : 0,
 *      signature : "..." // the same signature with the original message
 *  }
 */

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;

    /**
     *  Create receipt command
     *
     *  Usages:
     *      1. new ReceiptCommand(map);
     *      2. new ReceiptCommand(text);
     *      3. new ReceiptCommand(text, sn, envelope);
     */
    var ReceiptCommand = function () {
        if (arguments.length === 3) {
            // new ReceiptCommand(text, sn, envelope);
            Command.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1]);
            }
            this.setEnvelope(arguments[2]);
        } else if (typeof arguments[0] === 'string') {
            // new ReceiptCommand(text);
            Command.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            this.envelope = null;
        } else {
            // new ReceiptCommand(map);
            Command.call(this, arguments[0]);
            this.envelope = null;
        }
    };
    ns.Class(ReceiptCommand, Command, null);

    //-------- setter/getter --------

    ReceiptCommand.prototype.setSerialNumber = function (sn) {
        this.setValue('sn', sn);
        this.sn = sn;
    };

    ReceiptCommand.prototype.getMessage = function () {
        return this.getValue('message');
    };
    ReceiptCommand.prototype.setMessage = function (message) {
        this.setValue('message', message);
    };

    ReceiptCommand.prototype.getEnvelope = function () {
        if (!this.envelope) {
            var env = this.getValue('envelope');
            if (!env) {
                var sender = this.getValue('sender');
                var receiver = this.getValue('receiver');
                if (sender && receiver) {
                    env = this.getMap();
                }
            }
            this.envelope = Envelope.parse(env);
        }
        return this.envelope;
    };
    ReceiptCommand.prototype.setEnvelope = function (env) {
        this.setValue('envelope', null);
        if (env) {
            this.setValue('sender', env.getValue('sender'));
            this.setValue('receiver', env.getValue('receiver'));
            var time = env.getValue('time');
            if (time) {
                this.setValue('time', time);
            }
            var group = env.getValue('group');
            if (group) {
                this.setValue('group', group);
            }
        }
        this.envelope = env;
    };

    ReceiptCommand.prototype.getSignature = function () {
        var signature = this.getValue('signature');
        if (typeof signature === 'string') {
            signature = ns.format.Base64.decode(signature);
        }
        return signature;
    };
    ReceiptCommand.prototype.setSignature = function (signature) {
        if (signature instanceof Uint8Array) {
            signature = ns.format.Base64.encode(signature);
        }
        if (typeof signature === 'string') {
            this.setValue('signature', signature);
        }
    };

    //-------- namespace --------
    ns.protocol.ReceiptCommand = ReceiptCommand;

    ns.protocol.register('ReceiptCommand');

}(DIMP);
