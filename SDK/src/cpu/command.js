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

(function (ns) {
    'use strict';

    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;

    var ContentProcessor = ns.cpu.ContentProcessor;

    /**
     *  Command Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var CommandProcessor = function () {
        ContentProcessor.call(this);
    };
    ns.Class(CommandProcessor, ContentProcessor, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Execute command
     *
     * @param {Command} cmd          - command received
     * @param {ReliableMessage} rMsg - reliable message
     * @returns {Content} response to sender
     */
    CommandProcessor.prototype.execute = function (cmd, rMsg) {
        var text = 'Command (name: ' + cmd.getCommand() + ') not support yet!';
        var res = new TextContent(text)
        // check group
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group);
        }
        return res;
    };

    // @Override
    CommandProcessor.prototype.process = function (cmd, rMsg) {
        // get CPU by command name
        var cpu = CommandProcessor.getProcessor(cmd);
        if (!cpu) {
            // check for group command
            if (cmd instanceof GroupCommand) {
                cpu = CommandProcessor.getProcessor('group');
            }
        }
        if (cpu) {
            cpu.setMessenger(this.getMessenger());
        } else {
            cpu = this;
        }
        return cpu.execute(cmd, rMsg);
    };

    //
    //  CPU factory
    //
    var commandProcessors = {};  // String -> CommandProcessor

    /**
     *  Get command processor with name
     *
     * @param {Command|String} command - name
     * @returns {CommandProcessor}
     */
    CommandProcessor.getProcessor = function (command) {
        if (command instanceof Command) {
            return commandProcessors[command.getCommand()];
        } else {
            return commandProcessors[command];
        }
    };

    /**
     *  Register command processor with name
     *
     * @param {String} command - name
     * @param {CommandProcessor} cpu
     */
    CommandProcessor.register = function (command, cpu) {
        commandProcessors[command] = cpu;
    };

    //-------- namespace --------
    ns.cpu.CommandProcessor = CommandProcessor;

    ns.cpu.registers('CommandProcessor');

})(DIMSDK);
