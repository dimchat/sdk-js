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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;

    /**
     *  Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ContentProcessor = Interface(null, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Process message content
     *
     * @param {Content} content      - content received
     * @param {ReliableMessage} rMsg - reliable message
     * @returns {Content[]} responses to sender
     */
    ContentProcessor.prototype.process = function (content, rMsg) {
        throw new Error('NotImplemented');
    };

    /**
     *  CPU Creator
     *  ~~~~~~~~~~~
     */
    var Creator = Interface(null, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Create content processor with type
     *
     * @param {uint} type      - content type
     * @return {ContentProcessor}
     */
    Creator.prototype.createContentProcessor = function (type) {
        throw new Error('NotImplemented');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Create command processor with type & name
     *
     * @param {uint} type  - content type
     * @param {string} cmd - command name
     * @return {ContentProcessor}
     */
    Creator.prototype.createCommandProcessor = function (type, cmd) {
        throw new Error('NotImplemented');
    };

    /**
     *  CPU Factory
     *  ~~~~~~~~~~~
     */
    var Factory = Interface(null, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get content processor with message content
     *
     * @param {Content} content - message content
     * @return {ContentProcessor}
     */
    Factory.prototype.getProcessor = function (content) {
        throw new Error('NotImplemented');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get content processor with type
     *
     * @param {ContentType|uint} type - content type
     * @return {ContentProcessor}
     */
    Factory.prototype.getContentProcessor = function (type) {
        throw new Error('NotImplemented');
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get command processor with type & name
     *
     * @param {uint} type  - content type
     * @param {string} cmd - command name
     * @return {ContentProcessor}
     */
    Factory.prototype.getCommandProcessor = function (type, cmd) {
        throw new Error('NotImplemented');
    };

    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;

    //-------- namespace --------
    ns.cpu.ContentProcessor = ContentProcessor;

})(DIMP);

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class     = ns.type.Class;
    var Command      = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;

    /**
     *  General ContentProcessor Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {}  // uint => ContentProcessor
        this.__command_processors = {}  // string => ContentProcessor
    };
    Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory], null);

    // Override
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var name = content.getCmd();
            // command processor
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else if (Interface.conforms(content, GroupCommand)) {
                // group command processor
                cpu = this.getCommandProcessor(type, 'group');
                if (cpu) {
                    return cpu;
                }
            }
        }
        // content processor
        return this.getContentProcessor(type);
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
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        // if (typeof type !== 'number') {
        //     type = type.valueOf();
        // }
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu;
            }
        }
        return cpu;
    };

    //-------- namespace --------
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;

})(DIMP);
