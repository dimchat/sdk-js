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

/**
 *  Command message: {
 *      type : 0x88,
 *      sn   : 123,
 *
 *      command : "storage",
 *      title   : "key name",  // "contacts", "private_key", ...
 *
 *      data    : "...",       // base64_encode(symmetric)
 *      key     : "...",       // base64_encode(asymmetric)
 *
 *      // -- extra info
 *      //...
 *  }
 */

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Base64 = ns.format.Base64;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;

    var Command = ns.protocol.Command;

    var StorageCommand = function (info) {
        var title = null;
        if (!info) {
            // create empty storage command
            info = StorageCommand.STORAGE;
        } else if (typeof info === 'string') {
            // create new command with storage title
            title = info;
            info = StorageCommand.STORAGE;
        }
        // create storage command
        Command.call(this, info);
        if (title) {
            this.setTitle(title);
        }
        // private properties
        this.data = null;      // encrypted data
        this.plaintext = null; // decrypted data
        this.key = null;       // encrypted symmetric key data
        this.password = null;  // symmetric key for data
    };
    ns.Class(StorageCommand, Command);

    //-------- setter/getter --------

    StorageCommand.prototype.getTitle = function () {
        var title = this.getValue('title');
        if (title) {
            return title;
        } else {
            // (compatible with v1.0)
            //  contacts command: {
            //      command : 'contacts',
            //      data    : '...',
            //      key     : '...'
            //  }
            return this.getCommand();
        }
    };
    StorageCommand.prototype.setTitle = function (title) {
        this.setValue('title', title);
    };

    StorageCommand.prototype.getIdentifier = function () {
        return this.getValue('ID');
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
        this.setValue('ID', identifier);
    };

    //
    //  Encrypted data
    //      encrypted by a random password before upload
    //
    StorageCommand.prototype.getData = function () {
        if (!this.data) {
            var base64 = this.getValue('data');
            if (base64) {
                this.data = Base64.decode(base64);
            }
        }
        return this.data;
    };
    StorageCommand.prototype.setData = function (data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data);
        }
        this.setValue('data', base64);
        this.data = data;
        this.plaintext = null;
    };

    //
    //  Symmetric key
    //      password to decrypt data
    //      encrypted by user's public key before upload.
    //      this should be empty when the storage data is "private_key".
    //
    StorageCommand.prototype.getKey = function () {
        if (!this.key) {
            var base64 = this.getValue('key');
            if (base64) {
                this.key = Base64.decode(base64);
            }
        }
        return this.key;
    };
    StorageCommand.prototype.setKey = function (data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data);
        }
        this.setValue('key', base64);
        this.key = data;
        this.password = null;
    };

    //
    //  Decryption
    //
    StorageCommand.prototype.decrypt = function (key) {
        if (!this.plaintext) {
            // 1. get password for decrypting data
            var pwd = null;
            if (ns.type.Object.isinstance(key, PrivateKey)) {
                // decrypt password with private key
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw Error('failed to decrypt key: ' + key);
                }
            } else if (ns.type.Object.isinstance(key, SymmetricKey)) {
                pwd = key;
            } else {
                throw TypeError('Decryption key error: ' + key);
            }
            // 2. decrypt data with symmetric key
            var data = this.getData();
            this.plaintext = pwd.decrypt(data);
        }
        return this.plaintext;
    };
    StorageCommand.prototype.decryptKey = function (privateKey) {
        if (!this.password) {
            var key = this.getKey();
            key = privateKey.decrypt(key);
            var json = new ns.type.String(key, 'UTF-8');
            var dict = ns.format.JSON.decode(json);
            this.password = SymmetricKey.getInstance(dict);
        }
        return this.password;
    };

    //-------- storage command names --------
    StorageCommand.STORAGE = 'storage';

    // storage titles (should be encrypted)
    StorageCommand.CONTACTS = 'contacts';
    StorageCommand.PRIVATE_KEY = 'private_key';

    //-------- register --------
    Command.register(StorageCommand.STORAGE, StorageCommand);
    Command.register(StorageCommand.CONTACTS, StorageCommand);
    Command.register(StorageCommand.PRIVATE_KEY, StorageCommand);

    //-------- namespace --------
    ns.protocol.StorageCommand = StorageCommand;

}(DIMP);
