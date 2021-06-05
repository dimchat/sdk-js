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
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;

    var DocumentCommandProcessor = function (messenger) {
        MetaCommandProcessor.call(this, messenger);
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null);

    // query document for ID
    var get_doc = function (identifier, type, facebook) {
        var doc = facebook.getDocument(identifier, type);
        if (!doc) {
            // document not found
            var text = 'Sorry, document not found for ID: ' + identifier;
            return new TextContent(text);
        }
        // response
        var meta = facebook.getMeta(identifier);
        return DocumentCommand.response(identifier, meta, doc);
    };

    // received a document with ID
    var put_doc = function (identifier, meta, doc, facebook) {
        if (meta) {
            // received a meta for ID
            if (!facebook.saveMeta(meta, identifier)) {
                // save meta failed
                return new TextContent('Meta not accept: ' + identifier);
            }
        }
        // received a document wit ID
        if (!facebook.saveDocument(doc)) {
            // save profile failed
            return new TextContent('Document not accept: ' + identifier);
        }
        // response receipt
        return new ReceiptCommand('Document received: ' + identifier);
    };

    // @Override
    DocumentCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var doc = cmd.getDocument();
            if (!doc) {
                var type = cmd.getValue('doc_type');
                if (!type) {
                    type = '*';  // ANY
                }
                return get_doc(identifier, type, this.getFacebook());
            } else if (identifier.equals(doc.getIdentifier())) {
                var meta = cmd.getMeta();
                return put_doc(identifier, meta, doc, this.getFacebook());
            }
        }
        // command error
        return null;
    };

    //-------- namespace --------
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;

    ns.cpu.register('DocumentCommandProcessor');

}(DIMP);
