;
// license: https://mit-license.org
//
//  Web Socket
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

/**
 *  Memory cache for received data
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var CachePool = function () {
    };
    sys.Interface(CachePool, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Add received data to cache
     *
     * @param {Uint8Array} data - received data
     */
    CachePool.prototype.push = function (data) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Get received data from pool with max length (remove)
     *  (must call 'get()/length()' to check data length first)
     *
     * @param {uint} maxLength - max data length to remove
     * @return {Uint8Array} remove data from the pool and return it
     */
    CachePool.prototype.shift = function (maxLength) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get all received data (not remove)
     *
     * @return {Uint8Array} received data, null on cache pool empty
     */
    CachePool.prototype.all = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get length of cached bytes
     *
     * @return {uint} bytes count
     */
    CachePool.prototype.length = function () {
        console.assert(false, 'implement me!');
        return 0;
    };

    //-------- namespace --------
    ns.CachePool = CachePool;

    ns.registers('CachePool');

})(StarGate, MONKEY);
