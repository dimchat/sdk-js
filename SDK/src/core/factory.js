;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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

//!require <dimp.js>

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var BaseCommand        = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand   = ns.dkd.cmd.BaseGroupCommand;

    /**
     *  Content Factory
     *  ~~~~~~~~~~~~~~~
     */
    var ContentParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentParser, Object, [Content.Factory], null);

    // Override
    ContentParser.prototype.parseContent = function (content) {
        return new this.__class(content);
    };

    /**
     *  Command Factory
     *  ~~~~~~~~~~~~~~~
     */
    var CommandParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandParser, Object, [Command.Factory], null);

    // Override
    CommandParser.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };

    /**
     *  General Command Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    Class(GeneralCommandFactory, Object, [Content.Factory, Command.Factory], null);

    var general_factory = function () {
        var man = ns.dkd.cmd.CommandFactoryManager;
        return man.generalFactory;
    };

    // Override
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content, '*');
        // get factory by command name
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            // check for group command
            if (content['group']) {
                factory = gf.getCommandFactory('group');
            }
            if (!factory) {
                factory = this;
            }
        }
        return factory.parseCommand(content);
    };

    // Override
    GeneralCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseCommand(cmd);
    };

    /**
     *  History Command Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var HistoryCommandFactory = function () {
        GeneralCommandFactory.call(this);
    };
    Class(HistoryCommandFactory, GeneralCommandFactory, null, null);

    // Override
    HistoryCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseHistoryCommand(cmd);
    };

    /**
     *  Group Command Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var GroupCommandFactory = function () {
        HistoryCommandFactory.call(this);
    };
    Class(GroupCommandFactory, HistoryCommandFactory, null, null);

    // Override
    GroupCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content, '*');
        // get factory by command name
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };

    // Override
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseGroupCommand(cmd);
    };

    //-------- namespace --------
    ns.ContentParser = ContentParser;
    ns.CommandParser = CommandParser;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;

})(DIMP);

(function (ns) {
    'use strict';

    var Envelope        = ns.protocol.Envelope;
    var InstantMessage  = ns.protocol.InstantMessage;
    var SecureMessage   = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;

    var ContentType  = ns.protocol.ContentType;
    var Content      = ns.protocol.Content;
    var Command      = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;

    var MessageFactory = ns.msg.MessageFactory;

    var ContentParser = ns.ContentParser;
    var CommandParser = ns.CommandParser;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory   = ns.GroupCommandFactory;

    var registerMessageFactories = function () {
        var factory = new MessageFactory();
        // Envelope factory
        Envelope.setFactory(factory);
        // Message factories
        InstantMessage.setFactory(factory);
        SecureMessage.setFactory(factory);
        ReliableMessage.setFactory(factory);
    };

    /**
     *  Register core content factories
     */
    var registerContentFactories = function () {

        // Text
        Content.setFactory(ContentType.TEXT, new ContentParser(ns.dkd.BaseTextContent));

        // File
        Content.setFactory(ContentType.FILE, new ContentParser(ns.dkd.BaseFileContent));
        // Image
        Content.setFactory(ContentType.IMAGE, new ContentParser(ns.dkd.ImageFileContent));
        // Audio
        Content.setFactory(ContentType.AUDIO, new ContentParser(ns.dkd.AudioFileContent));
        // Video
        Content.setFactory(ContentType.VIDEO, new ContentParser(ns.dkd.VideoFileContent));

        // Web Page
        Content.setFactory(ContentType.PAGE, new ContentParser(ns.dkd.WebPageContent));

        // Name Card
        Content.setFactory(ContentType.NAME_CARD, new ContentParser(ns.dkd.NameCardContent));

        // Money
        Content.setFactory(ContentType.MONEY, new ContentParser(ns.dkd.BaseMoneyContent));
        Content.setFactory(ContentType.TRANSFER, new ContentParser(ns.dkd.TransferMoneyContent));
        // ...

        // Command
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());

        // History Command
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());

        /*/
        // Application Customized
        Content.setFactory(ContentType.CUSTOMIZED, new ContentParser(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentParser(ns.dkd.AppCustomizedContent));
        /*/

        // Content Array
        Content.setFactory(ContentType.ARRAY, new ContentParser(ns.dkd.ListContent));

        // Top-Secret
        Content.setFactory(ContentType.FORWARD, new ContentParser(ns.dkd.SecretContent));

        // unknown content type
        Content.setFactory(0, new ContentParser(ns.dkd.BaseContent));
    };

    /**
     *  Register core command factories
     */
    var registerCommandFactories = function () {

        // Meta Command
        Command.setFactory(Command.META, new CommandParser(ns.dkd.cmd.BaseMetaCommand));

        // Document Command
        Command.setFactory(Command.DOCUMENT, new CommandParser(ns.dkd.cmd.BaseDocumentCommand));

        // Receipt Command
        Command.setFactory(Command.RECEIPT, new CommandParser(ns.dkd.cmd.BaseReceiptCommand));

        // Group Commands
        Command.setFactory('group', new GroupCommandFactory());
        Command.setFactory(GroupCommand.INVITE, new CommandParser(ns.dkd.cmd.InviteGroupCommand));
        // 'expel' is deprecated (use 'reset' instead)
        Command.setFactory(GroupCommand.EXPEL, new CommandParser(ns.dkd.cmd.ExpelGroupCommand));
        Command.setFactory(GroupCommand.JOIN, new CommandParser(ns.dkd.cmd.JoinGroupCommand));
        Command.setFactory(GroupCommand.QUIT, new CommandParser(ns.dkd.cmd.QuitGroupCommand));
        Command.setFactory(GroupCommand.QUERY, new CommandParser(ns.dkd.cmd.QueryGroupCommand));
        Command.setFactory(GroupCommand.RESET, new CommandParser(ns.dkd.cmd.ResetGroupCommand));
        // Group Admin Commands
        Command.setFactory(GroupCommand.HIRE, new CommandParser(ns.dkd.cmd.HireGroupCommand));
        Command.setFactory(GroupCommand.FIRE, new CommandParser(ns.dkd.cmd.FireGroupCommand));
        Command.setFactory(GroupCommand.RESIGN, new CommandParser(ns.dkd.cmd.ResignGroupCommand));
    };

    /**
     *  Register All Message/Content/Command Factories
     */
    var registerAllFactories = function () {
        //
        //  Register core factories
        //
        registerMessageFactories();
        registerContentFactories();
        registerCommandFactories();

        //
        //  Register customized factories
        //
        Content.setFactory(ContentType.CUSTOMIZED, new ContentParser(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentParser(ns.dkd.AppCustomizedContent));
    };

    //-------- namespace --------
    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;

    ns.registerAllFactories = registerAllFactories;

})(DIMP);
