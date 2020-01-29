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

//! require <crypto.js>

!function (ns) {
    'use strict';

    var Dictionary = ns.type.Dictionary;
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
        console.assert(false, 'implement me!');
        return null;
    };

    RSAPublicKey.prototype.getSize = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    RSAPublicKey.prototype.verify = function (data, signature) {
        console.assert(data != null, 'data empty');
        console.assert(signature != null, 'signature empty');
        console.assert(false, 'implement me!');
        return false;
    };

    RSAPublicKey.prototype.encrypt = function (plaintext) {
        console.assert(plaintext !== null, 'plaintext empty');
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- register --------
    PublicKey.register(PublicKey.RSA, RSAPublicKey);
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

    var Dictionary = ns.type.Dictionary;
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
        console.assert(false, 'implement me!');
        return null;
    };

    RSAPrivateKey.prototype.getSize = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    RSAPrivateKey.prototype.getPublicKey = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    RSAPrivateKey.prototype.sign = function (data) {
        console.assert(data != null, 'data empty');
        console.assert(false, 'implement me!');
        return null;
    };

    RSAPrivateKey.prototype.decrypt = function (data) {
        console.assert(data != null, 'data empty');
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- register --------
    PrivateKey.register(PrivateKey.RSA, RSAPrivateKey);
    PrivateKey.register('SHA256withRSA', RSAPrivateKey);
    PrivateKey.register('RSA/ECB/PKCS1Padding', RSAPrivateKey);

    //-------- namespace --------
    if (typeof ns.plugins !== 'object') {
        ns.plugins = {};
    }
    ns.plugins.RSAPrivateKey = RSAPrivateKey;

}(DIMP);
