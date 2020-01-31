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
 *      command  : "receipt",
 *      message  : "...",
 *      // -- extra info
 *      sender   : "...",
 *      receiver : "...",
 *      time     : 0
 *  }
 */

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Envelope = ns.Envelope;
    var Command = ns.protocol.Command;

    /**
     *  Create receipt command
     *
     * @param info - command info; or serial number; or message; or envelope
     * @constructor
     */
    var ReceiptCommand = function (info) {
        var sn = null;
        var message = null;
        var envelope = null;
        if (!info) {
            // create empty receipt command
            info = Command.RECEIPT;
        } else if (typeof info === 'number') {
            // create new receipt with serial number
            sn = info;
            info = Command.RECEIPT;
        } else if (typeof info === 'string') {
            // create new receipt with message
            message = info;
            info = Command.RECEIPT;
        } else if (info instanceof Envelope) {
            envelope = info;
            info = Command.RECEIPT;
        }
        // create receipt command
        Command.call(this, info);
        if (sn) {
            this.setSerialNumber(sn);
        }
        if (message) {
            this.setMessage(message);
        }
        if (envelope) {
            this.setEnvelope(envelope);
        } else {
            this.envelope = null;
        }
    };
    ReceiptCommand.inherits(Command);

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
                    env = this.getMap(false);
                }
            }
            this.envelope = Envelope.getInstance(env);
        }
        return this.envelope;
    };
    ReceiptCommand.prototype.setEnvelope = function (env) {
        this.setValue('envelope', null);
        if (env) {
            this.setValue('sender', env.sender);
            this.setValue('receiver', env.receiver);
            this.setValue('time', env.time);
            this.setValue('group', env.getGroup());
        }
        this.envelope = env;
    };

    //-------- register --------
    Command.register(Command.RECEIPT, ReceiptCommand);

    //-------- namespace --------
    ns.protocol.ReceiptCommand = ReceiptCommand;

}(DIMP);
