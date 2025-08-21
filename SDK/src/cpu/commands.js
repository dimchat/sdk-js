'use strict';
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

    sdk.cpu.MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    var MetaCommandProcessor = sdk.cpu.MetaCommandProcessor;

    Class(MetaCommandProcessor, BaseCommandProcessor, null, {

        // Override
        processContent: function (content, rMsg) {
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
                return [
                    MetaCommand.response(identifier, meta)
                ];
            }
            var text = 'Meta not found.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta not found: ${did}.',
                'replacements': {
                    'did': identifier.toString()
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
                'template': 'Meta received: ${did}.',
                'replacements': {
                    'did': identifier.toString()
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
                    'template': 'Meta not valid: ${did}.',
                    'replacements': {
                        'did': identifier.toString()
                    }
                });
            } else if (!this.getArchivist().saveMeta(meta, identifier)) {
                // DB error?
                text = 'Meta not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not accepted: ${did}.',
                    'replacements': {
                        'did': identifier.toString()
                    }
                });
            }
            // meta saved, return no error
            return null;
        },

        // protected
        checkMeta: function (meta, identifier) {
            return meta.isValid() && MetaUtils.matchIdentifier(identifier, meta);
        }
    });


    sdk.cpu.DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    var DocumentCommandProcessor = sdk.cpu.DocumentCommandProcessor;

    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {

        // Override
        processContent: function (content, rMsg) {
            var text;
            var identifier = content.getIdentifier();
            if (!identifier) {
                // error
                text = 'Document command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content);
            }
            var documents = content.getDocuments();
            if (!documents) {
                // query entity documents for ID
                return this.queryDocument(identifier, content, rMsg.getEnvelope());
            }
            var doc;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                if (identifier.equals(doc.getIdentifier())) {
                    // document ID matched
                } else {
                    // error
                    text = 'Document ID not match.';
                    return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                        'template': 'Document ID not match: ${did}.',
                        'replacements': {
                            'did': identifier.toString()
                        }
                    });
                }
            }
            // received a new document for ID
            return this.updateDocuments(documents, identifier, content, rMsg.getEnvelope());
        },

        // private
        queryDocument: function (identifier, content, envelope) {
            var text;
            var documents = this.getFacebook().getDocuments(identifier);
            if (!documents || documents.length === 0) {
                text = 'Document not found.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not found: ${did}.',
                    'replacements': {
                        'did': identifier.toString()
                    }
                });
            }
            // documents got
            var queryTime = content.getLastTime();
            if (queryTime) {
                // check last document time
                var last = DocumentUtils.lastDocument(documents);
                var lastTime = !last ? null : last.getTime();
                if (!lastTime) {
                    // ERROR: document error
                } else if (lastTime.getTime() <= queryTime.getTime()) {
                    // document not updated
                    text = 'Document not updated.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Document not updated: ${did}, last time: ${time}.',
                        'replacements': {
                            'did': identifier.toString(),
                            'time': lastTime.getTime()
                        }
                    });
                }
            }
            var meta = this.getFacebook().getMeta(identifier);
            return [
                DocumentCommand.response(identifier, meta, documents)
            ];
        },

        // private
        updateDocuments: function (documents, identifier, content, envelope) {
            var errors;  // List<Content>
            var meta = content.getMeta();
            var text;
            // 0. check meta
            if (!meta) {
                meta = this.getFacebook().getMeta(identifier);
                if (!meta) {
                    text = 'Meta not found.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Meta not found: ${did}.',
                        'replacements': {
                            'did': identifier.toString()
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
            errors = [];
            var array;
            var doc;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                array = this.saveDocument(doc, meta, identifier, content, envelope);
                if (array) {
                    for (var j = 0; j < array.length; ++j) {
                        errors.push(array[j]);
                    }
                }
            }
            if (array.length > 0) {
                // failed
                return errors;
            }
            // 3. success
            text = 'Document received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Document received: ${did}.',
                'replacements': {
                    'did': identifier.toString()
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
                    'template': 'Document not accepted: ${did}.',
                    'replacements': {
                        'did': identifier.toString()
                    }
                });
            } else if (!this.getArchivist().saveDocument(doc)) {
                // document expired
                text = 'Document not changed.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not changed: ${did}.',
                    'replacements': {
                        'did': identifier.toString()
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
