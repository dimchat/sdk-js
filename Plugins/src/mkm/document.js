;
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
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

//! require <dimp.js>

(function (ns) {
    'use strict';

    var Class        = ns.type.Class;
    var ID           = ns.protocol.ID;
    var Document     = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa     = ns.mkm.BaseVisa;

    var doc_type = function (type, identifier) {
        if (type !== '*') {
            return type;
        } else if (identifier.isGroup()) {
            return Document.BULLETIN;
        } else if (identifier.isUser()) {
            return Document.VISA;
        } else {
            return Document.PROFILE;
        }
    };

    /**
     *  General Document factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var GeneralDocumentFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    Class(GeneralDocumentFactory, Object, [Document.Factory], null);

    // Override
    GeneralDocumentFactory.prototype.createDocument = function(identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (data && signature) {
            // create document with data & signature from local storage
            if (type === Document.VISA) {
                return new BaseVisa(identifier, data, signature)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier, data, signature)
            } else {
                return new BaseDocument(identifier, data, signature)
            }
        } else {
            // create empty document
            if (type === Document.VISA) {
                return new BaseVisa(identifier)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier)
            } else {
                return new BaseDocument(identifier, type)
            }
        }
    };

    // Override
    GeneralDocumentFactory.prototype.parseDocument = function(doc) {
        var identifier = ID.parse(doc['ID']);
        if (!identifier) {
            return null;
        }
        var gf = general_factory();
        var type = gf.getDocumentType(doc, null);
        if (!type) {
            type = doc_type('*', identifier);
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc);
        } else if (type === Document.BULLETIN) {
            return new BaseBulletin(doc);
        } else {
            return new BaseDocument(doc);
        }
    };

    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory;
    };

    //-------- namespace --------
    ns.mkm.GeneralDocumentFactory = GeneralDocumentFactory;

})(DIMP);
