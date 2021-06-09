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

(function (ns) {
    'use strict';

    var Processor = ns.core.Processor;

    var MessageProcessor = function (messenger) {
        Processor.call(this, messenger);
    };
    ns.Class(MessageProcessor, Processor, null);

    MessageProcessor.prototype.getMessenger = function () {
        return this.getTransceiver();
    };

    // TODO: override to check broadcast message before calling it
    // TODO: override to deliver to the receiver when catch exception "receiver error ..."
    MessageProcessor.prototype.processInstantMessage = function (iMsg, rMsg) {
        var res = Processor.prototype.processInstantMessage.call(this, iMsg, rMsg);
        if (this.getMessenger().saveMessage(iMsg)) {
            return res;
        } else {
            // error
            return null;
        }
    };

    MessageProcessor.prototype.processContent = function (content, rMsg) {
        // TODO: override to check group
        var cpu = ns.cpu.ContentProcessor.getProcessor(content);
        if (cpu == null) {
            cpu = ns.cpu.ContentProcessor.getProcessor(0);  // unknown
        }
        cpu.setMessenger(this.getMessenger());
        return cpu.process(content, rMsg);
        // TODO: override to filter the response
    };

    //-------- namespace --------
    ns.MessageProcessor = MessageProcessor;

    ns.registers('MessageProcessor');

})(DIMSDK);
