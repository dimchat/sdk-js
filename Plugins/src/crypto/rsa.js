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

    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
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
        BasePublicKey.call(this, key);
    };
    Class(RSAPublicKey, BasePublicKey, [EncryptKey], {

        // Override
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePublicKey(data);
            } else {
                throw new ReferenceError('public key data not found');
            }
        },

        getSize: function () {
            // TODO: get from key

            var size = this.getValue('keySize');
            if (size) {
                return Number(size);
            } else {
                return 1024/8; // 128
            }
        },

        // Override
        verify: function (data, signature) {
            // convert Uint8Array to WordArray
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            // convert Uint8Array to Base64
            signature = ns.format.Base64.encode(signature);
            // create signer
            var cipher = parse_key.call(this);
            //
            //  verify(data, signature):
            //    param  WordArray
            //    param  Base64
            //    return boolean
            //
            return cipher.verify(data, signature, CryptoJS.SHA256);
        },

        // Override
        encrypt: function (plaintext, extra) {
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
                var keySize = this.getSize();
                // convert Base64 to Uint8Array
                var res = ns.format.Base64.decode(base64);
                if (res.length === keySize) {
                    return res;
                }
                // FIXME: There is a bug in JSEncrypt
                //        see https://github.com/travist/jsencrypt/issues/158
                var pad = new Uint8Array(keySize);
                pad.set(res, keySize - res.length);
                return pad;
            }
            throw new ReferenceError('RSA encrypt error: ' + plaintext);
        }
    });

    var x509_header = new Uint8Array([48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0]);
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            // FIXME: PKCS#1 -> X.509
            var fixed = new Uint8Array(x509_header.length + der.length);
            fixed.set(x509_header);
            fixed.set(der, x509_header.length);
            key = ns.format.Base64.encode(fixed);
            cipher.setPublicKey(key);
        }
        return cipher;
    };

    //-------- namespace --------
    ns.crypto.RSAPublicKey = RSAPublicKey;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;

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
        BasePrivateKey.call(this, key);
    };
    Class(RSAPrivateKey, BasePrivateKey, [DecryptKey], {

        // Override
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePrivateKey(data);
            } else {
                // generate key
                var bits = this.getSize() * 8;
                var pem = generate.call(this, bits);
                return ns.format.PEM.decodePrivateKey(pem);
            }
        },

        getSize: function () {
            // TODO: get from key

            var size = this.getValue('keySize');
            if (size) {
                return Number(size);
            } else {
                return 1024/8; // 128
            }
        },

        // Override
        getPublicKey: function () {
            // create cipher
            var key = ns.format.Base64.encode(this.getData());
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            var pem = cipher.getPublicKey();
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': pem,
                'mode': 'ECB',
                'padding': 'PKCS1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info);
        },

        // Override
        sign: function (data) {
            // convert Uint8Array to WordArray
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
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
                return ns.format.Base64.decode(base64);
            } else {
                throw new ReferenceError('RSA sign error: ' + data);
            }
        },

        // Override
        decrypt: function (data, params) {
            // convert Uint8Array to Base64
            data = ns.format.Base64.encode(data);
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
                throw new ReferenceError('RSA decrypt error: ' + data);
            }
        }
    });

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

    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher;
    };

    //-------- namespace --------
    ns.crypto.RSAPrivateKey = RSAPrivateKey;

})(DIMP);
