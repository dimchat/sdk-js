;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2022 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require 'helper.js'
//! require 'content.js'

(function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;

    /**
     *  CPU Creator
     *  ~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator]);

    // Override
    ContentProcessorCreator.prototype.createContentProcessor = function (type) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        // forward content
        if (ContentType.FORWARD.equals(type)) {
            return new ns.cpu.ForwardContentProcessor(facebook, messenger);
        }
        // default commands
        if (ContentType.COMMAND.equals(type)) {
            return new ns.cpu.BaseCommandProcessor(facebook, messenger);
        } else if (ContentType.HISTORY.equals(type)) {
            return new ns.cpu.HistoryCommandProcessor(facebook, messenger);
        }
        if (0 === type) {
            return new ns.cpu.BaseContentProcessor(facebook, messenger);
        }
        // unknown
        return null;
    };

    // Override
    ContentProcessorCreator.prototype.createCommandProcessor = function (type, command) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        // meta command
        if (command === Command.META) {
            return new ns.cpu.MetaCommandProcessor(facebook, messenger);
        } else if (command === Command.DOCUMENT) {
            return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
        }
        // group commands
        if (command === 'group') {
            return new ns.cpu.GroupCommandProcessor(facebook, messenger);
        } else if (command === GroupCommand.INVITE) {
            return new ns.cpu.InviteCommandProcessor(facebook, messenger);
        } else if (command === GroupCommand.EXPEL) {
            return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
        } else if (command === GroupCommand.QUIT) {
            return new ns.cpu.QuitCommandProcessor(facebook, messenger);
        } else if (command === GroupCommand.QUERY) {
            return new ns.cpu.QueryCommandProcessor(facebook, messenger);
        } else if (command === GroupCommand.RESET) {
            return new ns.cpu.ResetCommandProcessor(facebook, messenger);
        }
        // unknown
        return null;
    };

    //-------- namespace --------
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;

    ns.cpu.registers('ContentProcessorCreator')

})(DIMSDK);

(function (ns) {
    'use strict';

    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;

    /**
     *  CPU Factory
     *  ~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     * @param {Creator} creator
     */
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {}  // uint => ContentProcessor
        this.__command_processors = {}  // string => ContentProcessor
    };
    ns.Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory]);

    // Override
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (ns.Interface.conforms(content, Command)) {
            var name = content.getCommand();
            // command processor
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else if (ns.Interface.conforms(content, GroupCommand)) {
                // group command processor
                cpu = this.getCommandProcessor(type, 'group');
                if (cpu) {
                    return cpu;
                }
            }
        }
        // content processor
        cpu = this.getContentProcessor(type);
        if (!cpu) {
            // default content processor
            cpu = this.getContentProcessor(0);
        }
        return cpu;
    };

    // Override
    ContentProcessorFactory.prototype.getContentProcessor = function (type) {
        // if (typeof type !== 'number') {
        //     type = type.valueOf();
        // }
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu;
            }
        }
        return cpu;
    };

    // Override
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, command) {
        // if (typeof type !== 'number') {
        //     type = type.valueOf();
        // }
        var cpu = this.__command_processors[command];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, command);
            if (cpu) {
                this.__command_processors[command] = cpu;
            }
        }
        return cpu;
    };

    //-------- namespace --------
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;

    ns.cpu.registers('ContentProcessorFactory')

})(DIMSDK);
