'use strict';
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

//! require 'group.js'

    /**
     *  DIM Station Owner
     *  ~~~~~~~~~~~~~~~~~
     */
    mkm.mkm.ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    var ServiceProvider = mkm.mkm.ServiceProvider;

    Class(ServiceProvider, BaseGroup, null, {

        // Provider Document
        getProfile: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastDocument(docs, '*');
        },

        getStations: function () {
            var doc = this.getProfile();
            if (doc) {
                var stations = doc.getProperty('stations');
                if (stations instanceof Array) {
                    return stations;
                }
            }
            // TODO: load from local storage
            return [];
        }
    });

    //
    //  Comparison
    //

    ServiceProvider.sameStation = function (a, b) {
        if (a === b) {
            // same object
            return true;
        }
        return checkIdentifiers(a.getIdentifier(), b.getIdentifier())
            && checkHosts(a.getHost(), b.getHost())
            && checkPorts(a.getPort(), b.getPort());
    };

    var checkIdentifiers = function (a, b) {
        if (a === b) {
            // same object
            return true;
        } else if (a.isBroadcast() || b.isBroadcast()) {
            return true;
        }
        return a.equals(b);
    };

    var checkHosts = function (a, b) {
        if (!a || !b) {
            return true;
        }
        return a === b;
    };

    var checkPorts = function (a, b) {
        if (!a || !b) {
            return true;
        }
        return a === b;
    };
