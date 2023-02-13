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
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;

    /**
     *  Content Factory
     *  ~~~~~~~~~~~~~~~
     */
    var ContentFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentFactory, Object, [Content.Factory], null);

    // Override
    ContentFactory.prototype.parseContent = function (content) {
        return new this.__class(content);
    };

    /**
     *  Command Factory
     *  ~~~~~~~~~~~~~~~
     */
    var CommandFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandFactory, Object, [Command.Factory], null);

    // Override
    CommandFactory.prototype.parseCommand = function (content) {
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
        var man = ns.dkd.cmd.FactoryManager;
        return man.generalFactory;
    };

    // Override
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content);
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
        var cmd = gf.getCmd(content);
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
    ns.ContentFactory = ContentFactory;
    ns.CommandFactory = CommandFactory;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;

})(DIMP);

(function (ns) {
    'use strict';

    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;

    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;

    var EnvelopeFactory = ns.dkd.EnvelopeFactory;
    var InstantMessageFactory = ns.dkd.InstantMessageFactory;
    var SecureMessageFactory = ns.dkd.SecureMessageFactory;
    var ReliableMessageFactory = ns.dkd.ReliableMessageFactory;

    var ContentFactory = ns.ContentFactory;
    var CommandFactory = ns.CommandFactory;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory = ns.GroupCommandFactory;

    var registerMessageFactories = function () {
        // Envelope factory
        Envelope.setFactory(new EnvelopeFactory());
        // Message factories
        InstantMessage.setFactory(new InstantMessageFactory());
        SecureMessage.setFactory(new SecureMessageFactory());
        ReliableMessage.setFactory(new ReliableMessageFactory());
    };

    /**
     *  Register core content factories
     */
    var registerContentFactories = function () {

        // Text
        Content.setFactory(ContentType.TEXT, new ContentFactory(ns.dkd.BaseTextContent));

        // File
        Content.setFactory(ContentType.FILE, new ContentFactory(ns.dkd.BaseFileContent));
        // Image
        Content.setFactory(ContentType.IMAGE, new ContentFactory(ns.dkd.ImageFileContent));
        // Audio
        Content.setFactory(ContentType.AUDIO, new ContentFactory(ns.dkd.AudioFileContent));
        // Video
        Content.setFactory(ContentType.VIDEO, new ContentFactory(ns.dkd.VideoFileContent));

        // Web Page
        Content.setFactory(ContentType.PAGE, new ContentFactory(ns.dkd.WebPageContent));

        // Money
        Content.setFactory(ContentType.MONEY, new ContentFactory(ns.dkd.BaseMoneyContent));
        Content.setFactory(ContentType.TRANSFER, new ContentFactory(ns.dkd.TransferMoneyContent));
        // ...

        // Command
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());

        // History Command
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());

        // Content Array
        Content.setFactory(ContentType.ARRAY, new ContentFactory(ns.dkd.ListContent));

        /*/
        // Application Customized
        Content.setFactory(ContentType.CUSTOMIZED, new ContentFactory(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentFactory(ns.dkd.AppCustomizedContent));
        /*/

        // Top-Secret
        Content.setFactory(ContentType.FORWARD, new ContentFactory(ns.dkd.SecretContent));

        // unknown content type
        Content.setFactory(0, new ContentFactory(ns.dkd.BaseContent));
    };

    /**
     *  Register core command factories
     */
    var registerCommandFactories = function () {

        // Meta Command
        Command.setFactory(Command.META, new CommandFactory(ns.dkd.cmd.BaseMetaCommand));

        // Document Command
        Command.setFactory(Command.DOCUMENT, new CommandFactory(ns.dkd.cmd.BaseDocumentCommand));

        // Group Commands
        Command.setFactory('group', new GroupCommandFactory());
        Command.setFactory(GroupCommand.INVITE, new CommandFactory(ns.dkd.cmd.InviteGroupCommand));
        Command.setFactory(GroupCommand.EXPEL, new CommandFactory(ns.dkd.cmd.ExpelGroupCommand));
        Command.setFactory(GroupCommand.JOIN, new CommandFactory(ns.dkd.cmd.JoinGroupCommand));
        Command.setFactory(GroupCommand.QUIT, new CommandFactory(ns.dkd.cmd.QuitGroupCommand));
        Command.setFactory(GroupCommand.QUERY, new CommandFactory(ns.dkd.cmd.QueryGroupCommand));
        Command.setFactory(GroupCommand.RESET, new CommandFactory(ns.dkd.cmd.ResetGroupCommand));
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
        Content.setFactory(ContentType.CUSTOMIZED, new ContentFactory(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentFactory(ns.dkd.AppCustomizedContent));
    };

    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;

    ns.registerAllFactories = registerAllFactories;

})(DIMP);
