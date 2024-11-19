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

    //
    //  Patch for String.repeat()
    //
    var repeat = function (count) {
        var string = '';
        for (var i = 0; i < count; ++i) {
            string += this;
        }
        return string;
    };
    if (typeof String.prototype.repeat !== 'function') {
        String.prototype.repeat = repeat;
    }

    //-------- Base algorithm begin --------
    //
    //  See: https://github.com/cryptocoinjs/base-x
    //

    function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
            throw new TypeError("Alphabet too long")
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255
        }
        for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);
            if (BASE_MAP[xc] !== 255) {
                throw new TypeError(x + " is ambiguous")
            }
            BASE_MAP[xc] = i
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);

        function encode(source) {
            if (source.length === 0) {
                return ""
            }
            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;
            while (pbegin !== pend && source[pbegin] === 0) {
                pbegin++;
                zeroes++
            }
            var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
            var b58 = new Uint8Array(size);
            while (pbegin !== pend) {
                var carry = source[pbegin];
                var i = 0;
                for (var it1 = size - 1;
                     (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                    carry += (256 * b58[it1]) >>> 0;
                    b58[it1] = (carry % BASE) >>> 0;
                    carry = (carry / BASE) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                pbegin++
            }
            var it2 = size - length;
            while (it2 !== size && b58[it2] === 0) {
                it2++
            }
            var str = repeat.call(LEADER, zeroes);
            for (; it2 < size; ++it2) {
                str += ALPHABET.charAt(b58[it2])
            }
            return str
        }

        function decodeUnsafe(source) {
            if (typeof source !== "string") {
                throw new TypeError("Expected String")
            }
            if (source.length === 0) {
                return []
            }
            var psz = 0;
            if (source[psz] === " ") {
                return
            }
            var zeroes = 0;
            var length = 0;
            while (source[psz] === LEADER) {
                zeroes++;
                psz++
            }
            var size = (((source.length - psz) * FACTOR) + 1) >>> 0;
            var b256 = new Uint8Array(size);
            while (source[psz]) {
                var carry = BASE_MAP[source.charCodeAt(psz)];
                if (carry === 255) {
                    return
                }
                var i = 0;
                for (var it3 = size - 1;
                     (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                    carry += (BASE * b256[it3]) >>> 0;
                    b256[it3] = (carry % 256) >>> 0;
                    carry = (carry / 256) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                psz++
            }
            if (source[psz] === " ") {
                return
            }
            var it4 = size - length;
            while (it4 !== size && b256[it4] === 0) {
                it4++
            }
            var vch = [];
            var j = 0;
            for (; j < zeroes; ++j) {
                vch[j] = 0;
            }
            while (it4 !== size) {
                vch[j++] = b256[it4++]
            }
            return vch
        }

        function decode(string) {
            var buffer = decodeUnsafe(string);
            if (buffer) {
                return new Uint8Array(buffer);
            }
            throw new Error("Non-base" + BASE + " character")
        }
        return {
            encode: encode,
            decodeUnsafe: decodeUnsafe,
            decode: decode
        }
    }
    var bs58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

    //-------- Base algorithm end --------

    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;

    //
    //  Base58
    //
    var Base58Coder = function () {
        Object.call(this);
    };
    Class(Base58Coder, Object, [DataCoder], {

        // Override
        encode: function (data) {
            return bs58.encode(data);
        },

        // Override
        decode: function (string) {
            return bs58.decode(string);
        }
    });

    //-------- namespace --------
    ns.format.Base58.setCoder(new Base58Coder());

})(DIMP);
