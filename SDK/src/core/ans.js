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

    var Interface = ns.type.Interface;

    var KEYWORDS = [
        "all", "everyone", "anyone", "owner", "founder",
        // --------------------------------
        "dkd", "mkm", "dimp", "dim", "dimt",
        "rsa", "ecc", "aes", "des", "btc", "eth",
        // --------------------------------
        "crypto", "key", "symmetric", "asymmetric",
        "public", "private", "secret", "password",
        "id", "address", "meta", "profile", "document",
        "entity", "user", "group", "contact",
        // --------------------------------
        "member", "admin", "administrator", "assistant",
        "main", "polylogue", "chatroom",
        "social", "organization",
        "company", "school", "government", "department",
        "provider", "station", "thing", "bot", "robot",
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

    var AddressNameService = Interface(null, null);

    AddressNameService.KEYWORDS = KEYWORDS;

    /**
     *  Check whether the alias is available
     *
     * @param {string} name
     * @return {boolean} true on reserved
     */
    AddressNameService.prototype.isReserved = function (name) {
        throw new Error('AddressNameService::isReserved: ' + name);
    };

    /**
     *  Get ID by short name
     *
     * @param {string} name - short name
     * @returns {ID}
     */
    AddressNameService.prototype.getIdentifier = function (name) {
        throw new Error('AddressNameService::getIdentifier: ' + name);
    };

    /**
     *  Get all short names with the same ID
     *
     * @param {ID} identifier
     * @returns {string[]}
     */
    AddressNameService.prototype.getNames = function (identifier) {
        throw new Error('AddressNameService::getNames: ' + identifier);
    };

    //-------- namespace --------
    ns.AddressNameService = AddressNameService;

})(DIMP);
