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

(function (ns) {
    'use strict';

    //-------- PEM functions begin --------

    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = '\r\n';
    var rfc2045 = function (data) {
        var base64 = ns.format.Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = '';
            var start = 0, end;
            for (; start < length; start += MIME_LINE_MAX_LEN) {
                end = start + MIME_LINE_MAX_LEN;
                if (end < length) {
                    sb += base64.substring(start, end);
                    sb += CR_LF;
                } else {
                    sb += base64.substring(start, length);
                    break;
                }
            }
            base64 = sb;
        }
        return base64;
    };

    var encode_key = function (key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right;
    };

    var decode_key = function (pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null;
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null;
        }
        return ns.format.Base64.decode(pem.substring(start, end));
    };

    var encode_public = function (key) {
        return encode_key(key,
            '-----BEGIN PUBLIC KEY-----',
            '-----END PUBLIC KEY-----');
    };
    var encode_rsa_private = function (key) {
        return encode_key(key,
            '-----BEGIN RSA PRIVATE KEY-----',
            '-----END RSA PRIVATE KEY-----');
    };

    var decode_public = function (pem) {
        var data = decode_key(pem,
            '-----BEGIN PUBLIC KEY-----',
            '-----END PUBLIC KEY-----');
        if (!data) {
            data = decode_key(pem,
                "-----BEGIN RSA PUBLIC KEY-----",
                "-----END RSA PUBLIC KEY-----");
        }
        if (data) {
            // // FIXME: PKCS#1 -> X.509
            // var header = [48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0];
            // data = header.concat(data);
            return data;
        }
        if (pem.indexOf('PRIVATE KEY') > 0) {
            throw new TypeError('this is a private key content');
        } else {
            // key content without wrapper
            return ns.format.Base64.decode(pem);
        }
    };
    var decode_rsa_private = function (pem) {
        var data = decode_key(pem,
            '-----BEGIN RSA PRIVATE KEY-----',
            '-----END RSA PRIVATE KEY-----');
        if (data) {
            return data;
        }
        if (pem.indexOf('PUBLIC KEY') > 0) {
            throw new TypeError('this is not a RSA private key content');
        } else {
            // key content without wrapper
            return ns.format.Base64.decode(pem);
        }
    };

    //-------- PEM functions end --------

    var Class = ns.type.Class;

    //
    //  PEM
    //
    var pem = function () {
        Object.call(this);
    };
    Class(pem, Object, null, null);

    pem.prototype.encodePublicKey = function (key) {
        return encode_public(key);
    };
    pem.prototype.encodePrivateKey = function (key) {
        return encode_rsa_private(key);
    };

    pem.prototype.decodePublicKey = function (pem) {
        return decode_public(pem);
    };
    pem.prototype.decodePrivateKey = function (pem) {
        return decode_rsa_private(pem);
    };

    //-------- namespace --------
    ns.format.PEM = new pem();

})(DIMP);
