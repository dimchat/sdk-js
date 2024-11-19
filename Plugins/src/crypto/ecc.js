;
// license: https://mit-license.org
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require <bn.js> (https://unpkg.com/bn.js@4.11.8/lib/bn.js)
//! require <secp256k1.js> (https://unpkg.com/@enumatech/secp256k1-js@1.0.0/src/secp256k1.js)

//! require <crypto.js>

(function (ns) {
    'use strict';

    var Secp256k1 = window.Secp256k1;

    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;

    // var mem_set = function (buf, ch, len) {
    //     for (var i = 0; i < len; ++i) {
    //         buf[i] = ch;
    //     }
    // };
    var mem_cpy = function (dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i];
        }
    };

    /**
     *  Refs:
     *      https://github.com/kmackay/micro-ecc
     *      https://github.com/digitalbitbox/mcu/blob/master/src/ecc.c
     */
    var trim_to_32_bytes = function (src, src_offset, src_len, dst) {
        var pos = src_offset;
        while (src[pos] === 0 && src_len > 0) {
            ++pos;
            --src_len;
        }
        if (src_len > 32 || src_len < 1) {
            return false;
        }
        var dst_offset = 32 - src_len;
        // mem_set(dst, 0, dst_offset);
        mem_cpy(dst, dst_offset, src, pos, src_len);
        return true;
    };
    var ecc_der_to_sig = function (der, der_len) {
        /*
         * Structure is:
         *   0x30 0xNN  SEQUENCE + s_length
         *   0x02 0xNN  INTEGER + r_length
         *   0xAA 0xBB  ..   r_length bytes of "r" (offset 4)
         *   0x02 0xNN  INTEGER + s_length
         *   0xMM 0xNN  ..   s_length bytes of "s" (offset 6 + r_len)
         */
        var seq_len;
        // var r_bytes = new Uint8Array(32);
        // var s_bytes = new Uint8Array(32);
        var r_len;
        var s_len;

        // mem_set(r_bytes, 0, 32);
        // mem_set(s_bytes, 0, 32);

        /*
         * Must have at least:
         * 2 bytes sequence header and length
         * 2 bytes R integer header and length
         * 1 byte of R
         * 2 bytes S integer header and length
         * 1 byte of S
         *
         * 8 bytes total
         */
        if (der_len < 8 || der[0] !== 0x30 || der[2] !== 0x02) {
            return null;
        }

        seq_len = der[1];
        if ((seq_len <= 0) || (seq_len + 2 !== der_len)) {
            return null;
        }

        r_len = der[3];
        /*
         * Must have at least:
         * 2 bytes for R header and length
         * 2 bytes S integer header and length
         * 1 byte of S
         */
        if ((r_len < 1) || (r_len > seq_len - 5) || (der[4 + r_len] !== 0x02)) {
            return null;
        }
        s_len = der[5 + r_len];

        /**
         * Must have:
         * 2 bytes for R header and length
         * r_len bytes for R
         * 2 bytes S integer header and length
         */
        if ((s_len < 1) || (s_len !== seq_len - 4 - r_len)) {
            return null;
        }

        /*
         * ASN.1 encoded integers are zero-padded for positive integers. Make sure we have
         * a correctly-sized buffer and that the resulting integer isn't too large.
         */
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (trim_to_32_bytes(der, 4, r_len, sig_r) &&
            trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)) {
            return {r: sig_r, s: sig_s};
        } else {
            return null;
        }
    };

    /**
     *  ECC Public Key
     *
     *      keyInfo format: {
     *          algorithm    : "ECC",
     *          curve        : "secp256k1",
     *          data         : "..." // base64_encode()
     *      }
     */
    var ECCPublicKey = function (key) {
        BasePublicKey.call(this, key);
    };
    Class(ECCPublicKey, BasePublicKey, null, {

        // Override
        getData: function () {
            var pem = this.getValue('data');
            if (!pem || pem.length === 0) {
                throw new ReferenceError('ECC public key data not found');
            } else if (pem.length === 66) {
                // compressed key data
                return ns.format.Hex.decode(pem);
            } else if (pem.length === 130) {
                // uncompressed key data
                return ns.format.Hex.decode(pem);
            } else {
                // ANS.1 or X.509
                var pos1 = pem.indexOf('-----BEGIN PUBLIC KEY-----');
                if (pos1 >= 0) {
                    pos1 += '-----BEGIN PUBLIC KEY-----'.length;
                    var pos2 = pem.indexOf('-----END PUBLIC KEY-----', pos1);
                    if (pos2 > 0) {
                        var base64 = pem.substr(pos1, pos2-pos1);
                        var data = ns.format.Base64.decode(base64);
                        // TODO: parse ASN.1 or X.509
                        return data.subarray(data.length - 65);
                    }
                }
            }
            throw new EvalError('key data error: ' + pem);
        },

        getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size);
            } else {
                return this.getData().length/8;
            }
        },

        // Override
        verify: function (data, signature) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = ecc_der_to_sig(signature, signature.length);
            if (!sig) {
                throw new EvalError('signature error: ' + signature);
            }
            var sig_r = Secp256k1.uint256(sig.r, 16);
            var sig_s = Secp256k1.uint256(sig.s, 16);
            var pub = decode_points(this.getData());
            return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z);
        }
    });

    var decode_points = function (data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16);
            } else {
                // TODO: compressed key?
                throw new EvalError('key data head error: ' + data);
            }
        } else if (data.length === 33) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.decompressKey(x, 0);
            } else {
                // TODO: compressed key?
                throw new EvalError('key data head error: ' + data);
            }
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        return {x: x, y: y};
    };

    //-------- namespace --------
    ns.crypto.ECCPublicKey = ECCPublicKey;

})(DIMP);

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;

    /**
     *  Refs:
     *      https://github.com/kmackay/micro-ecc
     *      https://github.com/digitalbitbox/mcu/blob/master/src/ecc.c
     */
    var ecc_sig_to_der = function (sig_r, sig_s, der) {
        var i;
        var p = 0, len, len1, len2;
        der[p] = 0x30;
        p++; // sequence
        der[p] = 0x00;
        len = p;
        p++; // len(sequence)

        der[p] = 0x02;
        p++; // integer
        der[p] = 0x00;
        len1 = p;
        p++; // len(integer)

        // process R
        i = 0;
        while (sig_r[i] === 0 && i < 32) {
            i++; // skip leading zeroes
        }
        if (sig_r[i] >= 0x80) { // put zero in output if MSB set
            der[p] = 0x00;
            p++;
            der[len1] = der[len1] + 1;
        }
        while (i < 32) { // copy bytes to output
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++;
        }

        der[p] = 0x02;
        p++; // integer
        der[p] = 0x00;
        len2 = p;
        p++; // len(integer)

        // process S
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++; // skip leading zeroes
        }
        if (sig_s[i] >= 0x80) { // put zero in output if MSB set
            der[p] = 0x00;
            p++;
            der[len2] = der[len2] + 1;
        }
        while (i < 32) { // copy bytes to output
            der[p] = sig_s[i];
            p++;
            der[len2] = der[len2] + 1;
            i++;
        }

        der[len] = der[len1] + der[len2] + 4;
        return der[len] + 2;
    };

    /**
     *  ECC Private Key
     *
     *      keyInfo format: {
     *          algorithm    : "ECC",
     *          curve        : "secp256k1",
     *          data         : "..." // base64_encode()
     *      }
     */
    var ECCPrivateKey = function (key) {
        BasePrivateKey.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey;
    };
    Class(ECCPrivateKey, BasePrivateKey, null, {

        // Override
        getData: function () {
            var data = this.getValue('data');
            if (data && data.length > 0) {
                return ns.format.Hex.decode(data);
            } else {
                throw new ReferenceError('ECC private key data not found');
            }
        },

        getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size);
            } else {
                return this.getData().length/8;
            }
        },

        // Override
        getPublicKey: function () {
            var pub = this.__publicKey;
            var data = '04' + pub.x + pub.y;
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': data,
                'curve': 'secp256k1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info);
        },

        // Override
        sign: function (data) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = Secp256k1.ecsign(this.__privateKey, z);
            var sig_r = ns.format.Hex.decode(sig.r);
            var sig_s = ns.format.Hex.decode(sig.s);
            var der = new Uint8Array(72);
            var sig_len = ecc_sig_to_der(sig_r, sig_s, der);
            if (sig_len === der.length) {
                return der;
            } else {
                return der.subarray(0, sig_len);
            }
        }
    });

    var get_key_pair = function () {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            // generate
            sKey = generatePrivateKey.call(this, 256);
        } else if (data.length === 32) {
            // parse from Hex encoded
            sKey = Secp256k1.uint256(data, 16);
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return {privateKey: sKey, publicKey: pKey}
    };
    var generatePrivateKey = function (bits) {
        // create a new private key
        var key = window.crypto.getRandomValues(new Uint8Array(bits/8))
        var hex = ns.format.Hex.encode(key);
        this.setValue('data', hex);
        this.setValue('curve', 'secp256k1');
        this.setValue('digest', 'SHA256');
        return key;
    };

    //-------- namespace --------
    ns.crypto.ECCPrivateKey = ECCPrivateKey;

})(DIMP);
