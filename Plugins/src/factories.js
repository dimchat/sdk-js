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

//! require 'crypto/*.js'
//! require 'digest/*.js'
//! require 'format/*.js'
//! require 'mkm/*.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;

    /**
     *  AES key factory
     *  ~~~~~~~~~~~~~~~
     */
    var AESKeyFactory = function () {
        Object.call(this);
    };
    Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);

    // Override
    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return this.parseSymmetricKey({
            'algorithm': SymmetricKey.AES
        });
    };

    // Override
    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key);
    };

    /**
     *  Register symmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var aes = new AESKeyFactory();
    SymmetricKey.setFactory(SymmetricKey.AES, aes);
    SymmetricKey.setFactory('AES/CBC/PKCS7Padding', aes);

})(MONKEY);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;

    /**
     *  Plain key factory
     *  ~~~~~~~~~~~~~~~~~
     */
    var PlainKeyFactory = function () {
        Object.call(this);
    };
    Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);

    // Override
    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance();
    };

    // Override
    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        return PlainKey.getInstance();
    };

    /**
     *  Register symmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory());

})(MONKEY);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
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
        Object.call(this);
    };
    Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);

    // Override
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return this.parsePrivateKey({
            'algorithm': AsymmetricKey.RSA
        });
    };

    // Override
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new RSAPrivateKey(key);
    };

    /**
     *  RSA public key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var RSAPublicKeyFactory = function () {
        Object.call(this);
    };
    Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);

    // Override
    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key);
    };

    /**
     *  Register asymmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.setFactory('SHA256withRSA', rsa_pri);
    PrivateKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pri);

    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
    PublicKey.setFactory('SHA256withRSA', rsa_pub);
    PublicKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pub);

})(MONKEY);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
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
        Object.call(this);
    };
    Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);

    // Override
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return this.parsePrivateKey({
            'algorithm': AsymmetricKey.ECC
        });
    };

    // Override
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new ECCPrivateKey(key);
    };

    /**
     *  ECC public key factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ECCPublicKeyFactory = function () {
        Object.call(this);
    };
    Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);

    // Override
    ECCPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new ECCPublicKey(key);
    };

    /**
     *  Register asymmetric key parsers
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ecc_pri = new ECCPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
    PrivateKey.setFactory('SHA256withECC', ecc_pri);

    var ecc_pub = new ECCPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
    PublicKey.setFactory('SHA256withECC', ecc_pub);

})(MONKEY);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;

    /**
     *  Address factory
     *  ~~~~~~~~~~~~~~~
     */
    var GeneralAddressFactory = function () {
        BaseAddressFactory.call(this);
    };
    Class(GeneralAddressFactory, BaseAddressFactory, null, null);

    // Override
    GeneralAddressFactory.prototype.createAddress = function(address) {
        if (!address) {
            throw new ReferenceError('address empty');
        }
        var len = address.length;
        if (len === 8) {
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE;
            }
        } else if (len === 10) {
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE;
            }
        } else if (len === 42) {
            return ETHAddress.parse(address);
        } else if (26 <= len && len <= 35) {
            return BTCAddress.parse(address);
        }
        throw new TypeError('invalid address: ' + address);
    };

    /**
     *  Register address factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    Address.setFactory(new GeneralAddressFactory());

})(MingKeMing);
