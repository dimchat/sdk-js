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

//! require 'namespace.js'

    /**
     *  Entity Database
     *  ~~~~~~~~~~~~~~~
     *  Entity pool to manage User/Group instances
     */
    sdk.core.Barrack = function () {
        BaseObject.call(this);
    };
    var Barrack = sdk.core.Barrack;

    Class(Barrack, BaseObject, null, null);

    Barrack.prototype.cacheUser = function (user) {};

    Barrack.prototype.cacheGroup = function (group) {};

    Barrack.prototype.getUser = function (identifier) {};

    Barrack.prototype.getGroup = function (identifier) {};

    /**
     *  Create user when visa.key exists
     *
     * @param {mkm.protocol.ID} identifier
     * @return {*}
     */
    Barrack.prototype.createUser = function (identifier) {
        var network = identifier.getType();
        // check user type
        if (EntityType.STATION.equals(network)) {
            return new Station(identifier);
        } else if (EntityType.BOT.equals(network)) {
            return new Bot(identifier);
        }
        // general user, or 'anyone@anywhere'
        return new BaseUser(identifier);
    };

    Barrack.prototype.createGroup = function (identifier) {
        var network = identifier.getType();
        // check group type
        if (EntityType.ISP.equals(network)) {
            return new ServiceProvider(identifier);
        }
        // general group, or 'everyone@everywhere'
        return new BaseGroup(identifier);
    };


    sdk.core.Archivist = Interface(null, null);
    var Archivist = sdk.core.Archivist;

    /**
     *  Save meta for entity ID (must verify first)
     *
     * @param {Meta} meta
     * @param {ID} identifier
     * @return {boolean} true on success
     */
    Archivist.prototype.saveMeta = function (meta, identifier) {};

    /**
     *  Save entity document with ID (must verify first)
     *
     * @param {Document} doc
     * @return {boolean} true on success
     */
    Archivist.prototype.saveDocument = function (doc) {};

    //
    //  Public Keys
    //

    /**
     *  Get meta.key
     *
     * @param {ID} identifier
     * @return {VerifyKey}
     */
    Archivist.prototype.getMetaKey = function (identifier) {};

    /**
     *  Get visa.key
     *
     * @param {ID} identifier
     * @return {EncryptKey}
     */
    Archivist.prototype.getVisaKey = function (identifier) {};

    //
    //  Local Users
    //

    /**
     *  Get all local users (for decrypting received message)
     *
     * @return {ID[]} users with private key
     */
    Archivist.prototype.getLocalUsers = function () {};
