;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2023 Albert Moky
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

//! require <crypto.js>

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;

    var general_factory = function () {
        var man = ns.crypto.FactoryManager;
        return man.generalFactory;
    };

    /**
     *  Base Crypto Key
     *  ~~~~~~~~~~~~~~~
     */
    var BaseKey = function (key) {
        Dictionary.call(this, key);
    };
    Class(BaseKey, Dictionary, [CryptographyKey], {

        // Override
        getAlgorithm: function () {
            var gf = general_factory();
            return gf.getAlgorithm(this.toMap());
        }
    });

    /**
     *  Base Symmetric Key
     *  ~~~~~~~~~~~~~~~~~~
     */
    var BaseSymmetricKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BaseSymmetricKey, BaseKey, [SymmetricKey], {

        // Override
        equals: function (other) {
            if (this === other) {
                return true;
            } else if (!other) {
                return false;
            } else if (Interface.conforms(other, SymmetricKey)) {
                return this.match(other);
            } else {
                return false;
            }
        },

        // Override
        match: function (encryptKey) {
            var gf = general_factory();
            return gf.matchEncryptKey(encryptKey);
        }
    });

    /**
     *  Base Asymmetric Key
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var BaseAsymmetricKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BaseAsymmetricKey, BaseKey, [AsymmetricKey], null);

    /**
     *  Base Private Key
     *  ~~~~~~~~~~~~~~~~
     */
    var BasePrivateKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BasePrivateKey, BaseKey, [PrivateKey], {

        // Override
        equals: function (other) {
            if (this === other) {
                return true;
            } else if (!other) {
                return false;
            } else if (Interface.conforms(other, PrivateKey)) {
                return this.match(other);
            } else {
                return false;
            }
        }
    });

    /**
     *  Base Public Key
     *  ~~~~~~~~~~~~~~~
     */
    var BasePublicKey = function (key) {
        BaseKey.call(this, key);
    };
    Class(BasePublicKey, BaseKey, [PublicKey], {

        // Override
        match: function (signKey) {
            var gf = general_factory();
            return gf.matchSignKey(signKey);
        }
    });

    //-------- namespace --------
    ns.crypto.BaseKey = BaseKey;
    ns.crypto.BaseSymmetricKey = BaseSymmetricKey;
    ns.crypto.BaseAsymmetricKey = BaseAsymmetricKey;
    ns.crypto.BasePrivateKey = BasePrivateKey;
    ns.crypto.BasePublicKey = BasePublicKey;

})(MONKEY);
