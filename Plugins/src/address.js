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

!function (ns) {
    'use strict';

    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;

    var Base58 = ns.format.Base58;

    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.Address;

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
    var DefaultAddress = function (string) {
        Address.call(this, string);
        // decode
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw RangeError('address length error: ' + string);
        }
        // check code
        var prefix = []; // size: 21
        var suffix = []; // size: 4
        var i;
        for (i = 0; i < 21; ++i) {
            prefix.push(data[i]);
        }
        for (i = 21; i < 25; ++i) {
            suffix.push(data[i]);
        }
        var cc = check_code(prefix);
        if (!ns.type.Arrays.equals(cc, suffix)) {
            throw Error('address check code error: ' + string);
        }
        this.network = new NetworkType(data[0]);
        this.code = search_number(cc);
    };
    DefaultAddress.inherits(Address);

    DefaultAddress.prototype.getNetwork = function () {
        return this.network;
    };

    DefaultAddress.prototype.getCode = function () {
        return this.code;
    };

    /**
     *  Generate address with fingerprint and network ID
     *
     * @param fingerprint
     * @param network
     * @returns {DefaultAddress}
     */
    DefaultAddress.generate = function (fingerprint, network) {
        // 1. digest = ripemd160(sha256(fingerprint))
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        // 2. head = network + digest
        var head = []; // size: 21
        head.push(network.value);
        var i;
        for (i = 0; i < 20; ++i) {
            head.push(digest[i]);
        }
        // 3. cc = sha256(sha256(head)).prefix(4)
        var cc = check_code(head);
        // 4. data = base58_encode(head + cc)
        var data = []; // size: 25
        for (i = 0; i < 21; ++i) {
            data.push(head[i]);
        }
        for (i = 0; i < 4; ++i) {
            data.push(cc[i]);
        }
        return new DefaultAddress(Base58.encode(data));
    };

    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        var cc = []; // size: 4
        var i;
        for (i = 0; i < 4; ++i) {
            cc.push(sha256d[i]);
        }
        return cc;
    };

    var search_number = function (cc) {
        // return (cc[0] & 0xFF)
        //     | ((cc[1] & 0xFF) << 8)
        //     | ((cc[2] & 0xFF) << 16)
        //     | ((cc[3] & 0xFF) << 24);
        return (cc[0] | cc[1] << 8 | cc[2] << 16)
            + cc[3] * 0x1000000;
    };

    //-------- register --------
    Address.register(DefaultAddress);

    //-------- namespace --------
    ns.plugins.DefaultAddress = DefaultAddress;

    // ns.plugins.register('DefaultAddress');

}(DIMP);
