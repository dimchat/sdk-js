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
//! require 'group/polylogue.js'
//! require 'group/chatroom.js'
//! require 'network/robot.js'
//! require 'network/station.js'
//! require 'network/provider.js'

!function (ns) {
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
    };
    ns.Class(Facebook, Barrack, null);

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
        return meta && doc.verify(meta.key);
    };

    //-------- group membership

    Facebook.prototype.isFounder = function (member, group) {
        // check member's public key with group's meta.key
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            // throw Error('failed to get meta for group: ' + group);
            return false;
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            // throw Error('failed to get meta for member: ' + member);
            return false;
        }
        return gMeta.matches(mMeta.key);
    };

    Facebook.prototype.isOwner = function (member, group) {
        if (NetworkType.POLYLOGUE.equals(group.getType())) {
            return this.isFounder(member, group);
        }
        throw Error('only Polylogue so far');
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
        throw TypeError('Unsupported user type: ' + type);
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
        throw TypeError('Unsupported group type: ' + type);
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

    ns.register('Facebook');

}(DIMP);
