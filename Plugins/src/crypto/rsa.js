;
// license: https://mit-license.org
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

//! require <crypto-js/core.js> (https://github.com/brix/crypto-js)
//! require <crypto-js/sha256.js>
//! require <jsencrypt.js> (https://github.com/travist/jsencrypt)

//! require <crypto.js>

!function (ns) {
    'use strict';

    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;

    var Dictionary = ns.type.Dictionary;

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;

    /**
     *  RSA Public Key
     *
     *      keyInfo format: {
     *          algorithm: "RSA",
     *          data: "..."       // base64
     *      }
     */
    var RSAPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    RSAPublicKey.inherits(Dictionary, PublicKey, EncryptKey);

    RSAPublicKey.prototype.getData = function () {
        var data = this.getValue('data');
        if (data) {
            return PEM.decodePublicKey(data);
        } else {
            throw Error('public key data not found');
        }
    };

    RSAPublicKey.prototype.getSize = function () {
        // TODO: get from key

        var size = this.getValue('keySize');
        if (size) {
            return Number(size);
        } else {
            return 1024/8; // 128
        }
    };

    RSAPublicKey.prototype.verify = function (data, signature) {
        // convert Int8Array to String
        data = (new ns.type.String(data)).value;
        // convert Int8Array to Base64
        signature = Base64.encode(signature);
        // create signer
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        return cipher.verify(data, signature, CryptoJS.SHA256);
    };

    RSAPublicKey.prototype.encrypt = function (plaintext) {
        // convert Int8Array to String
        plaintext = (new ns.type.String(plaintext)).value;
        // create cipher
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        var base64 = cipher.encrypt(plaintext);
        // convert Base64 to Int8Array
        return Base64.decode(base64);
    };

    //-------- register --------
    PublicKey.register(AsymmetricKey.RSA, RSAPublicKey);
    PublicKey.register('SHA256withRSA', RSAPublicKey);
    PublicKey.register('RSA/ECB/PKCS1Padding', RSAPublicKey);

    //-------- namespace --------
    if (typeof ns.plugins !== 'object') {
        ns.plugins = {};
    }
    ns.plugins.RSAPublicKey = RSAPublicKey;

}(DIMP);

!function (ns) {
    'use strict';

    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;

    var Dictionary = ns.type.Dictionary;

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;

    /**
     *  RSA Private Key
     *
     *      keyInfo format: {
     *          algorithm    : "RSA",
     *          keySizeInBits: 1024, // optional
     *          data         : "..." // base64_encode()
     *      }
     */
    var RSAPrivateKey = function (key) {
        Dictionary.call(this, key);
    };
    RSAPrivateKey.inherits(Dictionary, PrivateKey, DecryptKey);

    RSAPrivateKey.prototype.getData = function () {
        var data = this.getValue('data');
        if (data) {
            return PEM.decodePrivateKey(data);
        } else {
            // generate key
            var bits = this.getSize() * 8;
        }
    };

    RSAPrivateKey.prototype.getSize = function () {
        // TODO: get from key

        var size = this.getValue('keySize');
        if (size) {
            return Number(size);
        } else {
            return 1024/8; // 128
        }
    };

    RSAPrivateKey.prototype.getPublicKey = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    RSAPrivateKey.prototype.sign = function (data) {
        // convert Int8Array to String
        data = (new ns.type.String(data)).value;
        // create signer
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        var base64 = cipher.sign(data, CryptoJS.SHA256, 'sha256');
        // convert Base64 to Int8Array
        return Base64.decode(base64);
    };

    RSAPrivateKey.prototype.decrypt = function (data) {
        // convert Int8Array to Base64
        data = Base64.encode(data);
        // create cipher
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        var string = cipher.decrypt(data);
        // convert String to Int8Array
        return (new ns.type.String(string)).getBytes();
    };

    //-------- register --------
    PrivateKey.register(AsymmetricKey.RSA, RSAPrivateKey);
    PrivateKey.register('SHA256withRSA', RSAPrivateKey);
    PrivateKey.register('RSA/ECB/PKCS1Padding', RSAPrivateKey);

    //-------- namespace --------
    if (typeof ns.plugins !== 'object') {
        ns.plugins = {};
    }
    ns.plugins.RSAPrivateKey = RSAPrivateKey;

}(DIMP);
