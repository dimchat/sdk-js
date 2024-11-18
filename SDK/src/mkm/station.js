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

    var Class      = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var Converter  = ns.type.Converter;

    var ID      = ns.protocol.ID;
    var Address = ns.protocol.Address;

    var User           = ns.mkm.User;
    var BaseUser       = ns.mkm.BaseUser;
    var DocumentHelper = ns.mkm.DocumentHelper;

    /**
     *  Station for DIM network
     *
     *  Usages:
     *      1. new Station(identifier);
     *      2. new Station(host, port);
     *      3. new Station(identifier, host, port);
     */
    var Station = function () {
        BaseObject.call(this);
        var user;
        var host, port;
        if (arguments.length === 1) {
            // new Station(identifier);
            user = new BaseUser(arguments[0]);
            host = null;
            port = 0;
        } else if (arguments.length === 2) {
            // new Station(host, port);
            user = new BaseUser(Station.ANY);
            host = arguments[0];
            port = arguments[1];
        } else if (arguments.length === 3) {
            user = new BaseUser(arguments[0]);
            host = arguments[1];
            port = arguments[2];
        }
        this.__user = user;
        this.__host = host;
        this.__port = port;
        this.__isp = null;
    };
    Class(Station, BaseObject, [User], {

        // Override
        equals: function (other) {
            if (this === other) {
                return true;
            } else if (!other) {
                return false;
            } else if (other instanceof Station) {
                return ns.mkm.ServiceProvider.sameStation(other, this);
            }
            return this.__user.equals(other);
        },

        // Override
        valueOf: function () {
            return desc.call(this);
        },

        // Override
        toString: function () {
            return desc.call(this);
        },

        //-------- Entity

        // Override
        setDataSource: function (delegate) {
            this.__user.setDataSource(delegate);
        },
        // Override
        getDataSource: function () {
            return this.__user.getDataSource();
        },

        // Override
        getIdentifier: function () {
            return this.__user.getIdentifier();
        },

        // Override
        getType: function () {
            return this.__user.getType();
        },

        // Override
        getMeta: function () {
            return this.__user.getMeta();
        },

        // Override
        getDocuments: function () {
            return this.__user.getDocuments();
        },

        //-------- User

        // Override
        getVisa: function () {
            return this.__user.getVisa();
        },

        // Override
        getContacts: function () {
            return this.__user.getContacts();
        },

        // Override
        verify: function (data, signature) {
            return this.__user.verify(data, signature);
        },

        // Override
        encrypt: function (plaintext) {
            return this.__user.encrypt(plaintext);
        },

        // Override
        sign: function (data) {
            return this.__user.sign(data);
        },

        // Override
        decrypt: function (ciphertext) {
            return this.__user.decrypt(ciphertext);
        },

        // Override
        signVisa: function (doc) {
            return this.__user.signVisa(doc);
        },

        // Override
        verifyVisa: function (doc) {
            return this.__user.verifyVisa(doc);
        },

        //-------- Server

        setIdentifier: function (identifier) {
            var delegate = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(delegate);
            this.__user = user;
        },

        getHost: function () {
            if (!this.__host) {
                this.reload();
            }
            return this.__host;
        },

        getPort: function () {
            if (!this.__port) {
                this.reload();
            }
            return this.__port;
        },

        getProvider: function () {
            if (!this.__isp) {
                this.reload();
            }
            return this.__isp;
        },

        getProfile: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastDocument(docs);
        },

        reload: function () {
            var doc = this.getProfile();
            if (doc) {
                var host = doc.getProperty('host');
                host = Converter.getString(host, null);
                if (host) {
                    this.__host = host;
                }
                var port = doc.getProperty('port');
                port = Converter.getInt(port, 0);
                if (port > 0) {
                    this.__port = port;
                }
                var isp = doc.getProperty('ISP');
                isp = ID.parse(isp);
                if (isp) {
                    this.__isp = isp;
                }
            }
        }
    });

    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.getIdentifier();
        var network = id.getAddress().getType();
        return '<' + clazz + ' id="' + id.toString() + '" network="' + network +
            '" host="' + this.getHost() + '" port=' + this.getPort() + ' />';
    };

    // Station.ANY = ID.create('station', Address.ANYWHERE, null);
    // Station.EVERY = ID.create('stations', Address.EVERYWHERE, null);
    Station.ANY   = new ns.mkm.Identifier('station', Address.ANYWHERE, null);
    Station.EVERY = new ns.mkm.Identifier('stations', Address.EVERYWHERE, null);

    //-------- namespace --------
    ns.mkm.Station = Station;

})(DIMP);
