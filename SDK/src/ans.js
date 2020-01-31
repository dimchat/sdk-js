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

!function (ns) {
    'use strict';

    var ID = ns.ID;
    var Address = ns.Address;

    var AddressNameService = function() {
        // constant ANS records
        var caches = {
            'all':      ID.EVERYONE,
            'everyone': ID.EVERYONE,
            'anyone':   ID.ANYONE,
            'owner':    ID.ANYONE,
            'founder':  AddressNameService.FOUNDER
        };
        // reserved names
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true;
        }
        // init
        this.reserved = reserved;
        this.caches = caches;
    };

    AddressNameService.prototype.isReserved = function (name) {
        return this.reserved[name] === true;
    };

    AddressNameService.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            // this name is reserved, cannot register
            return false;
        }
        if (identifier) {
            this.caches[name] = identifier;
        } else {
            delete this.caches[name];
        }
    };

    /**
     *  Save ANS record
     *
     * @param name - short name
     * @param identifier
     * @returns {boolean}
     */
    AddressNameService.prototype.save = function (name, identifier) {
        console.assert(name !== null, 'name empty');
        console.assert(identifier !== null, 'ID empty');
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Get ID by short name
     *
     * @param name - short name
     * @returns {ID}
     */
    AddressNameService.prototype.getIdentifier = function (name) {
        return this.caches[name];
    };

    /**
     *  Get all short names with the same ID
     *
     * @param identifier
     * @returns {[]}
     */
    AddressNameService.prototype.getNames = function (identifier) {
        var array = [];
        var keys = Object.keys(this.caches);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i];
            if (this.caches[name] === identifier) {
                array.push(name);
            }
        }
        return array;
    };

    AddressNameService.FOUNDER = new ID('moky', Address.ANYWHERE);
    AddressNameService.KEYWORDS = [
        "all", "everyone", "anyone", "owner", "founder",
        // --------------------------------
        "dkd", "mkm", "dimp", "dim", "dimt",
        "rsa", "ecc", "aes", "des", "btc", "eth",
        // --------------------------------
        "crypto", "key", "symmetric", "asymmetric",
        "public", "private", "secret", "password",
        "id", "address", "meta", "profile",
        "entity", "user", "group", "contact",
        // --------------------------------
        "member", "admin", "administrator", "assistant",
        "main", "polylogue", "chatroom",
        "social", "organization",
        "company", "school", "government", "department",
        "provider", "station", "thing", "robot",
        // --------------------------------
        "message", "instant", "secure", "reliable",
        "envelope", "sender", "receiver", "time",
        "content", "forward", "command", "history",
        "keys", "data", "signature",
        // --------------------------------
        "type", "serial", "sn",
        "text", "file", "image", "audio", "video", "page",
        "handshake", "receipt", "block", "mute",
        "register", "suicide", "found", "abdicate",
        "invite", "expel", "join", "quit", "reset", "query",
        "hire", "fire", "resign",
        // --------------------------------
        "server", "client", "terminal", "local", "remote",
        "barrack", "cache", "transceiver",
        "ans", "facebook", "store", "messenger",
        "root", "supervisor"
    ];

    //-------- namespace --------
    ns.AddressNameService = AddressNameService;

}(DIMP);
