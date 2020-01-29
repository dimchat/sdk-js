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

//! require <crypto.js>
//! require <mkm.js>
//! require 'address.js'

!function (ns) {
    'use strict';

    var MetaType = ns.protocol.MetaType;
    var Meta = ns.Meta;

    var DefaultAddress = ns.plugins.DefaultAddress;

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
    var DefaultMeta = function (meta) {
        Meta.call(this, meta);
        // memory cache
        this.idMap = {};
    };
    DefaultMeta.inherits(Meta);

    DefaultMeta.prototype.generateIdentifier = function (network) {
        // check cache
        var identifier = this.idMap[network];
        if (!identifier) {
            // generate and cache it
            identifier = Meta.prototype.generateIdentifier.call(this, network);
            if (identifier) {
                this.idMap[network] = identifier;
            }
        }
        return identifier;
    };

    DefaultMeta.prototype.generateAddress = function (network) {
        if (!this.isValid()) {
            throw Error('meta invalid: ' + this);
        }
        // check cache
        var identifier = this.idMap[network];
        if (identifier) {
            return identifier.address;
        }
        // generate
        return DefaultAddress.generate(this.fingerprint, network);
    };

    //-------- register --------
    Meta.register(MetaType.MKM, DefaultMeta);

    //-------- register --------
    ns.plugins.DefaultMeta = DefaultMeta;

}(DIMP);
