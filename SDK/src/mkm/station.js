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

    var BaseUser = ns.mkm.BaseUser;

    /**
     *  Station for DIM network
     */
    var Station = function (identifier, host, port) {
        BaseUser.call(this, identifier);
        this.host = host;
        this.port = port;
    };
    ns.Class(Station, BaseUser, null);

    Station.prototype.getHost = function () {
        if (!this.host) {
            var doc = this.getDocument('*');
            if (doc) {
                this.host = doc.getProperty('host');
            }
            if (!this.host) {
                this.host = '0.0.0.0';
            }
        }
        return this.host;
    };

    Station.prototype.getPort = function () {
        if (!this.port) {
            var doc = this.getDocument('*');
            if (doc) {
                this.port = doc.getProperty('port');
            }
            if (!this.port) {
                this.port = 9394;
            }
        }
        return this.port;
    };

    //-------- namespace --------
    ns.mkm.Station = Station;

    ns.mkm.registers('Station');

})(DIMSDK);
