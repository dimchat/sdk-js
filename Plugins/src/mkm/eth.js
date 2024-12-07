;
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
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

//! require <mkm.js>

(function (ns) {
    'use strict';

    var Class          = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType     = ns.protocol.EntityType;
    var Address        = ns.protocol.Address;

    /**
     *  Address like Ethereum
     *
     *      data format: "0x{address}"
     *
     *      algorithm:
     *          fingerprint = PK.data;
     *          digest      = keccak256(fingerprint);
     *          address     = hex_encode(digest.suffix(20));
     */
    var ETHAddress = function (string) {
        ConstantString.call(this, string);
    };
    Class(ETHAddress, ConstantString, [Address], null);

    // Override
    ETHAddress.prototype.getType = function () {
        return EntityType.USER.getValue();
    };

    ETHAddress.getValidateAddress = function (address) {
        if (!is_eth(address)) {
            // not an ETH address
            return null;
        }
        var lower = address.substr(2).toLowerCase();
        return '0x' + eip55(lower);
    };
    ETHAddress.isValidate = function (address) {
        return address === this.getValidateAddress(address);
    };

    /**
     *  Generate ETH address with key.data
     *
     * @param fingerprint = key.data
     * @return Address object
     */
    ETHAddress.generate = function (fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1);
        } else if (fingerprint.length !== 64) {
            throw new TypeError('ECC key data error: ' + fingerprint);
        }
        // 1. digest = keccak256(fingerprint);
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        // 2. address = hex_encode(digest.suffix(20));
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress('0x' + eip55(address));
    };

    /**
     *  Parse a string for ETH address
     *
     * @param address - address string
     * @return null on error
     */
    ETHAddress.parse = function (address) {
        if (!is_eth(address)) {
            // not an ETH address
            return null;
        }
        return new ETHAddress(address);
    };

    // https://eips.ethereum.org/EIPS/eip-55
    var eip55 = function (hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = '9'.charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                // check for each 4 bits in the hash table
                // if the first bit is '1',
                //     change the character to uppercase
                ch -= (hash[i >> 1] << (i << 2 & 4) & 0x80) >> 2;
            }
            sb[i] = ch;
        }
        return ns.format.UTF8.decode(sb);
    };

    var is_eth = function (address) {
        if (address.length !== 42) {
            return false;
        } else if (address.charAt(0) !== '0' || address.charAt(1) !== 'x') {
            return false;
        }
        var _0 = '0'.charCodeAt(0);
        var _9 = '9'.charCodeAt(0);
        var _A = 'A'.charCodeAt(0);
        var _Z = 'Z'.charCodeAt(0);
        var _a = 'a'.charCodeAt(0);
        var _z = 'z'.charCodeAt(0);
        var ch;
        for (var i = 2; i < 42; ++i) {
            ch = address.charCodeAt(i);
            if (ch >= _0 && ch <= _9) {
                continue;
            }
            if (ch >= _A && ch <= _Z) {
                continue;
            }
            if (ch >= _a && ch <= _z) {
                continue;
            }
            // unexpected character
            return false;
        }
        return true;
    };

    //-------- namespace --------
    ns.mkm.ETHAddress = ETHAddress;

})(DIMP);
