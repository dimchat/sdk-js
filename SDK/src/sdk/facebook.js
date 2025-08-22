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

//! require <dimp.js>

//! require 'core/barrack.js'
//! require 'mkm/entity.js'
//! require 'mkm/group.js'
//! require 'mkm/user.js'

    sdk.Facebook = function() {
        BaseObject.call(this);
    };
    var Facebook = sdk.Facebook;

    Class(Facebook, BaseObject, [
        EntityDelegate, UserDataSource, GroupDataSource
    ], null);

    // protected
    Facebook.prototype.getBarrack = function () {};

    // public
    Facebook.prototype.getArchivist = function () {};

    /**
     *  Select local user for receiver
     *
     * @param {mkm.protocol.ID} receiver - user/group ID
     * @return {mkm.protocol.ID} local user
     */
    Facebook.prototype.selectLocalUser = function (receiver) {
        var archivist = this.getArchivist();
        var users = archivist.getLocalUsers();
        //
        //  1.
        //
        if (!users || users.length === 0) {
            // throw new Error("local users should not be empty");
            return null;
        } else if (receiver.isBroadcast()) {
            // broadcast message can decrypt by anyone, so just return current user
            return users[0];
        }
        //
        //  2.
        //
        var i, uid;
        if (receiver.isUser()) {
            // personal message
            for (i = 0; i < users.length; ++i) {
                uid = users[i];
                if (!uid) {
                    // user error
                } else if (uid.equals(receiver)) {
                    // DISCUSS: set this item to be current user?
                    return uid;
                }
            }
        } else if (receiver.isGroup()) {
            // group message (recipient not designated)
            //
            // the messenger will check group info before decrypting message,
            // so we can trust that the group's meta & members MUST exist here.
            var members = this.getMembers(receiver);
            if (!members || members.length === 0) {
                // TODO: group not ready, waiting for group info
                return null;
            }
            var j, mid;
            for (i = 0; i < users.length; ++i) {
                uid = users[i];
                for (j = 0; j < members.length; ++j) {
                    mid = members[j];
                    if (!mid) {
                        // member error
                    } else if (mid.equals(uid)) {
                        // DISCUSS: set this item to be current user?
                        return uid;
                    }
                }
            }
        } else {
            throw new TypeError('receiver error: ' + receiver);
        }
        // not me?
        return null;
    };

    //
    //  Entity Delegate
    //

    // Override
    Facebook.prototype.getUser = function (uid) {
        var barrack = this.getBarrack();
        //
        //  1. get from user cache
        //
        var user = barrack.getUser(uid);
        if (user) {
            return user;
        }
        //
        //  2. check visa key
        //
        if (uid.isBroadcast()) {
            // no need to check visa key for broadcast user
        } else {
            var visaKey = this.getPublicKeyForEncryption(uid);
            if (!visaKey) {
                // visa.key not found
                return null;
            }
            // NOTICE: if visa.key exists, then visa & meta must exist too.
        }
        //
        //  3. create user and cache it
        //
        user = barrack.createUser(uid);
        if (user) {
            barrack.cacheUser(user);
        }
        return user;
    };

    // Override
    Facebook.prototype.getGroup = function (gid) {
        var barrack = this.getBarrack();
        //
        //  1. get from group cache
        //
        var group = barrack.getGroup(gid);
        if (group) {
            return group;
        }
        //
        //  2. check members
        //
        if (gid.isBroadcast()) {
            // no need to check members for broadcast group
        } else {
            var members = this.getMembers(gid);
            if (!members || members.length === 0) {
                // group members not found
                return null;
            }
            // NOTICE: if members exist, then owner (founder) must exist,
            //         and bulletin & meta must exist too.
        }
        //
        //  3. create group and cache it
        //
        group = barrack.createGroup(gid);
        if (group) {
            barrack.cacheGroup(group);
        }
        return group;
    };

    //
    //  User DataSource
    //

    // Override
    Facebook.prototype.getPublicKeyForEncryption = function (uid) {
        var archivist = this.getArchivist();
        //
        //  1. get pubic key from visa
        //
        var visaKey = archivist.getVisaKey(uid);
        if (visaKey) {
            // if visa.key exists, use it for encryption
            return visaKey;
        }
        //
        //  2. get key from meta
        //
        var metaKey = archivist.getMetaKey(uid);
        if (Interface.conforms(metaKey, EncryptKey)) {
            // if visa.key not exists and meta.key is encrypt key,
            // use it for encryption
            return metaKey;
        }
        // failed to get encrypt key for user
        return null;
    };

    // Override
    Facebook.prototype.getPublicKeysForVerification = function (uid) {
        var archivist = this.getArchivist();
        var verifyKeys = [];
        //
        //  1. get pubic key from visa
        //
        var visaKey = archivist.getVisaKey(uid);
        if (Interface.conforms(visaKey, VerifyKey)) {
            // the sender may use communication key to sign message.data,
            // so try to verify it with visa.key first
            verifyKeys.push(visaKey);
        }
        //
        //  2. get key from meta
        //
        var metaKey = archivist.getMetaKey(uid);
        if (metaKey) {
            // the sender may use identity key to sign message.data,
            // try to verify it with meta.key too
            verifyKeys.push(metaKey);
        }
        return verifyKeys;
    };
