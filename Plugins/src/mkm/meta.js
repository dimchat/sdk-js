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

//! require <mkm.js>
//! require 'btc.js'
//! require 'eth.js'

(function (ns) {
    'use strict';

    var Class      = ns.type.Class;
    var Enum       = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta   = ns.mkm.BaseMeta;

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
        } else {
            throw new SyntaxError('Default meta arguments error: ' + arguments);
        }
        // memory cache
        this.__addresses = {};  // uint -> Address
    };
    Class(DefaultMeta, BaseMeta, null, {

        // Override
        hasSeed: function () {
            return true;
        },

        // Override
        generateAddress: function (network) {
            network = Enum.getInt(network);
            // check cache
            var cached = this.__addresses[network];
            if (!cached) {
                // generate and cache it
                var data = this.getFingerprint();
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached;
            }
            return cached;
        }
    });

    //-------- namespace --------
    ns.mkm.DefaultMeta = DefaultMeta;

})(DIMP);

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

    var Class      = ns.type.Class;
    var Enum       = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta   = ns.mkm.BaseMeta;

    /**
     *  Create meta for BTC address
     *
     *  Usages:
     *      1. new BTCMeta(map);
     *      2. new BTCMeta(type, key);
     *      3. new BTCMeta(type, key, seed, fingerprint);
     */
    var BTCMeta = function () {
        if (arguments.length === 1) {
            // new BTCMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 2) {
            // new BTCMeta(type, key);
            BaseMeta.call(this, arguments[0], arguments[1]);
        } else if (arguments.length === 4) {
            // new BTCMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        } else {
            throw new SyntaxError('BTC meta arguments error: ' + arguments);
        }
        // memory cache
        this.__addresses = {};  // uint -> Address
    };
    Class(BTCMeta, BaseMeta, null, {

        // Override
        hasSeed: function () {
            return false;
        },

        // Override
        generateAddress: function (network) {
            network = Enum.getInt(network);
            // check cache
            var cached = this.__addresses[network];
            if (!cached) {
                // TODO: compress public key?
                var key = this.getPublicKey();
                var data = key.getData();
                // generate and cache it
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached;
            }
            return cached;
        }
    });

    //-------- namespace --------
    ns.mkm.BTCMeta = BTCMeta;

})(DIMP);

/**
 *  Meta to build ETH address for ID
 *
 *  version:
 *      0x04 - ETH
 *      0x05 - ExETH
 *
 *  algorithm:
 *      CT      = key.data;  // without prefix byte
 *      digest  = keccak256(CT);
 *      address = hex_encode(digest.suffix(20));
 */

(function (ns) {
    'use strict';

    var Class      = ns.type.Class;
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta   = ns.mkm.BaseMeta;

    /**
     *  Create meta for ETH address
     *
     *  Usages:
     *      1. new ETHMeta(map);
     *      2. new BTCMeta(type, key);
     *      3. new BTCMeta(type, key, seed, fingerprint);
     */
    var ETHMeta = function () {
        if (arguments.length === 1) {
            // new ETHMeta(map);
            BaseMeta.call(this, arguments[0]);
        } else if (arguments.length === 2) {
            // new ETHMeta(type, key);
            BaseMeta.call(this, arguments[0], arguments[1]);
        } else if (arguments.length === 4) {
            // new ETHMeta(type, key, seed, fingerprint);
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3]);
        } else {
            throw new SyntaxError('ETH meta arguments error: ' + arguments);
        }
        // memory cache
        this.__address = null;  // cached address
    };
    Class(ETHMeta, BaseMeta, null, {

        // Override
        hasSeed: function () {
            return false;
        },

        // Override
        generateAddress: function (network) {
            // check cache
            var cached = this.__address;
            if (!cached/* || cached.getType() !== network*/) {
                // 64 bytes key data without prefix 0x04
                var key = this.getPublicKey();
                var data = key.getData();
                // generate and cache it
                cached = ETHAddress.generate(data);
                this.__address = cached;
            }
            return cached;
        }
    });

    //-------- namespace --------
    ns.mkm.ETHMeta = ETHMeta;

})(DIMP);

(function (ns) {
    'use strict';

    var Class             = ns.type.Class;
    var UTF8              = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var Meta              = ns.protocol.Meta;
    var DefaultMeta       = ns.mkm.DefaultMeta;
    var BTCMeta           = ns.mkm.BTCMeta;
    var ETHMeta           = ns.mkm.ETHMeta;

    /**
     *  General Meta factory
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var GeneralMetaFactory = function (algorithm) {
        Object.call(this);
        this.__type = algorithm;
    };
    Class(GeneralMetaFactory, Object, [Meta.Factory], null);

    // protected
    GeneralMetaFactory.prototype.getType = function () {
        return this.__type;
    };

    // Override
    GeneralMetaFactory.prototype.generateMeta = function(sKey, seed) {
        var fingerprint = null;  // TransportableData
        if (seed && seed.length > 0) {
            var sig = sKey.sign(UTF8.encode(seed));
            fingerprint = TransportableData.create(sig);
        }
        var pKey = sKey.getPublicKey();
        return this.createMeta(pKey, seed, fingerprint);
    };

    // Override
    GeneralMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        var out;
        var type = this.getType();
        if (type === Meta.MKM) {
            // MKM
            out = new DefaultMeta(type, key, seed, fingerprint);
        } else if (type === Meta.BTC) {
            // BTC
            out = new BTCMeta(type, key);
        } else if (type === Meta.ETH) {
            // ETH
            out = new ETHMeta(type, key);
        } else {
            // unknown type
            throw new TypeError('unknown meta type: ' + type);
        }
        return out;
    };

    // Override
    GeneralMetaFactory.prototype.parseMeta = function(meta) {
        var out;
        var gf = general_factory();
        var type = gf.getMetaType(meta, '');
        if (type === Meta.MKM) {
            // MKM
            out = new DefaultMeta(meta);
        } else if (type === Meta.BTC) {
            // BTC
            out = new BTCMeta(meta);
        } else if (type === Meta.ETH) {
            // ETH
            out = new ETHMeta(meta);
        } else {
            // unknown type
            throw new TypeError('unknown meta type: ' + type);
        }
        return out.isValid() ? out : null;
    };

    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory;
    };

    //-------- namespace --------
    ns.mkm.GeneralMetaFactory = GeneralMetaFactory;

})(DIMP);
