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
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;

    /**
     *  Address factory
     *  ~~~~~~~~~~~~~~~
     */
    var GeneralAddressFactory = function () {
        AddressFactory.call(this);
    };
    ns.Class(GeneralAddressFactory, AddressFactory, null);

    GeneralAddressFactory.prototype.createAddress = function(address) {
        if (address.length === 42) {
            // TODO: check for ETH address
            throw new TypeError('ETH address not support yet');
        }
        return BTCAddress.parse(address);
    };

    /**
     *  Register address factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    Address.setFactory(new GeneralAddressFactory());

})(MingKeMing);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;

    /**
     *  Meta factory
     *  ~~~~~~~~~~~~
     */
    var GeneralMetaFactory = function (type) {
        obj.call(this);
        this.__type = type;
    };
    ns.Class(GeneralMetaFactory, obj, [Meta.Factory]);

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

})(MingKeMing);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;

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
        obj.call(this);
        this.__type = type;
    };
    ns.Class(GeneralDocumentFactory, obj, [Document.Factory]);

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

})(MingKeMing);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;

    /**
     *  AES key factory
     *  ~~~~~~~~~~~~~~~
     */
    var AESKeyFactory = function () {
        obj.call(this);
    };
    ns.Class(AESKeyFactory, obj, [SymmetricKey.Factory]);

    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return new AESKey({
            'algorithm': SymmetricKey.AES
        });
    };

    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key);
    };

    /**
     *  Register symmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var aes = new AESKeyFactory();
    SymmetricKey.register(SymmetricKey.AES, aes);
    SymmetricKey.register('AES/CBC/PKCS7Padding', aes);

})(MONKEY);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;

    /**
     *  Plain key factory
     *  ~~~~~~~~~~~~~~~~~
     */
    var PlainKeyFactory = function () {
        obj.call(this);
    };
    ns.Class(PlainKeyFactory, obj, [SymmetricKey.Factory]);

    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance();
    };

    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        if (CryptographyKey.getAlgorithm(key) !== PlainKey.PLAIN) {
            throw new TypeError('plain key error: ' + key);
        }
        return PlainKey.getInstance();
    };

    /**
     *  Register symmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    SymmetricKey.register(PlainKey.PLAIN, new PlainKeyFactory());

})(MONKEY);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

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
        obj.call(this);
    };
    ns.Class(RSAPrivateKeyFactory, obj, [PrivateKey.Factory]);

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
        obj.call(this);
    };
    ns.Class(RSAPublicKeyFactory, obj, [PublicKey.Factory]);

    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key);
    };

    /**
     *  Register asymmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.register(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.register('SHA256withRSA', rsa_pri);
    PrivateKey.register('RSA/ECB/PKCS1Padding', rsa_pri);

    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.register(AsymmetricKey.RSA, rsa_pub);
    PublicKey.register('SHA256withRSA', rsa_pub);
    PublicKey.register('RSA/ECB/PKCS1Padding', rsa_pub);

})(MONKEY);

(function (ns) {
    'use strict';

    var obj = ns.type.Object;

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;

    /**
     *  ECC private key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ECCPrivateKeyFactory = function () {
        obj.call(this);
    };
    ns.Class(ECCPrivateKeyFactory, obj, [PrivateKey.Factory]);

    ECCPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new ECCPrivateKey({
            'algorithm': AsymmetricKey.ECC
        });
    };

    ECCPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new ECCPrivateKey(key);
    };

    /**
     *  ECC public key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ECCPublicKeyFactory = function () {
        obj.call(this);
    };
    ns.Class(ECCPublicKeyFactory, obj, [PublicKey.Factory]);

    ECCPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new ECCPublicKey(key);
    };

    /**
     *  Register asymmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ecc_pri = new ECCPrivateKeyFactory();
    PrivateKey.register(AsymmetricKey.ECC, ecc_pri);
    PrivateKey.register('SHA256withECC', ecc_pri);

    var ecc_pub = new ECCPublicKeyFactory();
    PublicKey.register(AsymmetricKey.ECC, ecc_pub);
    PublicKey.register('SHA256withECC', ecc_pub);

})(MONKEY);
