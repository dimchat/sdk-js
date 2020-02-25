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
//! require 'command.js'

!function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;

    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;

    /**
     *  History Command Processor
     */
    var HistoryCommandProcessor = function (messenger) {
        CommandProcessor.call(this, messenger);
        // Group Command Processor
        this.gpu = null;
    };
    ns.Class(HistoryCommandProcessor, CommandProcessor);

    //
    //  Main
    //
    HistoryCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var cpu;
        if (cmd.getGroup()) {
            // call Group Command Processor
            if (!this.gpu) {
                this.gpu = new ns.cpu.GroupCommandProcessor(this.messenger);
            }
            cpu = this.gpu;
        } else {
            // process command content by name
            var name = cmd.getCommand();
            cpu = this.getCPU(name);
            // if (!cpu) {
            //     return new TextContent('History command (' + name + ') not support yet!')
            // }
        }
        return cpu.process(cmd, sender, msg);
    };

    //-------- Runtime --------
    HistoryCommandProcessor.register = function (command, clazz) {
        CommandProcessor.register.call(this, command, clazz);
    };

    //-------- register --------
    ContentProcessor.register(ContentType.HISTORY, HistoryCommandProcessor);

    //-------- namespace --------
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;

}(DIMP);
