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

(function (ns) {
    'use strict';

    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;

    var Data = ns.type.Data;
    var Dictionary = ns.type.Dictionary;

    var CryptographyKey = ns.crypto.CryptographyKey;
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
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey]);

    RSAPublicKey.prototype.getAlgorithm = function () {
        return CryptographyKey.getAlgorithm(this.getMap());
    };

    RSAPublicKey.prototype.getData = function () {
        var data = this.getValue('data');
        if (data) {
            return PEM.decodePublicKey(data);
        } else {
            throw new Error('public key data not found');
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
    x509_header = new Data(x509_header);
    var parse_key = function () {
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            // FIXME: PKCS#1 -> X.509
            der = x509_header.concat(der).getBytes();
            key = Base64.encode(der);
            cipher.setPublicKey(key);
        }
        return cipher;
    };

    RSAPublicKey.prototype.verify = function (data, signature) {
        // convert Uint8Array to WordArray
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        // convert Uint8Array to Base64
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

    RSAPublicKey.prototype.matches = function (sKey) {
        return AsymmetricKey.matches(sKey, this);
    };

    RSAPublicKey.prototype.encrypt = function (plaintext) {
        // convert Uint8Array to String
        plaintext = ns.format.UTF8.decode(plaintext);
        // create cipher
        var cipher = parse_key.call(this);
        //
        //  encrypt(data):
        //    param  String
        //    return Base64|false
        //
        var base64 = cipher.encrypt(plaintext);
        if (base64) {
            // convert Base64 to Uint8Array
            var res = Base64.decode(base64);
            if (res.length === this.getSize()) {
                return res;
            }
            // FIXME: There is a bug in JSEncrypt
            //        that result.length may be 127 bytes sometimes,
            //        here we just do it again to reduce error opportunities,
            //        but it's still going to happen one in about ten thousand times.
            var hex = cipher.getKey().encrypt(plaintext);
            if (hex) {
                // convert Hex to Uint8Array
                res = Hex.decode(hex);
                if (res.length === this.getSize()) {
                    return res;
                }
                throw new Error('Error encrypt result: ' + plaintext);
            }
        }
        throw new Error('RSA encrypt error: ' + plaintext);
    };

    //-------- namespace --------
    ns.crypto.RSAPublicKey = RSAPublicKey;

    ns.crypto.registers('RSAPublicKey');

})(MONKEY);

(function (ns) {
    'use strict';

    var Dictionary = ns.type.Dictionary;
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;

    var CryptographyKey = ns.crypto.CryptographyKey;
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
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey]);

    RSAPrivateKey.prototype.getAlgorithm = function () {
        return CryptographyKey.getAlgorithm(this.getMap());
    };

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
        return PublicKey.parse(info);
    };

    var parse_key = function () {
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher;
    };

    RSAPrivateKey.prototype.sign = function (data) {
        // convert Uint8Array to WordArray
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
            // convert Base64 to Uint8Array
            return Base64.decode(base64);
        } else {
            throw new Error('RSA sign error: ' + data);
        }
    };

    RSAPrivateKey.prototype.decrypt = function (data) {
        // convert Uint8Array to Base64
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
            // convert String to Uint8Array
            return ns.format.UTF8.encode(string);
        } else {
            throw new Error('RSA decrypt error: ' + data);
        }
    };

    RSAPrivateKey.prototype.matches = function (pKey) {
        return CryptographyKey.matches(pKey, this);
    };

    //-------- namespace --------
    ns.crypto.RSAPrivateKey = RSAPrivateKey;

    ns.crypto.registers('RSAPrivateKey');

})(MONKEY);
