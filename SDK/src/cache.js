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

!function (ns) {
    'use strict';

    var KeyCache = ns.KeyCache;

    var KeyStore = function() {
        KeyCache.call(this);
        // current user
        this.user = null;
    };
    KeyStore.inherits(KeyCache);

    KeyStore.prototype.getUser = function () {
        return this.user;
    };
    KeyStore.prototype.setUser = function (user) {
        if (this.user) {
            // save key map for old user
            this.flush();
            if (this.user.equals(user)) {
                // user not changed
                return;
            }
        }
        if (!user) {
            this.user = null;
            return;
        }
        // change current user
        this.user = user;
        var keys = this.loadKeys();
        if (keys) {
            this.updateKeys(keys);
        }
    };

    KeyStore.prototype.saveKeys = function(map) {
        console.assert(map !== null, "map empty");
        // do nothing
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        // do nothing
        return null
    };

    //-------- namespace --------
    ns.KeyStore = KeyStore;

}(DIMP);