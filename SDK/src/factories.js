;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//!require 'protocol/receipt.js'
//!require 'protocol/handshake.js'
//!require 'protocol/login.js'
//!require 'protocol/block.js'
//!require 'protocol/mute.js'
//!require 'protocol/storage.js'

(function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var LoginCommand = ns.protocol.LoginCommand;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;
    var StorageCommand = ns.protocol.StorageCommand;

    var CommandFactory = ns.core.CommandFactory;

    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;

    /**
     *  Register all command factories
     */
    var registerCommandFactories = function () {

        // Receipt Command
        Command.register(Command.RECEIPT, new CommandFactory(ReceiptCommand));
        // Handshake Command
        Command.register(Command.HANDSHAKE, new CommandFactory(HandshakeCommand));
        // Login Command
        Command.register(Command.LOGIN, new CommandFactory(LoginCommand));

        // Mute Command
        Command.register(MuteCommand.MUTE, new CommandFactory(MuteCommand));
        // Block Command
        Command.register(BlockCommand.BLOCK, new CommandFactory(BlockCommand));

        // Storage Command
        var spu = new CommandFactory(StorageCommand);
        Command.register(StorageCommand.STORAGE, spu);
        Command.register(StorageCommand.CONTACTS, spu);
        Command.register(StorageCommand.PRIVATE_KEY, spu);
    };

    /**
     *  Register all command processors
     */
    var registerCommandProcessors = function () {
        // Meta
        CommandProcessor.register(Command.META, new ns.cpu.MetaCommandProcessor());
        // Document
        var dpu = new ns.cpu.DocumentCommandProcessor();
        CommandProcessor.register(Command.DOCUMENT, dpu);
        CommandProcessor.register('profile', dpu);
        CommandProcessor.register('visa', dpu);
        CommandProcessor.register('bulletin', dpu);
        // group commands
        CommandProcessor.register('group', new ns.cpu.GroupCommandProcessor());
        CommandProcessor.register(GroupCommand.INVITE, new ns.cpu.group.InviteCommandProcessor());
        CommandProcessor.register(GroupCommand.EXPEL, new ns.cpu.group.ExpelCommandProcessor());
        CommandProcessor.register(GroupCommand.QUIT, new ns.cpu.group.QuitCommandProcessor());
        CommandProcessor.register(GroupCommand.QUERY, new ns.cpu.group.QueryCommandProcessor());
        CommandProcessor.register(GroupCommand.RESET, new ns.cpu.group.ResetCommandProcessor());
    };

    /**
     *  Register all content processors
     */
    var registerContentProcessors = function () {
        // Forward
        ContentProcessor.register(ContentType.FORWARD, new ns.cpu.ForwardContentProcessor());
        // files
        var fpu = new ns.cpu.FileContentProcessor();
        ContentProcessor.register(ContentType.FILE, fpu);
        ContentProcessor.register(ContentType.IMAGE, fpu);
        ContentProcessor.register(ContentType.AUDIO, fpu);
        ContentProcessor.register(ContentType.VIDEO, fpu);
        // commands
        ContentProcessor.register(ContentType.COMMAND, new ns.cpu.CommandProcessor());
        ContentProcessor.register(ContentType.HISTORY, new ns.cpu.HistoryCommandProcessor());
        // default
        ContentProcessor.register(0, new ns.cpu.ContentProcessor());
    };

    var registerAllFactories = function () {
        // register core content/command factories
        ns.core.registerAllFactories();
        // register extended command factories
        registerCommandFactories();
        // register command processors
        registerCommandProcessors();
        // register content processors
        registerContentProcessors();
    };

    registerAllFactories();

})(DIMP);
