'use strict';
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

//! require 'proc.js'

    /**
     *  General ContentProcessor Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    sdk.cpu.GeneralContentProcessorFactory = function (creator) {
        BaseObject.call(this);
        this.__creator = creator;
        this.__content_processors = {}  // type => ContentProcessor
        this.__command_processors = {}  // cmd => ContentProcessor
    };
    var GeneralContentProcessorFactory = sdk.cpu.GeneralContentProcessorFactory;

    Class(GeneralContentProcessorFactory, BaseObject, [ContentProcessorFactory], null);

    // Override
    GeneralContentProcessorFactory.prototype.getContentProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var cmd = content.getCmd();
            // command processor
            cpu = this.getCommandProcessor(type, cmd);
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
        return this.getContentProcessorForType(type);
    };

    // Override
    GeneralContentProcessorFactory.prototype.getContentProcessorForType = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu;
            }
        }
        return cpu;
    };

    // private
    GeneralContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu;
            }
        }
        return cpu;
    };
