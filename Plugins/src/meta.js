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

/**
 *  Default Meta to build ID with 'name@address'
 *
 *  version:
 *      0x01 - MKM
 *
 *  algorithm:
 *      CT      = fingerprint; // or key.data for BTC address
 *      hash    = ripemd160(sha256(CT));
 *      code    = sha256(sha256(network + hash)).prefix(4);
 *      address = base58_encode(network + hash + code);
 *      number  = uint(code);
 */

//! require <crypto.js>
//! require <mkm.js>
//! require 'address.js'

(function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;

    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;

    /**
     *  Create default meta
     *
     *  Usages:
     *      1. new DefaultMeta(map);
     *      2. new DefaultMeta(type, key, seed, fingerprint);
     */
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            // new DefaultMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 4) {
            // new DefaultMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        }
        // memory cache
        this.__addresses = {};  // uint -> Address
    };
    ns.Class(DefaultMeta, BaseMeta, null);

    DefaultMeta.prototype.generateAddress = function (network) {
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        // check cache
        var address = this.__addresses[network];
        if (!address && this.isValid()) {
            // generate and cache it
            address = BTCAddress.generate(this.getFingerprint(), network);
            this.__addresses[network] = address;
        }
        return address;
    };

    //-------- namespace --------
    ns.mkm.DefaultMeta = DefaultMeta;

    ns.mkm.registers('DefaultMeta');

})(MingKeMing);

/**
 *  Meta to build BTC address for ID
 *
 *  version:
 *      0x02 - BTC
 *      0x03 - ExBTC
 *
 *  algorithm:
 *      CT      = key.data;
 *      hash    = ripemd160(sha256(CT));
 *      code    = sha256(sha256(network + hash)).prefix(4);
 *      address = base58_encode(network + hash + code);
 */

(function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;

    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;

    /**
     *  Create meta for BTC address
     *
     *  Usages:
     *      1. new BTCMeta(map);
     *      2. new BTCMeta(type, key, seed, fingerprint);
     */
    var BTCMeta = function () {
        if (arguments.length === 1) {
            // new BTCMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 4) {
            // new BTCMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        }
        // memory cache
        this.__address = null;  // cached address
    };
    ns.Class(BTCMeta, BaseMeta, null);

    BTCMeta.prototype.generateAddress = function (network) {
        // check cache
        if (!this.__address && this.isValid()) {
            // generate and cache it
            var fingerprint = this.getKey().getData();
            this.__address = BTCAddress.generate(fingerprint, NetworkType.BTC_MAIN);
        }
        return this.__address;
    };

    //-------- namespace --------
    ns.mkm.BTCMeta = BTCMeta;

    ns.mkm.registers('BTCMeta');

})(MingKeMing);
