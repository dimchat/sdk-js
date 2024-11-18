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

//! require 'mkm/robot.js'
//! require 'mkm/station.js'
//! require 'mkm/provider.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseUser = ns.mkm.BaseUser;
    var BaseGroup = ns.mkm.BaseGroup;
    var Bot = ns.mkm.Bot;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;

    var Barrack = ns.Barrack;

    var Facebook = function() {
        Barrack.call(this);
    };
    Class(Facebook, Barrack, null, {

        getArchivist: function () {
            throw Error('Facebook::getArchivist');
        },

        // Override
        createUser: function (identifier) {
            // check visa key
            if (!identifier.isBroadcast()) {
                var pKey = this.getPublicKeyForEncryption(identifier);
                if (!pKey) {
                    // visa.key not found
                    return null;
                }
                // NOTICE: if visa.key exists, then visa & meta must exist too.
            }
            var network = identifier.getType();
            // check user type
            if (EntityType.STATION.equals(network)) {
                return new Station(identifier);
            } else if (EntityType.BOT.equals(network)) {
                return new Bot(identifier);
            }
            // general user, or 'anyone@anywhere'
            return new BaseUser(identifier);
        },

        // Override
        createGroup: function (identifier) {
            // check members
            if (!identifier.isBroadcast()) {
                var members = this.getMembers(identifier);
                if (!members || members.length === 0) {
                    // group members not found
                    return null;
                }
                // NOTICE: if members exist, then owner (founder) must exist,
                //         and bulletin & meta must exist too.
            }
            var network = identifier.getType();
            // check group type
            if (EntityType.ISP.equals(network)) {
                return new ServiceProvider(identifier);
            }
            // general group, or 'everyone@everywhere'
            return new BaseGroup(identifier);
        },

        /**
         *  Get all local users (for decrypting received message)
         *
         * @return {User[]} users with private key
         */
        getLocalUsers: function () {
            throw new Error('Facebook::getLocalUsers');
        },

        // Override
        selectLocalUser: function (receiver) {
            var users = this.getLocalUsers();
            if (!users || users.length === 0) {
                throw new Error("local users should not be empty");
            } else if (receiver.isBroadcast()) {
                // broadcast message can decrypt by anyone, so just return current user
                return users[0];
            }
            var i, user, uid;
            if (receiver.isGroup()) {
                // group message (recipient not designated)
                var members = this.getMembers(receiver);
                if (!members || members.length === 0) {
                    // TODO: group not ready, waiting for group info
                    return null;
                }
                var j, member;
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    for (j = 0; j < members.length; ++j) {
                        member = members[j];
                        if (member.equals(uid)) {
                            // DISCUSS: set this item to be current user?
                            return user;
                        }
                    }
                }
            } else {
                // 1. personal message
                // 2. split group message
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    if (receiver.equals(uid)) {
                        // DISCUSS: set this item to be current user?
                        return user;
                    }
                }
            }
            return null;
        },

        /**
         *  Save meta for entity ID (must verify first)
         *
         * @param {Meta} meta
         * @param {ID} identifier
         * @returns {boolean}
         */
        saveMeta: function (meta, identifier) {
            if (meta.isValid() && meta.matchIdentifier(identifier)) {
                // meta ok
            } else {
                // meta not valid
                return false;
            }
            // check old meta
            var old = this.getMeta(identifier);
            if (old) {
                return true;
            }
            // meta not exists yet, save it
            var archivist = this.getArchivist();
            return archivist.saveMeta(meta, identifier);
        },

        /**
         *  Save profile with entity ID (must verify first)
         *
         * @param {Document|TAI} doc
         * @returns {boolean}
         */
        saveDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                // document error
                return false;
            }
            if (!doc.isValid()) {
                // try to verify
                var meta = this.getMeta(identifier);
                if (!meta) {
                    // ERROR: meta not found
                    return false;
                } else if (doc.verify(meta.getPublicKey())) {
                    // document ok
                } else {
                    // failed to verify document
                    return false;
                }
            }
            var type = doc.getType();
            if (!type) {
                type = '*';
            }
            // check old documents with type
            var documents = this.getDocuments(identifier);
            var old = DocumentHelper.lastDocument(documents, type);
            if (old && DocumentHelper.isExpired(doc, old)) {
                // drop expired document
                return false;
            }
            var archivist = this.getArchivist();
            return archivist.saveDocument(doc);
        },

        // Override
        getMeta: function (identifier) {
            // if (identifier.isBroadcast()) {
            //     // broadcast ID has no meta
            //     return null;
            // }
            var archivist = this.getArchivist();
            var meta = archivist.getMeta(identifier);
            archivist.checkMeta(identifier, meta);
            return meta;
        },

        // Override
        getDocuments: function (identifier) {
            // if (identifier.isBroadcast()) {
            //     // broadcast ID has no documents
            //     return null;
            // }
            var archivist = this.getArchivist();
            var docs = archivist.getDocuments(identifier);
            archivist.checkDocuments(identifier, docs);
            return docs;
        }
    });

    //-------- namespace --------
    ns.Facebook = Facebook;

})(DIMP);
