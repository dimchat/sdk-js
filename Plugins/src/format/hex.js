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

//! require 'coder.js'

(function (ns) {
    'use strict';

    //-------- HEX algorithm begin --------
    var hex_chars = '0123456789abcdef';
    var hex_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i;
        }
        values['A'.charCodeAt(0)] = 0x0A;
        values['B'.charCodeAt(0)] = 0x0B;
        values['C'.charCodeAt(0)] = 0x0C;
        values['D'.charCodeAt(0)] = 0x0D;
        values['E'.charCodeAt(0)] = 0x0E;
        values['F'.charCodeAt(0)] = 0x0F;
    })(hex_chars, hex_values);

    /**
     *  Encode data array to HEX string
     *
     * @param {Uint8Array} data
     * @return {String}
     */
    var hex_encode = function (data) {
        var len = data.length;
        var str = '';
        var byt;
        for (var i = 0; i < len; ++i) {
            byt = data[i];
            str += hex_chars[byt >> 4];   // hi
            str += hex_chars[byt & 0x0F]; // lo
        }
        return str;
    };

    /**
     *  Decode HEX string to data array
     *
     * @param {String} string
     * @return {Uint8Array}
     */
    var hex_decode = function (string) {
        // TODO: check Hex format?
        var len = string.length;
        if (len > 2) {
            // check Hex header: '0x'
            if (string[0] === '0') {
                if (string[1] === 'x' || string[1] === 'X') {
                    // skip '0x'
                    string = string.substring(2);
                    len -= 2;
                }
            }
        }
        if (len % 2 === 1) {
            // byte alignment
            string = '0' + string;
            len += 1;
        }
        var cnt = len >> 1;
        var hi, lo;
        var data = new Uint8Array(cnt);
        for (var i = 0, j = 0; i < cnt; ++i, j += 2) {
            hi = hex_values[string.charCodeAt(j)];
            lo = hex_values[string.charCodeAt(j+1)];
            data[i] = (hi << 4) | lo;
        }
        return data;
    };
    //-------- HEX algorithm end --------

    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;

    var HexCoder = function () {
        Object.call(this);
    };
    Class(HexCoder, Object, [DataCoder], {

        // Override
        encode: function (data) {
            return hex_encode(data);
        },

        // Override
        decode: function (string) {
            return hex_decode(string);
        }
    });

    //-------- namespace --------
    ns.format.Hex.setCoder(new HexCoder());

})(DIMP);
