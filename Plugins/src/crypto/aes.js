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

//! require <crypto.js>

(function (ns) {
    'use strict';

    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;

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
     *          iv       : "{BASE64_ENCODE}", // initialization vector
     *      }
     */
    var AESKey = function (key) {
        Dictionary.call(this, key);
        // TODO: check algorithm parameters
        // 1. check mode = 'CBC'
        // 2. check padding = 'PKCS7Padding'
    };
    ns.Class(AESKey, Dictionary, [SymmetricKey], {

        // Override
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },

        getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size);
            } else {
                return 32;
            }
        },

        getBlockSize: function () {
            // TODO: get from iv data
            var size = this.getValue('blockSize');
            if (size) {
                return Number(size);
            } else {
                return 16;
            }
        },

        // Override
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.Base64.decode(data);
            }

            //
            // TODO: key data empty? generate new key info
            //

            // random key data
            var keySize = this.getSize();
            var pwd = random_data(keySize);
            this.setValue('data', ns.format.Base64.encode(pwd));

            // random initialization vector
            var blockSize = this.getBlockSize();
            var iv = random_data(blockSize);
            this.setValue('iv', ns.format.Base64.encode(iv));

            // // other parameters
            // this.setValue('mode', 'CBC');
            // this.setValue('padding', 'PKCS7');

            return pwd;
        },

        getInitVector: function () {
            var iv = this.getValue('iv');
            if (iv) {
                return ns.format.Base64.decode(iv);
            }
            // zero iv
            var zeros = zero_data(this.getBlockSize());
            this.setValue('iv', ns.format.Base64.encode(zeros));
            return zeros;
        },

        // Override
        encrypt: function (plaintext) {

            var data = this.getData();
            var iv = this.getInitVector();

            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);

            var message = bytes2words(plaintext);
            var cipher = CryptoJS.AES.encrypt(message, keyWordArray, { iv: ivWordArray });
            if (cipher.hasOwnProperty('ciphertext')) {
                return words2bytes(cipher.ciphertext);
            } else {
                throw new TypeError('failed to encrypt message with key: ' + this);
            }
        },

        // Override
        decrypt: function (ciphertext) {

            var data = this.getData();
            var iv = this.getInitVector();

            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);

            var cipher = {
                ciphertext: bytes2words(ciphertext)
            };
            var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, { iv: ivWordArray });
            return words2bytes(plaintext);
        },

        // Override
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });

    //-------- namespace --------
    ns.crypto.AESKey = AESKey;

    ns.crypto.registers('AESKey');

})(MONKEY);
