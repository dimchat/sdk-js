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
//! require <crypto-js/cipher-core.js>
//! require <crypto-js/aes.js>

//! require 'keys.js'

(function (ns) {
    'use strict';

    var Class             = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var BaseSymmetricKey  = ns.crypto.BaseSymmetricKey;

    var bytes2words = function (data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string);
    };
    var words2bytes = function (array) {
        var result = array.toString();
        return ns.format.Hex.decode(result);
    };

    var random_data = function (size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random()*256);
        }
        return data;
    };

    var zero_data = function (size) {
        return new Uint8Array(size);
    };

    /**
     *  AES Key
     *
     *      keyInfo format: {
     *          algorithm: "AES",
     *          keySize  : 32,                // optional
     *          data     : "{BASE64_ENCODE}}" // password data
     *      }
     */
    var AESKey = function (key) {
        BaseSymmetricKey.call(this, key);
        // TODO: check algorithm parameters
        // 1. check mode = 'CBC'
        // 2. check padding = 'PKCS7Padding'

        // check key data
        var base64 = this.getValue('data');
        if (base64) {
            // lazy load
            this.__tedKey = null;
        } else {
            // new key
            this.__tedKey = this.generateKeyData();
        }
    };
    Class(AESKey, BaseSymmetricKey, null, {

        // protected
        generateKeyData: function () {
            // random key data
            var keySize = this.getKeySize();
            var pwd = random_data(keySize);
            var ted = TransportableData.create(pwd);

            this.setValue('data', ted.toObject());
            // this.setValue('mod', 'CBC');
            // this.setValue('padding', 'PKCS7');

            return ted;
        },

        // protected
        getKeySize: function () {
            // TODO: get from key data
            return this.getInt('keySize', 32);
        },

        // protected
        getBlockSize: function () {
            // TODO: get from iv data
            return this.getInt('blockSize', 16);  // cipher.getBlockSize();
        },

        // Override
        getData: function () {
            var ted = this.__tedKey;
            if (!ted) {
                var base64 = this.getValue('data');
                ted = TransportableData.parse(base64);
                this.__tedKey = ted;
            }
            return !ted ? null : ted.getData();
        },

        // protected
        getIVString: function (params) {
            var base64 = params['IV'];
            if (base64 && base64.length > 0) {
                return base64;
            }
            base64 = params['iv'];
            if (base64 && base64.length > 0) {
                return base64;
            }
            // compatible with old version
            base64 = this.getString('iv', null);
            if (base64 && base64.length > 0) {
                return base64;
            }
            return this.getString('IV', null);
        },

        // protected
        getIVData: function (params) {
            // get base64 encoded IV from params
            if (!params) {
                throw new SyntaxError('params must provided to fetch IV for AES');
            }
            var base64 = this.getIVString(params);
            // decode IV data
            var ted = TransportableData.parse(base64);
            var ivData = !ted ? null : ted.getData();
            if (ivData) {
                return ivData;
            }
            // zero IV
            var blockSize = this.getBlockSize();
            return zero_data(blockSize);
        },

        // protected
        newIVData: function (extra) {
            if (!extra) {
                throw new SyntaxError('extra dict must provided to store IV for AES');
            }
            // random IV data
            var blockSize = this.getBlockSize();
            var ivData = random_data(blockSize);
            // put encoded IV into extra
            var ted = TransportableData.create(ivData);
            extra['IV'] = ted.toObject();
            // OK
            return ivData;
        },

        // Override
        encrypt: function (plaintext, extra) {
            var message = bytes2words(plaintext);
            // 1. random new 'IV'
            var iv = this.newIVData(extra);
            var ivWordArray = bytes2words(iv);
            // 2. get key
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            // 3. try to encrypt
            try {
                var cipher = CryptoJS.AES.encrypt(message, keyWordArray, { iv: ivWordArray });
                if (cipher.hasOwnProperty('ciphertext')) {
                    return words2bytes(cipher.ciphertext);
                }
            } catch (e) {
                return null;
            }
            //throw new TypeError('failed to encrypt message with key: ' + this);
        },

        // Override
        decrypt: function (ciphertext, params) {
            var message = bytes2words(ciphertext);
            // 1. get 'IV' from extra params
            var iv = this.getIVData(params);
            var ivWordArray = bytes2words(iv);
            // 2. get key
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            // 3. try to decrypt
            var cipher = {
                ciphertext: message
            };
            try {
                var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, { iv: ivWordArray });
                return words2bytes(plaintext);
            } catch (e) {
                return null;
            }
        }
    });

    //-------- namespace --------
    ns.crypto.AESKey = AESKey;

})(DIMP);
