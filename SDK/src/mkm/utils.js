'use strict';
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
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

    mkm.mkm.MetaUtils = {

        /**
         *  Check whether meta matches with entity ID
         *  (must call this when received a new meta from network)
         *
         * @param {mkm.protocol.ID} identifier
         * @param {mkm.protocol.Meta} meta
         * @return {boolean} true on matched
         */
        matchIdentifier: function (identifier, meta) {
            if (!meta.isValid()) {
                return false;
            }
            // check ID.name
            var seed = meta.getSeed();
            var name = identifier.getName();
            if (seed !== name) {
                return false;
            }
            // check ID.address
            var old = identifier.getAddress();
            var gen = Address.generate(meta, old.getType());
            return old.equals(gen);
        },

        /**
         *  Check whether meta matches with public key
         *
         * @param {mk.protocol.VerifyKey} pKey
         * @param {mkm.protocol.Meta} meta
         * @return {boolean} true on matched
         */
        matchPublicKey : function (pKey, meta) {
            if (!meta.isValid()) {
                return false;
            }
            // check whether the public key equals to meta.key
            if (meta.getPublicKey().equals(pKey)) {
                return true;
            }
            // check with seed & fingerprint
            var seed = meta.getSeed();
            if (!seed) {
                // NOTICE: ID with BTC/ETH address has no username, so
                //         just compare the key.data to check matching
                return false;
            }
            var fingerprint = meta.getFingerprint();
            if (!fingerprint) {
                // fingerprint should not be empty here
                return false;
            }
            // check whether keys equal by verifying signature
            var data = UTF8.encode(seed);
            return pKey.verify(data, fingerprint);
        }
    };
    var MetaUtils = mkm.mkm.MetaUtils;

    mkm.mkm.DocumentUtils = {

        getDocumentType: function (document) {
            var helper = SharedAccountExtensions.getHelper();
            return helper.getDocumentType(document.toMap(), null);
        },

        /**
         *  Check whether this time is before old time
         */
        isBefore: function (oldTime, thisTime) {
            if (!oldTime || !thisTime) {
                return false;
            }
            return thisTime.getTime() < oldTime.getTime();
        },

        /**
         *  Check whether this document's time is before old document's time
         */
        isExpired: function (thisDoc, oldDoc) {
            var thisTime = thisDoc.getTime();
            var oldTime = oldDoc.getTime();
            return this.isBefore(oldTime, thisTime);
        },

        /**
         *  Select last document matched the type
         */
        lastDocument: function (documents, type) {
            if (!documents || documents.length === 0) {
                return null;
            } else if (!type || type === '*') {
                type = '';
            }
            var checkType = type.length > 0;
            var last = null;
            var doc, docType, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                // 1. check type
                if (checkType) {
                    docType = this.getDocumentType(doc);
                    matched = !docType || docType.length === 0 || docType === type;
                    if (!matched) {
                        // type not matched, skip it
                        continue;
                    }
                }
                // 2. check time
                if (last != null && this.isExpired(doc, last)) {
                    // skip expired document
                    continue;
                }
                // got it
                last = doc;
            }
            return last;
        },

        /**
         *  Select last visa document
         */
        lastVisa: function (documents) {
            if (!documents || documents.length === 0) {
                return null;
            }
            var last = null;
            var doc, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                // 1. check type
                matched = Interface.conforms(doc, Visa);
                if (!matched) {
                    // type not matched, skip it
                    continue;
                }
                // 2. check time
                if (last != null && this.isExpired(doc, last)) {
                    // skip expired document
                    continue;
                }
                // got it
                last = doc;
            }
            return last;
        },

        /**
         *  Select last bulletin document
         */
        lastBulletin: function (documents) {
            if (!documents || documents.length === 0) {
                return null;
            }
            var last = null;
            var doc, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                // 1. check type
                matched = Interface.conforms(doc, Bulletin);
                if (!matched) {
                    // type not matched, skip it
                    continue;
                }
                // 2. check time
                if (last != null && this.isExpired(doc, last)) {
                    // skip expired document
                    continue;
                }
                // got it
                last = doc;
            }
            return last;
        }
    };
    var DocumentUtils = mkm.mkm.DocumentUtils;
