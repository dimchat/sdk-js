;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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

/**
 *  Built-in accounts (for test)
 *
 *      1. Immortal Hulk - hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj
 *      2. Monkey King   - moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk
 */

//! require <dimp.js>

!function (ns) {
    'use strict';

    var DecryptKey = ns.crypto.DecryptKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.ID;
    var Meta = ns.Meta;
    var Profile = ns.Profile;
    var User = ns.User;

    var accounts = {
        'hulk': {
            meta: {
                "version" : 1,
                "key" : {
                    "algorithm" : "RSA",
                    "data" : "-----BEGIN PUBLIC KEY-----\nMIGJAoGBALB+vbUK48UU9rjlgnohQowME+3JtTb2hLPqtatVOW364\/EKFq0\/PSdnZVE9V2Zq+pbX7dj3nCS4pWnYf40ELH8wuDm0Tc4jQ70v4LgAcdy3JGTnWUGiCsY+0Z8kNzRkm3FJid592FL7ryzfvIzB9bjg8U2JqlyCVAyUYEnKv4lDAgMBAAE=\n-----END PUBLIC KEY-----",
                    "mode" : "ECB",
                    "padding" : "PKCS1",
                    "digest" : "SHA256"
                },
                "seed" : "hulk",
                "fingerprint" : "jIPGWpWSbR\/DQH6ol3t9DSFkYroVHQDvtbJErmFztMUP2DgRrRSNWuoKY5Y26qL38wfXJQXjYiWqNWKQmQe\/gK8M8NkU7lRwm+2nh9wSBYV6Q4WXsCboKbnM0+HVn9Vdfp21hMMGrxTX1pBPRbi0567ZjNQC8ffdW2WvQSoec2I="
            },
            profile: {
                "ID" : "hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj" ,
                "names" : ["无敌浩克", "Immortal Hulk"]
            },
            secret: {
                "algorithm" : "RSA",
                "data" : "-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQCwfr21CuPFFPa45YJ6IUKMDBPtybU29oSz6rWrVTlt+uPxChatPz0nZ2VRPVdmavqW1+3Y95wkuKVp2H+NBCx\/MLg5tE3OI0O9L+C4AHHctyRk51lBogrGPtGfJDc0ZJtxSYnefdhS+68s37yMwfW44PFNiapcglQMlGBJyr+JQwIDAQABAoGAVc0HhJ\/KouDSIIjSqXTJ2TN17L+GbTXixWRw9N31kVXKwj9ZTtfTbviA9MGRX6TaNcK7SiL1sZRiNdaeC3vf9RaUe3lV3aR\/YhxuZ5bTQNHPYqJnbbwsQkp4IOwSWqOMCfsQtP8O+2DPjC8Jx7PPtOYZ0sC5esMyDUj\/EDv+HUECQQDXsPlTb8BAlwWhmiAUF8ieVENR0+0EWWU5HV+dp6Mz5gf47hCO9yzZ76GyBM71IEQFdtyZRiXlV9CBOLvdlbqLAkEA0XqONVaW+nNTNtlhJVB4qAeqpj\/foJoGbZhjGorBpJ5KPfpD5BzQgsoT6ocv4vOIzVjAPdk1lE0ACzaFpEgbKQJBAKDLjUO3ZrKAI7GSreFszaHDHaCuBd8dKcoHbNWiOJejIERibbO27xfVfkyxKvwwvqT4NIKLegrciVMcUWliivsCQQCiA1Z\/XEQS2iUO89tVn8JhuuQ6Boav0NCN7OEhQxX3etFS0\/+0KrD9psr2ha38qnwwzaaJbzgoRdF12qpL39TZAkBPv2lXFNsn0\/Jq3cUemof+5sm53KvtuLqxmZfZMAuTSIbB+8i05JUVIc+mcYqTqGp4FDfz6snzt7sMBQdx6BZY\n-----END RSA PRIVATE KEY-----",
                "mode" : "ECB",
                "padding" : "PKCS1",
                "digest" : "SHA256"
            }
        },

        'moki': {
            meta: {
                "version" : 1,
                "key" : {
                    "algorithm" : "RSA",
                    "data" : "-----BEGIN PUBLIC KEY-----\nMIGJAoGBALQOcgxhhV0XiHELKYdG587Tup261qQ3ahAGPuifZvxHXTq+GgulEyXiovwrVjpz7rKXn+16HgspLHpp5agv0WsSn6k2MnQGk5RFXuilbFr\/C1rEX2X7uXlUXDMpsriKFndoB1lz9P3E8FkM5ycG84hejcHB+R5yzDa4KbGeOc0tAgMBAAE=\n-----END PUBLIC KEY-----",
                    "mode" : "ECB",
                    "padding" : "PKCS1",
                    "digest" : "SHA256"
                },
                "seed" : "moki",
                "fingerprint" : "ld68TnzYqzFQMxeJ6N+aZa2jRf9d4zVx4BUiBlmur67ne8YZF08plhCiIhfyYDIwwW7KLaAHvK8gJbp0pPIzLR4bhzu6zRpDLzUQsq6bXgMp+WAiZtFm6IHWNUwUEYcr3iSvTn5L1HunRt7kBglEjv8RKtbNcK0t1Xto375kMlo="
            },
            profile: {
                "ID" : "moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk",
                "names" : ["齐天大圣", "Monkey King"]
            },
            secret: {
                "algorithm" : "RSA",
                "data" : "-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQC0DnIMYYVdF4hxCymHRufO07qdutakN2oQBj7on2b8R106vhoLpRMl4qL8K1Y6c+6yl5\/teh4LKSx6aeWoL9FrEp+pNjJ0BpOURV7opWxa\/wtaxF9l+7l5VFwzKbK4ihZ3aAdZc\/T9xPBZDOcnBvOIXo3Bwfkecsw2uCmxnjnNLQIDAQABAoGADi5wFaENsbgTh0HHjs\/LHKto8JjhZHQ33pS7WjOJ1zdgtKp53y5sfGimCSH5q+drJrZSApCCcsMWrXqPO8iuX\/QPak72yzTuq9MEn4tusO\/5w8\/g\/csq+RUhlLHLdOrPfVciMBXgouT8BB6UMa0e\/g8K\/7JBV8v1v59ZUccSSwkCQQD67yI6uSlgy1\/NWqMENpGc9tDDoZPR2zjfrXquJaUcih2dDzEbhbzHxjoScGaVcTOx\/Aiu00dAutoN+Jpovpq1AkEAt7EBRCarVdo4YKKNnW3cZQ7u0taPgvc\/eJrXaWES9+MpC\/NZLnQNF\/NZlU9\/H2607\/d+Xaac6wtxkIQ7O61bmQJBAOUTMThSmIeYoZiiSXcrKbsVRneRJZTKgB0SDZC1JQnsvCQJHld1u2TUfWcf3UZH1V2CK5sNnVpmOXHPpYZBmpECQBp1hJkseMGFDVneEEf86yIjZIM6JLHYq2vT4fNr6C+MqPzvsIjgboJkqyK2sLj2WVm3bJxQw4mXvGP0qBOQhQECQQCOepIyFl\/a\/KmjVZ5dvmU2lcHXkqrvjcAbpyO1Dw6p2OFCBTTQf3QRmCoys5\/dyBGLDhRzV5Obtg6Fll\/caLXs\n-----END RSA PRIVATE KEY-----",
                "mode" : "ECB",
                "padding" : "PKCS1",
                "digest" : "SHA256"
            }
        }
    };
    var HULK = ID.getInstance('hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj');
    var MOKI = ID.getInstance('moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk');

    var UserDataSource = ns.UserDataSource;

    var Immortals = function () {
        // memory caches
        this.idMap         = {};  // String -> ID
        this.privateKeyMap = {};  // ID -> PrivateKey
        this.metaMap       = {};  // ID -> Meta
        this.profileMap    = {};  // ID -> Profile
        this.userMap       = {};  // ID -> User
        // load built-in users
        load_account.call(this, HULK);
        load_account.call(this, MOKI);
    };
    Immortals.inherits(UserDataSource);

    var load_account = function (identifier) {
        // ID
        this.idMap[identifier.toString()] = identifier;
        // meta
        this.metaMap[identifier] = load_meta.call(this, identifier);
        // private key
        this.privateKey[identifier] = load_private_key.call(this, identifier);
        // profile
        this.profileMap[identifier] = load_profile.call(this, identifier);
    };
    var load_meta = function (identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null;
        }
        return Meta.getInstance(info['meta']);
    };
    var load_private_key = function (identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null;
        }
        return PrivateKey.getInstance(info['secret']);
    };
    var load_profile = function (identifier) {
        var info = accounts[identifier.name];
        if (!info) {
            return null;
        }
        var dict = info['profile'];
        var profile = Profile.getInstance(dict);
        if (!profile) {
            return null;
        }
        // copy 'name'
        var name = dict['name'];
        if (name) {
            profile.setProperty('name', name);
        } else {
            var names = dict['names'];
            if (names instanceof Array && names.length > 0) {
                profile.setProperty('name', names[0]);
            }
        }
        // copy 'avatar
        var avatar = dict['avatar'];
        if (avatar) {
            profile.setProperty('avatar', avatar);
        } else {
            var photos = dict['photos'];
            if (photos instanceof Array && photos.length > 0) {
                profile.setProperty('avatar', photos[0]);
            }
        }
        // sign
        var key = this.getPrivateKeyForSignature(identifier);
        if (key) {
            profile.sign(key);
        } else {
            throw Error('failed to get private key to sign profile for user: ' + identifier);
        }
        return profile;
    };

    //
    //  Create
    //

    Immortals.prototype.getIdentifier = function (string) {
        if (!string) {
            return null;
        } else if (string instanceof ID) {
            return string;
        }
        return this.idMap[string];
    };

    Immortals.prototype.getUser = function (identifier) {
        var user = this.userMap[identifier];
        if (!user) {
            // only create built-in account
            if (this.idMap[identifier.toString()]) {
                user = new User(identifier);
                user.delegate = this;
                this.userMap[identifier] = user;
            }
        }
        return user;
    };

    //
    //  EntityDataSource
    //

    Immortals.prototype.getMeta = function (identifier) {
        return this.metaMap[identifier];
    };

    Immortals.prototype.getProfile = function (identifier) {
        return this.profileMap[identifier];
    };

    //
    //  UserDataSource
    //

    Immortals.prototype.getContacts = function (identifier) {
        if (!this.idMap[identifier.toString()]) {
            return null;
        }
        var contacts = [];
        var list = Object.keys(this.idMap);
        var item;
        for (var i = 0; i < list.length; ++i) {
            item = list[i];
            if (item.equals(identifier)) {
                continue;
            }
            contacts.push(item);
        }
        return contacts;
    };

    Immortals.prototype.getPublicKeyForEncryption = function (identifier) {
        // NOTICE: return nothing to use profile.key or meta.key
        return null;
    };

    Immortals.prototype.getPublicKeysForVerification = function (identifier) {
        // NOTICE: return nothing to use meta.key
        return null;
    };

    Immortals.prototype.getPrivateKeysForDecryption = function (identifier) {
        var key = this.privateKeyMap[identifier];
        if (key && key.isinstanceof(DecryptKey)) {
            return [key];
        }
        return null;
    };

    Immortals.prototype.getPrivateKeyForSignature = function (identifier) {
        return this.privateKeyMap[identifier];
    };

    Immortals.HULK = HULK;
    Immortals.MOKI = MOKI;

    //-------- namespace --------
    ns.Immortals = Immortals;

}(DIMP);
