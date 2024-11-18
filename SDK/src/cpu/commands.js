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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var MetaCommand     = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var DocumentHelper       = ns.mkm.DocumentHelper;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;

    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var identifier = content.getIdentifier();
            if (!identifier) {
                // error
                var text = 'Meta command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content);
            }
            var meta = content.getMeta();
            if (meta) {
                // received a meta for ID
                return this.updateMeta(meta, identifier, content, rMsg.getEnvelope());
            } else {
                // query meta for ID
                return this.queryMeta(identifier, content, rMsg.getEnvelope());
            }
        },

        // private
        queryMeta: function (identifier, content, envelope) {
            var facebook = this.getFacebook();
            var meta = facebook.getMeta(identifier);
            if (meta) {
                // OK
                var res = MetaCommand.response(identifier, meta);
                return [res];
            }
            var text = 'Meta not found.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta not found: ${ID}.',
                'replacements': {
                    'ID': identifier.toString()
                }
            });
        },

        // private
        updateMeta: function (meta, identifier, content, envelope) {
            // 1. try to save meta
            var errors = this.saveMeta(meta, identifier, content, envelope);
            if (errors) {
                // failed
                return errors;
            }
            // 2. success
            var text = 'Meta received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta received: ${ID}.',
                'replacements': {
                    'ID': identifier.toString()
                }
            });
        },

        // protected
        saveMeta: function (meta, identifier, content, envelope) {
            var text;
            // check meta
            if (!this.checkMeta(meta, identifier)) {
                text = 'Meta not valid.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not valid: ${ID}.',
                    'replacements': {
                        'ID': identifier.toString()
                    }
                });
            } else if (!this.getFacebook().saveMeta(meta, identifier)) {
                // DB error?
                text = 'Meta not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not accepted: ${ID}.',
                    'replacements': {
                        'ID': identifier.toString()
                    }
                });
            }
            // meta saved, return no error
            return null;
        },

        // protected
        checkMeta: function (meta, identifier) {
            return meta.isValid() && meta.matchIdentifier(identifier);
        }
    });

    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var text;
            var identifier = content.getIdentifier();
            if (!identifier) {
                // error
                text = 'Document command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content);
            }
            var doc = content.getDocument();
            if (!doc) {
                // query entity documents for ID
                return this.queryDocument(identifier, content, rMsg.getEnvelope());
            } else if (identifier.equals(doc.getIdentifier())) {
                // received a new document for ID
                return this.updateDocument(doc, identifier, content, rMsg.getEnvelope());
            }
            // error
            text = 'Document ID not match.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Document ID not match: ${ID}.',
                'replacements': {
                    'ID': identifier.toString()
                }
            });
        },

        // private
        queryDocument: function (identifier, content, envelope) {
            var text;
            var docs = this.getFacebook().getDocuments(identifier);
            if (!docs || docs.length === 0) {
                text = 'Document not found.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not found: ${ID}.',
                    'replacements': {
                        'ID': identifier.toString()
                    }
                });
            }
            // documents got
            var queryTime = content.getLastTime();
            if (queryTime) {
                // check last document time
                var last = DocumentHelper.lastDocument(docs);
                var lastTime = !last ? null : last.getTime();
                if (!lastTime) {
                    // ERROR: document error
                } else if (lastTime.getTime() > queryTime.getTime()) {
                    // document not updated
                    text = 'Document not updated.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Document not updated: ${ID}, last time: ${time}.',
                        'replacements': {
                            'ID': identifier.toString(),
                            'time': lastTime.getTime()
                        }
                    });
                }
            }
            var meta = this.getFacebook().getMeta(identifier);
            // respond first document with meta
            var command = DocumentCommand.response(identifier, meta, docs[0]);
            var responses = [command];
            for (var i = 1; i < docs.length; ++i) {
                // respond other documents
                command = DocumentCommand.response(identifier, null, docs[i]);
                responses.push(command);
            }
            return responses;
        },

        // private
        updateDocument: function (doc, identifier, content, envelope) {
            var errors;  // List<Content>
            var meta = content.getMeta();
            var text;
            // 0. check meta
            if (!meta) {
                meta = this.getFacebook().getMeta(identifier);
                if (!meta) {
                    text = 'Meta not found.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Meta not found: ${ID}.',
                        'replacements': {
                            'ID': identifier.toString()
                        }
                    });
                }
            } else {
                // 1. try to save meta
                errors = this.saveMeta(meta, identifier, content, envelope);
                if (errors) {
                    // failed
                    return errors;
                }
            }
            // 2. try to save document
            errors = this.saveDocument(doc, meta, identifier, content, envelope);
            if (errors) {
                // failed
                return errors;
            }
            // 3. success
            text = 'Document received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Document received: ${ID}.',
                'replacements': {
                    'ID': identifier.toString()
                }
            });
        },

        // protected
        saveDocument: function (doc, meta, identifier, content, envelope) {
            var text;
            // check document
            if (!this.checkDocument(doc, meta)) {
                // document error
                text = 'Document not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not accepted: ${ID}.',
                    'replacements': {
                        'ID': identifier.toString()
                    }
                });
            } else if (!this.getFacebook().saveDocument(doc)) {
                // document expired
                text = 'Document not changed.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not changed: ${ID}.',
                    'replacements': {
                        'ID': identifier.toString()
                    }
                });
            }
            // document saved, return no error
            return null;
        },

        // protected
        checkDocument: function (doc, meta) {
            if (doc.isValid()) {
                return true;
            }
            // NOTICE: if this is a bulletin document for group,
            //             verify it with the group owner's meta.key
            //         else (this is a visa document for user)
            //             verify it with the user's meta.key
            return doc.verify(meta.getPublicKey());
            // TODO: check for group document
        }
    });

    //-------- namespace --------
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;

})(DIMP);
