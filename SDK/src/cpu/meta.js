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

    var TextContent = ns.protocol.TextContent;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var CommandProcessor = ns.cpu.CommandProcessor;

    var MetaCommandProcessor = function (messenger) {
        CommandProcessor.call(this, messenger);
    };
    ns.Class(MetaCommandProcessor, CommandProcessor, null);

    // query meta for ID
    var get_meta = function (identifier, facebook) {
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            // meta not found
            var text = 'Sorry, meta not found for ID: ' + identifier;
            return new TextContent(text);
        }
        // response
        return MetaCommand.response(identifier, meta);
    };

    // received a meta for ID
    var put_meta = function (identifier, meta, facebook) {
        if (!facebook.saveMeta(meta, identifier)) {
            // save meta failed
            return new TextContent('Meta not accept: ' + identifier);
        }
        // response receipt
        return new ReceiptCommand('Meta received: ' + identifier);
    };

    // @Override
    MetaCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var meta = cmd.getMeta();
            if (meta) {
                return put_meta.call(this, identifier, meta, this.getFacebook());
            } else {
                return get_meta.call(this, identifier, this.getFacebook());
            }
        }
        // command error
        return null;
    };

    //-------- namespace --------
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;

    ns.cpu.register('MetaCommandProcessor');

}(DIMP);
