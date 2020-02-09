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
//! require 'content.js'

!function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;

    var ContentProcessor = ns.cpu.ContentProcessor;

    /**
     *  Default Command Processor
     */
    var CommandProcessor = function (messenger) {
        ContentProcessor.call(this, messenger);
        // CPU pool (String -> CommandProcessor)
        this.commandProcessors = {};
    };
    ns.type.Class(CommandProcessor, ContentProcessor);

    //
    //  Main
    //
    CommandProcessor.prototype.process = function (cmd, sender, msg) {
        // process command content by name
        var cpu = this.getCPU(cmd.getCommand());
        // if (!cpu) {
        //     throw TypeError('failed to get CPU for command: ' + cmd);
        // } else if (cpu === this) {
        //     throw Error('Dead cycle!');
        // }
        return cpu.process(cmd, sender, msg);
    };

    //-------- Runtime --------

    CommandProcessor.prototype.getCPU = function (command) {
        // 1. get from pool
        var cpu = this.commandProcessors[command];
        if (cpu) {
            return cpu;
        }
        // 2. get CPU class by command name
        var clazz = cpu_classes[command];
        if (!clazz) {
            // default CPU
            clazz = cpu_classes[CommandProcessor.UNKNOWN];
            // if (!clazz) {
            //     throw TypeError('failed to get CPU for command: ' + command);
            // }
        }
        // 3. create CPU with messenger
        cpu = new clazz(this.messenger);
        this.commandProcessors[command] = cpu;
        return cpu;
    };

    var cpu_classes = {}; // String -> Class

    CommandProcessor.register = function (command, clazz) {
        if (clazz) {
            cpu_classes[command] = clazz;
        } else {
            delete cpu_classes[command];
        }
    };

    CommandProcessor.UNKNOWN = 'unknown';

    //-------- register --------
    ContentProcessor.register(ContentType.COMMAND, CommandProcessor);

    //-------- namespace --------
    ns.cpu.CommandProcessor = CommandProcessor;

}(DIMP);
