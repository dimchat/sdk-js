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

(function (ns) {
    "use strict";

    var CachePool = ns.CachePool;

    var MemoryCache = function () {
        this.__packages = [];
        this.__occupied = 0;
    };
    DIMP.Class(MemoryCache, null, [CachePool]);

    MemoryCache.prototype.push = function (data) {
        this.__packages.push(data);
        this.__occupied += data.length;
    };

    MemoryCache.prototype.shift = function (maxLength) {
        var data = this.__packages.shift();
        if (data.length > maxLength) {
            // push the remaining data back to the queue head
            this.__packages.unshift(data.subarray(maxLength));
            // cut the remaining data
            data = data.subarray(0, maxLength);
        }
        this.__occupied -= data.length;
        return data;
    };

    /**
     *  Get all received data (not remove)
     *
     * @return {Uint8Array} received data, null on cache pool empty
     */
    MemoryCache.prototype.all = function () {
        var size = 0;
        var i, item;
        for (i = 0; i < this.__packages.length; ++i) {
            size += this.__packages[i].length;
        }
        var data = new Uint8Array(size);
        var offset = 0;
        for (i = 0; i < this.__packages.length; ++i) {
            item = this.__packages[i];
            data.set(item, offset);
            offset += item.length;
        }
        return data;
    };

    /**
     *  Get length of cached bytes
     *
     * @return {uint} bytes count
     */
    MemoryCache.prototype.length = function () {
        return this.__occupied;
    };

    //-------- namespace --------
    ns.MemoryCache = MemoryCache;

    ns.register('MemoryCache');

})(StarTrek);
