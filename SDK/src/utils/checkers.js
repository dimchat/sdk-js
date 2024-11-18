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

//! require 'namespace.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;

    /**
     *  Frequency checker for duplicated queries
     */
    var FrequencyChecker = function (lifeSpan) {
        this.__expires = lifeSpan;  // seconds
        this.__records = {};  // ID => seconds (timestamp)
    };
    Class(FrequencyChecker, null, null, null);

    // private
    FrequencyChecker.prototype.forceExpired = function (key, now) {
        // if (now instanceof Date) {
        //     now = now.getTime();
        // }
        this.__records[key] = now + this.__expires;
        return true;
    };

    // private
    FrequencyChecker.prototype.checkExpired = function (key, now) {
        // if (now instanceof Date) {
        //     now = now.getTime();
        // }
        var expired = this.__records[key];
        if (expired && expired > now) {
            // record exists and not expired yet
            return false;
        }
        this.__records[key] = now + this.__expires;
        return true;
    };

    FrequencyChecker.prototype.isExpired = function (key, now, force) {
        if (!now) {
            now = new Date();
            now = now.getTime();
        } else if (now instanceof Date) {
            now = now.getTime();
        }
        // if force == true:
        //     ignore last updated time, force to update now
        // else:
        //     check last update time
        if (force) {
            return this.forceExpired(key, now);
        } else {
            return this.checkExpired(key, now);
        }
    };

    /**
     *  Recent time checker for querying
     */
    var RecentTimeChecker = function () {
        this.__times = {};  // ID => seconds (timestamp)
    };
    Class(RecentTimeChecker, null, null, null);

    // private
    RecentTimeChecker.prototype.setLastTime = function (key, when) {
        if (!when) {
            return false;
        } else if (when instanceof Date) {
            when = when.getTime();
        }
        var last = this.__times[key];
        if (!last || last < when) {
            this.__times[key] = when;
            return true;
        } else {
            return false;
        }
    };

    RecentTimeChecker.prototype.isExpired = function (key, now) {
        if (!now) {
            return true;
        } else if (now instanceof Date) {
            now = now.getTime();
        }
        var last = this.__times[key];
        return last && last > now;
    };

    //-------- namespace --------
    ns.utils.FrequencyChecker = FrequencyChecker;
    ns.utils.RecentTimeChecker = RecentTimeChecker;

})(DIMP);
