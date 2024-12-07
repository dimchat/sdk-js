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

(function (ns) {
    'use strict';

    var Class   = ns.type.Class;
    var Address = ns.protocol.Address;

    /**
     *  Base Address Factory
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var BaseAddressFactory = function () {
        Object.call(this);
        this.__addresses = {};  // string -> Address
    };
    Class(BaseAddressFactory, Object, [Address.Factory], null);

    /**
     * Call it when received 'UIApplicationDidReceiveMemoryWarningNotification',
     * this will remove 50% of cached objects
     *
     * @return number of survivors
     */
    BaseAddressFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__addresses, finger);
        return finger >> 1;
    };

    // Override
    BaseAddressFactory.prototype.generateAddress = function (meta, network) {
        var address = meta.generateAddress(network);
        if (address) {
            this.__addresses[address.toString()] = address;
        }
        return address;
    };

    // Override
    BaseAddressFactory.prototype.parseAddress = function (string) {
        var address = this.__addresses[string];
        if (!address) {
            address = Address.create(string);
            if (address) {
                this.__addresses[string] = address;
            }
        }
        return address;
    };

    /**
     *  Remove 1/2 objects from the dictionary
     *  (Thanos can kill half lives of a world with a snap of the finger)
     *
     * @param {{}} planet
     * @param {Number} finger
     * @returns {Number} number of survivors
     */
    var thanos = ns.mkm.thanos;

    //-------- namespace --------
    ns.mkm.BaseAddressFactory = BaseAddressFactory;

})(DIMP);

(function (ns) {
    'use strict';

    var Class              = ns.type.Class;
    var Address            = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress         = ns.mkm.BTCAddress;
    var ETHAddress         = ns.mkm.ETHAddress;

    /**
     *  General Address Factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var GeneralAddressFactory = function () {
        BaseAddressFactory.call(this);
    };
    Class(GeneralAddressFactory, BaseAddressFactory, null, null);

    // Override
    GeneralAddressFactory.prototype.createAddress = function(address) {
        if (!address) {
            //throw new ReferenceError('address empty');
            return null;
        }
        var len = address.length;
        if (len === 8) {
            // "anywhere"
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE;
            }
        } else if (len === 10) {
            // "everywhere"
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE;
            }
        }
        var res;
        if (26 <= len && len <= 35) {
            res = BTCAddress.parse(address);
        } else if (len === 42) {
            res = ETHAddress.parse(address);
        } else {
            //throw new TypeError('invalid address: ' + address);
            res = null;
        }
        // TODO: other types of address
        return res;
    };

    //-------- namespace --------
    ns.mkm.GeneralAddressFactory = GeneralAddressFactory;

})(DIMP);
