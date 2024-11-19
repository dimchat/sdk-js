;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;

    var Password = function () {
        Object.call(this);
    };
    Class(Password, Object, null, null);

    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;

    /**
     *  Generate symmetric key with password string
     *
     * @param {String} password
     * @return {SymmetricKey}
     */
    Password.generate = function (password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        // AES key data
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            // format: {digest_prefix}+{pwd_data}
            var merged = new Uint8Array(Password.KEY_SIZE);
            merged.set(digest.subarray(0, filling));
            merged.set(data, filling);
            data = merged;
        } else if (filling < 0) {
            // throw new RangeError('password too long: ' + password);
            if (Password.KEY_SIZE === digest.length) {
                data = digest;
            } else {
                // FIXME: what about KEY_SIZE > digest.length?
                data = digest.subarray(0, Password.KEY_SIZE);
            }
        }
        // AES iv
        var iv = digest.subarray(digest.length - Password.BLOCK_SIZE, digest.length);
        // generate AES key
        var key = {
            'algorithm': SymmetricKey.AES,
            'data': ns.format.Base64.encode(data),
            'iv': ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key);
    };

    //-------- namespace --------
    ns.crypto.Password = Password;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;

    var PlainKey = function (key) {
        BaseSymmetricKey.call(this, key);
    };
    Class(PlainKey, BaseSymmetricKey, null, {

        // Override
        getData: function () {
            return null;
        },

        // Override
        encrypt: function (data, extra) {
            return data;
        },

        // Override
        decrypt: function (data, params) {
            return data;
        }
    });

    //-------- runtime --------
    var plain_key = null;

    PlainKey.getInstance = function () {
        if (!plain_key) {
            var key = {
                'algorithm': PlainKey.PLAIN
            };
            plain_key = new PlainKey(key);
        }
        return plain_key;
    };

    PlainKey.PLAIN = 'PLAIN';

    //-------- namespace --------
    ns.crypto.PlainKey = PlainKey;

})(DIMP);
