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
//! require 'command.js'

!function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;

    var ContentProcessor = ns.cpu.ContentProcessor;

    /**
     *  Default Content Processor
     */
    var DefaultContentProcessor = function (messenger) {
        ContentProcessor.call(this, messenger);
    };
    ns.type.Class(DefaultContentProcessor, ContentProcessor);

    //
    //  Main
    //
    DefaultContentProcessor.prototype.process = function (content, sender, msg) {
        var type = content.type.toString();
        var text = 'Content (type: ' + type + ') not support yet!';
        var res = new TextContent(text);
        // check group message
        var group = content.getGroup();
        if (group) {
            res.setGroup(group);
        }
        return res;
    };

    //-------- register --------
    ContentProcessor.register(ContentType.UNKNOWN, DefaultContentProcessor);

    //-------- namespace --------
    ns.cpu.DefaultContentProcessor = DefaultContentProcessor;

}(DIMP);

!function (ns) {
    'use strict';

    var TextContent = ns.protocol.TextContent;

    var CommandProcessor = ns.cpu.CommandProcessor;

    /**
     *  Default Command Processor
     */
    var DefaultCommandProcessor = function (messenger) {
        CommandProcessor.call(this, messenger);
    };
    ns.type.Class(DefaultCommandProcessor, CommandProcessor);

    //
    //  Main
    //
    DefaultCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var name = cmd.getCommand();
        var text = 'Command (name: ' + name + ') not support yet!';
        var res = new TextContent(text);
        // check group message
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group);
        }
        return res;
    };

    //-------- register --------
    CommandProcessor.register(CommandProcessor.UNKNOWN, DefaultCommandProcessor);

    //-------- namespace --------
    ns.cpu.DefaultCommandProcessor = DefaultCommandProcessor;

}(DIMP);
