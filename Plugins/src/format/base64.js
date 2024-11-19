;
// license: https://mit-license.org
//
//  MONKEY: Memory Object aNd KEYs
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

//! require <crypto.js>
//! require 'data.js'

(function (ns) {
    'use strict';

    //-------- Base64 algorithm begin --------
    var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i;
        }
    })(base64_chars, base64_values);

    //
    //  (Int8Array)
    //
    // 11111111, 11111111, 11111111
    // 11111111, 11111111, 11111111,  11111111, ........, ........  (append 2 bytes)
    // 11111111, 11111111, 11111111,  11111111, 11111111, ........  (append 1 byte)
    // 11111111, 11111111, 11111111,  11111111, 11111111, 11111111

    //
    //  (Base64)
    //
    // 111111 11,1111 1111,11 111111
    // 111111 11,1111 1111,11 111111  111111 11,.... ....,.. ......  (append ==)
    // 111111 11,1111 1111,11 111111  111111 11,1111 1111,.. ......  (append =)
    // 111111 11,1111 1111,11 111111  111111 11,1111 1111,11 111111

    /**
     *  Encode data array to Base64 string
     *
     * @param {Uint8Array} data
     * @return {String}
     */
    var base64_encode = function (data) {
        var base64 = '';
        var length = data.length;
        var remainder = length % 3;
        length -= remainder;
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i+1];
            x3 = data[i+2];
            // 111111.. ........ ........
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            // ......11 1111.... ........
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            // ........ ....1111 11......
            base64 += base64_chars.charAt(((x2 & 0x0F) << 2) | ((x3 & 0xC0) >> 6));
            // ........ ........ ..111111
            base64 += base64_chars.charAt(x3 & 0x3F);
        }
        // check tail
        if (remainder === 1) {
            x1 = data[i];
            // 111111.. ........ ........
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            // ......11 0000.... ........
            base64 += base64_chars.charAt((x1 & 0x03) << 4);
            // append tail
            base64 += '==';
        } else if (remainder === 2) {
            x1 = data[i];
            x2 = data[i+1];
            // 111111.. ........ ........
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            // ......11 1111.... ........
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            // ........ ....1111 00......
            base64 += base64_chars.charAt((x2 & 0x0F) << 2);
            // append tail
            base64 += '=';
        }
        return base64;
    };

    /**
     *  Decode Base64 string to data array
     *
     * @param {String} string
     * @return {Uint8Array}
     */
    var base64_decode = function (string) {
        // preprocess
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, '');
        var length = str.length;
        if ((length % 4) !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error('base64 string error: ' + string)
        }
        var array = [];
        // parse each 4 chars to 3 bytes
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i+=4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i+1)];
            ch3 = base64_values[str.charCodeAt(i+2)];
            ch4 = base64_values[str.charCodeAt(i+3)];
            // 111111 11.... ...... ......
            array.push(((ch1 & 0x3F) << 2) | ((ch2 & 0x30) >> 4));
            // ...... ..1111 1111.. ......
            array.push(((ch2 & 0x0F) << 4) | ((ch3 & 0x3C) >> 2));
            // ...... ...... ....11 111111
            array.push(((ch3 & 0x03) << 6) | ((ch4 & 0x3F) >> 0));
        }
        // remove tail
        while (str[--i] === '=') {
            array.pop();
        }
        return Uint8Array.from(array);
    };
    //-------- Base64 algorithm end --------

    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;

    //
    //  Base64
    //
    var Base64Coder = function () {
        Object.call(this);
    };
    Class(Base64Coder, Object, [DataCoder], {

        // Override
        encode: function (data) {
            return base64_encode(data);
        },

        // Override
        decode: function (string) {
            return base64_decode(string);
        }
    });

    //-------- namespace --------
    ns.format.Base64.setCoder(new Base64Coder());

})(DIMP);
