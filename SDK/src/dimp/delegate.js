;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

//! require <dimp.js>

(function (ns) {
    'use strict';

    /**
     *  Cipher Key Delegate
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var CipherKeyDelegate = function () {};
    ns.Interface(CipherKeyDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get cipher key for encrypt message from 'sender' to 'receiver'
     *
     * @param {ID} from          - sender (user or contact ID)
     * @param {ID} to            - receiver (contact or user/group ID)
     * @param {boolean} generate - generate when key not exists
     * @returns {SymmetricKey}
     */
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        ns.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Cache cipher key for reusing, with the direction (from 'sender' to 'receiver')
     *
     * @param {ID} from          - sender (user or contact ID)
     * @param {ID} to            - receiver (contact or user/group ID)
     * @param {SymmetricKey} key
     */
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        ns.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.CipherKeyDelegate = CipherKeyDelegate;

    ns.registers('CipherKeyDelegate');

})(DIMP);
