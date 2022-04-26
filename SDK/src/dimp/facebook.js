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
//! require 'mkm/polylogue.js'
//! require 'mkm/chatroom.js'
//! require 'mkm/robot.js'
//! require 'mkm/station.js'
//! require 'mkm/provider.js'

(function (ns) {
    'use strict';

    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.protocol.ID;

    var User = ns.User;
    var Robot = ns.Robot;
    var Station = ns.Station;

    var Group = ns.Group;
    var Polylogue = ns.Polylogue;
    var Chatroom = ns.Chatroom;
    var ServiceProvider = ns.ServiceProvider;

    var Barrack = ns.core.Barrack;

    var Facebook = function() {
        Barrack.call(this);
        // memory caches
        this.__users  = {};  // String -> User
        this.__groups = {};  // String -> Group
    };
    ns.Class(Facebook, Barrack, null);

    /**
     *  Remove 1/2 objects from the dictionary
     *  (Thanos can kill half lives of a world with a snap of the finger)
     *
     * @param {{}} map
     * @param {Number} finger
     * @returns {Number} number of survivors
     */
    var thanos = function (map, finger) {
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; ++i) {
            var p = map[keys[i]];
            if (typeof p === 'function') continue;
            if ((++finger & 1) === 1) {
                // kill it
                delete map[p];
            }
            // let it go
        }
        return finger;
    };

    /**
     *  Call it when received 'UIApplicationDidReceiveMemoryWarningNotification',
     *  this will remove 50% of cached objects
     *
     * @returns {Number}
     */
    Barrack.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__users, finger);
        finger = thanos(this.__groups, finger);
        return finger >> 1;
    };

    //
    //  cache
    //

    var cacheUser = function (user) {
        if (!user.getDataSource()) {
            user.setDataSource(this);
        }
        this.__users[user.getIdentifier().toString()] = user;
        return true;
    };

    var cacheGroup = function (group) {
        if (!group.getDataSource()) {
            group.setDataSource(this);
        }
        this.__groups[group.getIdentifier().toString()] = group;
        return true;
    };

    // noinspection JSUnusedLocalSymbols
    Barrack.prototype.createUser = function (identifier) {
        console.assert(false, 'implement me!');
        return null;
    };

    // noinspection JSUnusedLocalSymbols
    Barrack.prototype.createGroup = function (identifier) {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get all local users (for decrypting received message)
     *
     * @return {User[]} users with private key
     */
    Barrack.prototype.getLocalUsers = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    //-------- EntityDelegate --------

    // @override
    Barrack.prototype.selectLocalUser = function (receiver) {
        var users = this.getLocalUsers();
        if (users == null || users.length === 0) {
            throw new Error("local users should not be empty");
        } else if (receiver.isBroadcast()) {
            // broadcast message can decrypt by anyone, so just return current user
            return users[0];
        }
        var i, user, uid;
        if (receiver.isGroup()) {
            // group message (recipient not designated)
            var members = this.getMembers(receiver);
            if (members == null || members.length === 0) {
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
    };

    // @override
    Barrack.prototype.getUser = function (identifier) {
        // 1. get from user cache
        var user = this.__users[identifier.toString()];
        if (!user) {
            // 2. create user and cache it
            user = this.createUser(identifier);
            if (user) {
                cacheUser.call(this, user);
            }
        }
        return user;
    };

    // @override
    Barrack.prototype.getGroup = function (identifier) {
        // 1. get from group cache
        var group = this.__groups[identifier.toString()];
        if (!group) {
            // 2. create group and cache it
            group = this.createGroup(identifier);
            if (group) {
                cacheGroup.call(this, group);
            }
        }
        return group;
    };

    /**
     *  Get current user (for signing and sending message)
     *
     * @returns {User}
     */
    Facebook.prototype.getCurrentUser = function () {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null;
        }
        return users[0];
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save meta for entity ID (must verify first)
     *
     * @param {Meta} meta
     * @param {ID} identifier
     * @returns {boolean}
     */
    Facebook.prototype.saveMeta = function (meta, identifier) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save profile with entity ID (must verify first)
     *
     * @param {Document} doc
     * @returns {boolean}
     */
    Facebook.prototype.saveDocument = function (doc) {
        console.assert(false, 'implement me!');
        return false;
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save members of group
     *
     * @param {ID[]} members - member ID list
     * @param {ID} identifier - group ID
     * @returns {boolean}
     */
    Facebook.prototype.saveMembers = function (members, identifier) {
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Document checking
     *
     * @param {Document} doc - entity document
     * @return {boolean} true on accepted
     */
    Facebook.prototype.checkDocument = function (doc) {
        var identifier = doc.getIdentifier();
        if (!identifier) {
            return false;
        }
        // NOTICE: if this is a group profile,
        //             verify it with each member's meta.key
        //         else (this is a user profile)
        //             verify it with the user's meta.key
        var meta;
        if (identifier.isGroup()) {
            // check by owner
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (NetworkType.POLYLOGUE.equals(identifier.getType())) {
                    // NOTICE: if this is a polylogue profile
                    //             verify it with the founder's meta.key
                    //             (which equals to the group's meta.key)
                    meta = this.getMeta(identifier);
                } else {
                    // FIXME: owner not found for this group
                    return false;
                }
            } else {
                meta = this.getMeta(owner);
            }
        } else {
            meta = this.getMeta(identifier);
        }
        return meta && doc.verify(meta.getKey());
    };

    //-------- group membership

    Facebook.prototype.isFounder = function (member, group) {
        // check member's public key with group's meta.key
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            // throw new Error('failed to get meta for group: ' + group);
            return false;
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            // throw new Error('failed to get meta for member: ' + member);
            return false;
        }
        return gMeta.matches(mMeta.key);
    };

    Facebook.prototype.isOwner = function (member, group) {
        if (NetworkType.POLYLOGUE.equals(group.getType())) {
            return this.isFounder(member, group);
        }
        throw new Error('only Polylogue so far');
    };

    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            // create user 'anyone@anywhere'
            return new User(identifier);
        }
        // check user type
        var type = identifier.getType();
        if (NetworkType.MAIN.equals(type) || NetworkType.BTC_MAIN.equals(type)) {
            return new User(identifier);
        }
        if (NetworkType.ROBOT.equals(type)) {
            return new Robot(identifier);
        }
        if (NetworkType.STATION.equals(type)) {
            return new Station(identifier);
        }
        throw new TypeError('Unsupported user type: ' + type);
    };

    Facebook.prototype.createGroup = function (identifier) {
        if (identifier.isBroadcast()) {
            // create group 'everyone@everywhere'
            return new Group(identifier);
        }
        // check group type
        var type = identifier.getType();
        if (NetworkType.POLYLOGUE.equals(type)) {
            return new Polylogue(identifier);
        }
        if (NetworkType.CHATROOM.equals(type)) {
            return new Chatroom(identifier);
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return new ServiceProvider(identifier);
        }
        throw new TypeError('Unsupported group type: ' + type);
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

    ns.registers('Facebook');

})(DIMSDK);
