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

    var Hex = ns.format.Hex;
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

    var x509_header = [48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0];
    var parse_key = function () {
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPublicKey(key);
            if (cipher.key.e === 0 || cipher.key.n === null) {
                // FIXME: PKCS#1 -> X.509
                der = x509_header.concat(der);
                key = Base64.encode(der);
                cipher.setPublicKey(key);
            }
            this.cipher = cipher;
        }
        return this.cipher;
    };

    RSAPublicKey.prototype.verify = function (data, signature) {
        // convert Int8Array to WordArray
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        // convert Int8Array to Base64
        signature = Base64.encode(signature);
        // create signer
        var cipher = parse_key.call(this);
        //
        //  verify(data, signature):
        //    param  WordArray
        //    param  Base64
        //    return boolean
        //
        return cipher.verify(data, signature, CryptoJS.SHA256);
    };

    RSAPublicKey.prototype.encrypt = function (plaintext) {
        // convert Int8Array to String
        plaintext = (new ns.type.String(plaintext)).toString();
        // create cipher
        var cipher = parse_key.call(this);
        //
        //  encrypt(data):
        //    param  String
        //    return Base64|false
        //
        var base64 = cipher.encrypt(plaintext);
        if (base64) {
            // convert Base64 to Int8Array
            return Base64.decode(base64);
        } else {
            throw Error('RSA encrypt error: ' + plaintext);
        }
    };

    //-------- register --------
    PublicKey.register(AsymmetricKey.RSA, RSAPublicKey);
    PublicKey.register('SHA256withRSA', RSAPublicKey);
    PublicKey.register('RSA/ECB/PKCS1Padding', RSAPublicKey);

    //-------- namespace --------
    ns.plugins.RSAPublicKey = RSAPublicKey;

    // ns.plugins.register('RSAPublicKey');

}(DIMP);

!function (ns) {
    'use strict';

    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;

    var Dictionary = ns.type.Dictionary;

    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;

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
            var pem = generate.call(this, bits);
            return PEM.decodePrivateKey(pem);
        }
    };

    var generate = function (bits) {
        var cipher = new JSEncrypt({default_key_size: bits});
        // create a new private key
        var key = cipher.getKey();
        var pem = key.getPublicKey() + '\r\n' + key.getPrivateKey();
        this.setValue('data', pem);
        this.setValue('mode', 'ECB');
        this.setValue('padding', 'PKCS1');
        this.setValue('digest', 'SHA256');
        return pem;
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
        // create cipher
        var key = Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        var pem = cipher.getPublicKey();
        var info = {
            algorithm: this.getValue('algorithm'),
            data: pem,
            mode: 'ECB',
            padding: 'PKCS1',
            digest: 'SHA256'
        };
        return PublicKey.getInstance(info);
    };

    var parse_key = function () {
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            this.cipher = cipher;
        }
        return this.cipher;
    };

    RSAPrivateKey.prototype.sign = function (data) {
        // convert Int8Array to WordArray
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        // create signer
        var cipher = parse_key.call(this);
        //
        //  sign(data):
        //    param  WordArray
        //    return Base64|false
        //
        var base64 = cipher.sign(data, CryptoJS.SHA256, 'sha256');
        if (base64) {
            // convert Base64 to Int8Array
            return Base64.decode(base64);
        } else {
            throw Error('RSA sign error: ' + data);
        }
    };

    RSAPrivateKey.prototype.decrypt = function (data) {
        // convert Int8Array to Base64
        data = Base64.encode(data);
        // create cipher
        var cipher = parse_key.call(this);
        //
        //  decrypt(data):
        //    param  Base64;
        //    return String|false
        //
        var string = cipher.decrypt(data);
        if (string) {
            // convert String to Int8Array
            return (new ns.type.String(string)).getBytes();
        } else {
            throw Error('RSA decrypt error: ' + data);
        }
    };

    //-------- register --------
    PrivateKey.register(AsymmetricKey.RSA, RSAPrivateKey);
    PrivateKey.register('SHA256withRSA', RSAPrivateKey);
    PrivateKey.register('RSA/ECB/PKCS1Padding', RSAPrivateKey);

    //-------- namespace --------
    ns.plugins.RSAPrivateKey = RSAPrivateKey;

    // ns.plugins.register('RSAPrivateKey');

}(DIMP);
