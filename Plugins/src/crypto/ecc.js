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

    /**
     *  ECC Public Key
     *
     *      keyInfo format: {
     *          algorithm: "ECC",
     *          data: "..."       // base64
     *      }
     */
    var ECCPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    ECCPublicKey.inherits(Dictionary, PublicKey);

    ECCPublicKey.prototype.getData = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    ECCPublicKey.prototype.getSize = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    ECCPublicKey.prototype.verify = function (data, signature) {
        console.assert(data != null, 'data empty');
        console.assert(signature != null, 'signature empty');
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- register --------
    PublicKey.register(PublicKey.ECC, ECCPublicKey);

    //-------- namespace --------
    ns.plugins.ECCPublicKey = ECCPublicKey;

}(DIMP);

!function (ns) {
    'use strict';

    var Dictionary = ns.type.Dictionary;
    var PrivateKey = ns.crypto.PrivateKey;

    /**
     *  ECC Private Key
     *
     *      keyInfo format: {
     *          algorithm    : "ECC",
     *          data         : "..." // base64_encode()
     *      }
     */
    var ECCPrivateKey = function (key) {
        Dictionary.call(this, key);
    };
    ECCPrivateKey.inherits(Dictionary, PrivateKey);

    ECCPrivateKey.prototype.getData = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    ECCPrivateKey.prototype.getSize = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    ECCPrivateKey.prototype.getPublicKey = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    ECCPrivateKey.prototype.sign = function (data) {
        console.assert(data != null, 'data empty');
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- register --------
    PrivateKey.register(PrivateKey.ECC, ECCPrivateKey);

    //-------- namespace --------
    ns.plugins.ECCPrivateKey = ECCPrivateKey;

    // ns.plugins.register('ECCPrivateKey');

}(DIMP);
