;
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
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

//! require <mkm.js>

(function (ns) {
    'use strict';

    var str = ns.type.String;
    var Data = ns.type.Data;

    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;

    var Base58 = ns.format.Base58;

    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;

    /**
     *  Address like BitCoin
     *
     *      data format: "network+digest+code"
     *          network    --  1 byte
     *          digest     -- 20 bytes
     *          code       --  4 bytes
     *
     *      algorithm:
     *          fingerprint = sign(seed, SK);
     *          digest      = ripemd160(sha256(fingerprint));
     *          code        = sha256(sha256(network + digest)).prefix(4);
     *          address     = base58_encode(network + digest + code);
     */
    var BTCAddress = function (string, network) {
        str.call(this, string);
        this.network = network;
    };
    ns.Class(BTCAddress, str, [Address]);

    BTCAddress.prototype.getNetwork = function () {
        return this.network;
    };

    BTCAddress.prototype.isBroadcast = function () {
        return false;
    };
    BTCAddress.prototype.isUser = function () {
        return NetworkType.isUser(this.network);
    };
    BTCAddress.prototype.isGroup = function () {
        return NetworkType.isGroup(this.network);
    };

    /**
     *  Generate address with fingerprint and network ID
     *
     * @param {Uint8Array} fingerprint
     * @param {NetworkType|Number|char|*} network
     * @returns {BTCAddress}
     */
    BTCAddress.generate = function (fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        // 1. digest = ripemd160(sha256(fingerprint))
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        // 2. head = network + digest
        var head = new Data(21);
        head.setByte(0, network);
        head.append(digest);
        // 3. cc = sha256(sha256(head)).prefix(4)
        var cc = check_code(head.getBytes(false));
        // 4. data = base58_encode(head + cc)
        var data = new Data(25);
        data.append(head);
        data.append(cc);
        return new BTCAddress(Base58.encode(data.getBytes(false)), network);
    };

    /**
     *  Parse a string for BTC address
     *
     * @param {String} string - address string
     * @return {BTCAddress} null on error
     */
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26/* || len > 34*/) {
            return null;
        }
        // decode
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw new RangeError('address length error: ' + string);
        }
        // check code
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new BTCAddress(string, data[0]);
        } else {
            return null;
        }
    };

    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4);
    };

    //-------- namespace --------
    ns.BTCAddress = BTCAddress;

    ns.register('BTCAddress');

})(DIMP);
