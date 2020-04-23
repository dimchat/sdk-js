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

    var ID = ns.ID;
    var Profile = ns.Profile;

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

    //
    //  Meta
    //
    Facebook.prototype.verifyMeta = function (meta, identifier) {
        return meta.matches(identifier);
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

    //
    //  Profile
    //
    Facebook.prototype.verifyProfile = function (profile, identifier) {
        if (identifier) {
            if (!profile || !identifier.equals(profile.getIdentifier())) {
                // profile ID not match
                return false;
            }
        } else {
            identifier = profile.getIdentifier();
            identifier = this.getIdentifier(identifier);
            if (!identifier) {
                throw Error('profile ID error: ' + profile);
            }
        }
        // NOTICE: if this is a group profile,
        //             verify it with each member's meta.key
        //         else (this is a user profile)
        //             verify it with the user's meta.key
        var meta;
        if (identifier.isGroup()) {
            // check by each member
            var members = this.getMembers(identifier);
            if (members) {
                var id;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (!meta) {
                        // FIXME: meta not found for this member
                        continue;
                    }
                    if (profile.verify(meta.key)) {
                        return true;
                    }
                }
            }
            // DISCUSS: what to do about assistants?

            // check by owner
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (NetworkType.Polylogue.equals(identifier.getType())) {
                    // NOTICE: if this is a polylogue profile
                    //             verify it with the founder's meta.key
                    //             (which equals to the group's meta.key)
                    meta = this.getMeta(identifier);
                } else {
                    // FIXME: owner not found for this group
                    return false;
                }
            } else if (members && members.indexOf(owner) >= 0) {
                // already checked
                return false;
            } else {
                meta = this.getMeta(owner);
            }
        } else {
            meta = this.getMeta(identifier);
        }
        return meta && profile.verify(meta.key);
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Save profile with entity ID (must verify first)
     *
     * @param {Profile} profile
     * @param {ID} identifier
     * @returns {boolean}
     */
    Facebook.prototype.saveProfile = function (profile, identifier) {
        console.assert(false, 'implement me!');
        return false;
    };

    //
    //  Group members
    //

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

    //
    //  Local Users
    //

    /**
     *  Get all local users (for decrypting received message)
     *
     * @returns {User[]}
     */
    Facebook.prototype.getLocalUsers = function () {
        console.assert(false, 'implement me!');
        return null;
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

    //
    //  Override
    //

    Facebook.prototype.createIdentifier = function (string) {
        return ID.getInstance(string);
    };

    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            // create user 'anyone@anywhere'
            return new User(identifier);
        }
        // check user type
        var type = identifier.getType();
        if (NetworkType.Main.equals(type) || NetworkType.BTCMain.equals(type)) {
            return new User(identifier);
        }
        if (NetworkType.Robot.equals(type)) {
            return new Robot(identifier);
        }
        if (NetworkType.Station.equals(type)) {
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
        if (NetworkType.Polylogue.equals(type)) {
            return new Polylogue(identifier);
        }
        if (NetworkType.Chatroom.equals(type)) {
            return new Chatroom(identifier);
        }
        if (NetworkType.Provider.equals(type)) {
            return new ServiceProvider(identifier);
        }
        throw TypeError('Unsupported group type: ' + type);
    };

    //
    //  GroupDataSource
    //

    Facebook.prototype.getFounder = function (identifier) {
        var founder = Barrack.prototype.getFounder.call(this, identifier);
        if (founder) {
            return founder;
        }
        // check each member's public key with group meta
        var members = this.getMembers(identifier);
        if (members) {
            var gMeta = this.getMeta(identifier);
            if (gMeta) {
                // if the member's public key matches with the group's meta,
                // it means this meta was generate by the member's private key
                var id;
                var meta;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (meta && meta.matches(meta.key)) {
                        // got it
                        return id;
                    }
                }
            }
        }
        // TODO: load founder from database
        return null;
    };

    Facebook.prototype.getOwner = function (identifier) {
        var owner = Barrack.prototype.getOwner.call(this, identifier);
        if (owner) {
            return owner;
        }
        // check group type
        if (NetworkType.Polylogue.equals(identifier.getType())) {
            // Polylogue's owner is its founder
            return this.getFounder(identifier);
        }
        // TODO: load owner from database
        return null;
    };

    Facebook.prototype.isFounder = function (member, group) {
        // check member's public key with group's meta.key
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            throw Error('failed to get meta for group: ' + group);
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            throw Error('failed to get meta for member: ' + member);
        }
        return gMeta.matches(mMeta.key);
    };

    Facebook.prototype.isOwner = function (member, group) {
        if (NetworkType.Polylogue.equals(group.getType())) {
            return this.isFounder(member, group);
        }
        throw Error('only Polylogue so far');
    };

    Facebook.prototype.existsMember = function (member, group) {
        var list = this.getMembers(group);
        if (list && list.indexOf(member) >= 0) {
            return true;
        }
        var owner = this.getOwner(group);
        if (owner) {
            owner = this.getIdentifier(owner);
            return owner.equals(member);
        } else {
            return false;
        }
    };

    //
    //  Group Assistants
    //

    // noinspection JSUnusedLocalSymbols
    Facebook.prototype.getAssistants = function (group) {
        console.assert(false, 'implement me!');
        return null;
    };

    Facebook.prototype.existsAssistant = function (user, group) {
        var assistants = this.getAssistants(group);
        if (assistants) {
            return assistants.indexOf(user) >= 0;
        }
        return false;
    };

    //-------- namespace --------
    ns.Facebook = Facebook;

    ns.register('Facebook');

}(DIMP);
