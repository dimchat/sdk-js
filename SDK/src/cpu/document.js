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

//! require 'meta.js'

(function (ns) {
    'use strict';

    var DocumentCommand = ns.protocol.DocumentCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;

    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null);

    // query document for ID
    var get_doc = function (identifier, type) {
        var facebook = this.getFacebook();
        var doc = facebook.getDocument(identifier, type);
        if (doc) {
            // response
            var meta = facebook.getMeta(identifier);
            var res = DocumentCommand.response(identifier, meta, doc);
            return this.respondContent(res);
        } else {
            // document not found
            var text = 'Sorry, document not found for ID: ' + identifier;
            return this.respondText(text, null);
        }
    };

    // received a document with ID
    var put_doc = function (identifier, meta, doc) {
        var text;
        var facebook = this.getFacebook();
        if (meta) {
            // received a meta for ID
            if (!facebook.saveMeta(meta, identifier)) {
                // save meta failed
                text = 'Meta not accept: ' + identifier;
                return this.respondText(text, null);
            }
        }
        // received a document wit ID
        if (facebook.saveDocument(doc)) {
            // response receipt
            text = 'Document received: ' + identifier;
            return this.respondReceipt(text);
        } else {
            // save profile failed
            text = 'Document not accept: ' + identifier;
            return this.respondText(text, null);
        }
    };

    // @Override
    DocumentCommandProcessor.prototype.process = function (cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var doc = cmd.getDocument();
            if (!doc) {
                // query document for ID
                var type = cmd.getValue('doc_type');
                if (!type) {
                    type = '*';  // ANY
                }
                return get_doc.call(this, identifier, type);
            }
            // received a document for ID
            if (identifier.equals(doc.getIdentifier())) {
                var meta = cmd.getMeta();
                return put_doc.call(this, identifier, meta, doc);
            }
        }
        // error
        var text = 'Document command error.';
        return this.respondText(text, null);
    };

    //-------- namespace --------
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;

    ns.cpu.registers('DocumentCommandProcessor');

})(DIMSDK);
