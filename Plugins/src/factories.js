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

//! require 'address.js'

(function (ns) {
    'use strict';

    var Address = ns.protocol.Address;
    var AddressFactory = ns.AddressFactory;
    var BTCAddress = ns.BTCAddress;

    /**
     *  Address factory
     *  ~~~~~~~~~~~~~~~
     */
    var GeneralAddressFactory = function () {
        AddressFactory.call(this);
    };
    ns.Class(GeneralAddressFactory, AddressFactory);

    GeneralAddressFactory.prototype.createAddress = function(address) {
        // TODO: check for ETH address
        return BTCAddress.parse(address);
    };

    /**
     *  Register address factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    Address.setFactory(new GeneralAddressFactory());

})(DIMP);

(function (ns) {
    'use strict';

    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.DefaultMeta;
    var BTCMeta = ns.BTCMeta;

    /**
     *  Meta factory
     *  ~~~~~~~~~~~~
     */
    var GeneralMetaFactory = function (type) {
        this.__type = type;
    };
    ns.Class(GeneralMetaFactory, null, [Meta.Factory]);

    GeneralMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            // MKM
            return new DefaultMeta(this.__type, key, seed, fingerprint);
        } else if (MetaType.BTC.equals(this.__type)) {
            // BTC
            return new BTCMeta(this.__type, key, seed, fingerprint);
        } else if (MetaType.ExBTC.equals(this.__type)) {
            // ExBTC
            return new BTCMeta(this.__type, key, seed, fingerprint);
        } else {
            // unknown type
            return null;
        }
    };

    GeneralMetaFactory.prototype.generateMeta = function(sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            fingerprint = sKey.sign(ns.format.UTF8.encode(seed));
        }
        return this.createMeta(sKey.getPublicKey(), seed, fingerprint);
    };

    GeneralMetaFactory.prototype.parseMeta = function(meta) {
        var type = Meta.getType(meta);
        if (MetaType.MKM.equals(type)) {
            // MKM
            return new DefaultMeta(meta);
        } else if (MetaType.BTC.equals(type)) {
            // BTC
            return new BTCMeta(meta);
        } else if (MetaType.ExBTC.equals(type)) {
            // BTC
            return new BTCMeta(meta);
        } else {
            // unknown type
            return null
        }
    };

    /**
     *  Register meta factories
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    Meta.register(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM));

})(DIMP);

(function (ns) {
    'use strict';

    var Document = ns.protocol.Document;
    var BaseDocument = ns.BaseDocument;
    var BaseBulletin = ns.BaseBulletin;
    var BaseVisa = ns.BaseVisa;

    var doc_type = function (type, identifier) {
        if (type === '*') {
            if (identifier.isGroup()) {
                return Document.BULLETIN;
            } else if (identifier.isUser()) {
                return Document.VISA;
            } else {
                return Document.PROFILE;
            }
        } else {
            return type;
        }
    };

    /**
     *  Document factory
     *  ~~~~~~~~~~~~~~~~
     */
    var GeneralDocumentFactory = function (type) {
        this.__type = type;
    };
    ns.Class(GeneralDocumentFactory, null, [Document.Factory]);

    GeneralDocumentFactory.prototype.createDocument = function(identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (type === Document.VISA) {
            if (data && signature) {
                return new BaseVisa(identifier, data, signature)
            } else {
                return new BaseVisa(identifier)
            }
        } else if (type === Document.BULLETIN) {
            if (data && signature) {
                return new BaseBulletin(identifier, data, signature)
            } else {
                return new BaseBulletin(identifier)
            }
        } else {
            if (data && signature) {
                return new BaseDocument(identifier, data, signature)
            } else {
                return new BaseDocument(identifier)
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function(doc) {
        var identifier = Document.getIdentifier(doc);
        if (!identifier) {
            return null;
        }
        var type = Document.getType(doc);
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

    /**
     *  Register document factories
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    Document.register('*', new GeneralDocumentFactory('*'));
    Document.register(Document.VISA, new GeneralDocumentFactory(Document.VISA));
    Document.register(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
    Document.register(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN));

})(DIMP);

(function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var PlainKey = ns.crypto.PlainKey;

    /**
     *  AES key factory
     *  ~~~~~~~~~~~~~~~
     */
    var AESKeyFactory = function () {
    };
    ns.Class(AESKeyFactory, null, [SymmetricKey.Factory]);

    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return new AESKey({
            'algorithm': SymmetricKey.AES
        });
    };

    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key);
    };

    /**
     *  Plain key factory
     *  ~~~~~~~~~~~~~~~~~
     */
    var PlainKeyFactory = function () {
    };
    ns.Class(PlainKeyFactory, null, [SymmetricKey.Factory]);

    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance();
    };

    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        return PlainKey.getInstance();
    };

    /**
     *  Register symmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    SymmetricKey.register(SymmetricKey.AES, new AESKeyFactory());
    SymmetricKey.register(PlainKey.PLAIN, new PlainKeyFactory());

})(DIMP);

(function (ns) {
    'use strict';

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;

    /**
     *  RSA private key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var RSAPrivateKeyFactory = function () {
    };
    ns.Class(RSAPrivateKeyFactory, null, [PrivateKey.Factory]);

    RSAPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new RSAPrivateKey({
            'algorithm': AsymmetricKey.RSA
        });
    };

    RSAPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new RSAPrivateKey(key);
    };

    /**
     *  RSA public key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var RSAPublicKeyFactory = function () {
    };
    ns.Class(RSAPublicKeyFactory, null, [PublicKey.Factory]);

    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key);
    };

    /**
     *  Register asymmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    PrivateKey.register(AsymmetricKey.RSA, new RSAPrivateKeyFactory());
    PublicKey.register(AsymmetricKey.RSA, new RSAPublicKeyFactory());

})(DIMP);
