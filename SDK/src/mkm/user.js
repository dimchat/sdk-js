'use strict';
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
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

//! require 'entity.js'
//! require 'utils.js'

    /**
     *  User account for communication
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *  This class is for creating user account
     *
     *  functions:
     *      (User)
     *      1. verify(data, signature) - verify (encrypted content) data and signature
     *      2. encrypt(data)           - encrypt (symmetric key) data
     *      (LocalUser)
     *      3. sign(data)    - calculate signature of (encrypted content) data
     *      4. decrypt(data) - decrypt (symmetric key) data
     */
    mkm.mkm.User = Interface(null, [Entity]);
    var User = mkm.mkm.User;

    /**
     *  Get user document with public key
     *
     * @return {Visa}
     */
    User.prototype.getVisa = function () {};

    /**
     *  Get all contacts of the user
     *
     * @returns {ID[]}
     */
    User.prototype.getContacts = function () {};

    /**
     *  Verify data and signature with user's public keys
     *
     * @param {Uint8Array} data
     * @param {Uint8Array} signature
     * @returns {boolean}
     */
    User.prototype.verify = function (data, signature) {};

    /**
     *  Encrypt data, try visa.key first, if not found, use meta.key
     *
     * @param {Uint8Array} plaintext
     * @returns {Uint8Array}
     */
    User.prototype.encrypt = function (plaintext) {};

    //
    //  Interfaces for Local User
    //

    /**
     *  Sign data with user's private key
     *
     * @param {Uint8Array} data
     * @returns {Uint8Array}
     */
    User.prototype.sign = function (data) {};

    /**
     *  Decrypt data with user's private key(s)
     *
     * @param {Uint8Array} ciphertext
     * @returns {Uint8Array}
     */
    User.prototype.decrypt = function (ciphertext) {};

    //
    //  Interfaces for Visa
    //

    User.prototype.signVisa = function (doc) {};

    User.prototype.verifyVisa = function (doc) {};

    /**
     *  This interface is for getting information for user
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  (Encryption/decryption)
     *  1. public key for encryption
     *     if visa.key not exists, means it is the same key with meta.key
     *  2. private keys for decryption
     *     the private keys paired with [visa.key, meta.key]
     *
     *  (Signature/Verification)
     *  3. private key for signature
     *     the private key paired with visa.key or meta.key
     *  4. public keys for verification
     *     [visa.key, meta.key]
     *
     *  (Visa Document)
     *  5. private key for visa signature
     *     the private key paired with meta.key
     *  6. public key for visa verification
     *     meta.key only
     */
    User.DataSource = Interface(null, [Entity.DataSource]);
    var UserDataSource = User.DataSource;

    /**
     *  Get contacts list
     *
     * @param {ID} identifier - user ID
     * @returns {ID[]}
     */
    UserDataSource.prototype.getContacts = function (identifier) {};

    /**
     *  Get user's public key for encryption
     *  (visa.key or meta.key)
     *
     * @param {ID} identifier - user ID
     * @returns {EncryptKey} public key
     */
    UserDataSource.prototype.getPublicKeyForEncryption = function (identifier) {};

    /**
     *  Get user's public keys for verification
     *  [visa.key, meta.key]
     *
     * @param {ID} identifier - user ID
     * @returns {VerifyKey[]} public keys
     */
    UserDataSource.prototype.getPublicKeysForVerification = function (identifier) {};

    /**
     *  Get user's private keys for decryption
     *  (which paired with [visa.key, meta.key])
     *
     * @param {ID} identifier - user ID
     * @returns {DecryptKey[]} private keys
     */
    UserDataSource.prototype.getPrivateKeysForDecryption = function (identifier) {};

    /**
     *  Get user's private key for signature
     *  (which paired with visa.key or meta.key)
     *
     * @param {ID} identifier - user ID
     * @returns {SignKey}
     */
    UserDataSource.prototype.getPrivateKeyForSignature = function (identifier) {};

    /**
     *  Get user's private key for signing visa
     *
     * @param {ID} identifier - user ID
     * @return {SignKey} private key
     */
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function (identifier) {};


    //
    //  Base User
    //
    mkm.mkm.BaseUser = function (identifier) {
        BaseEntity.call(this, identifier);
    };
    var BaseUser = mkm.mkm.BaseUser;

    Class(BaseUser, BaseEntity, [User], {

        // Override
        getVisa: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastVisa(docs);
        },

        // Override
        getContacts: function () {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            return facebook.getContacts(user);
        },

        // Override
        verify: function (data, signature) {
            // NOTICE: I suggest using the private key paired with meta.key to sign message
            //         so here should return the meta.key
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var keys = facebook.getPublicKeysForVerification(user);
            // if (!keys) {
            //     throw new ReferenceError('failed to get verify keys for user: ' + user);
            // }
            for (var i = 0; i < keys.length; ++i) {
                if (keys[i].verify(data, signature)) {
                    // matched!
                    return true;
                }
            }
            // signature not match
            // TODO: check whether visa is expired, query new document for this contact
            return false;
        },

        // Override
        encrypt: function (plaintext) {
            // NOTICE: meta.key will never changed, so use visa.key to encrypt
            //         is the better way
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var pKey = facebook.getPublicKeyForEncryption(user);
            // if (!pKey) {
            //     throw new ReferenceError('failed to get encrypt key for user: ' + user);
            // }
            return pKey.encrypt(plaintext, null);
        },

        //
        //  Interfaces for Local User
        //

        // Override
        sign: function (data) {
            // NOTICE: I suggest use the private key which paired to meta.key
            //         to sign message
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var sKey = facebook.getPrivateKeyForSignature(user);
            // if (!sKey) {
            //     throw new ReferenceError('failed to get sign key for user: ' + user);
            // }
            return sKey.sign(data);
        },

        // Override
        decrypt: function (ciphertext) {
            // NOTICE: if you provide a public key in visa for encryption
            //         here you should return the private key paired with visa.key
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var keys = facebook.getPrivateKeysForDecryption(user);
            //if (!keys || keys.length === 0) {
            //    throw new ReferenceError('failed to get decrypt keys for user: ' + user);
            //}
            var plaintext;
            for (var i = 0; i < keys.length; ++i) {
                // try decrypting it with each private key
                plaintext = keys[i].decrypt(ciphertext, null);
                if (plaintext && plaintext.length > 0) {
                    // OK!
                    return plaintext;
                }
            }
            // decryption failed
            // TODO: check whether my visa key is changed, push new visa to this contact
            return null;
        },

        //
        //  Interfaces for Visa
        //

        // Override
        signVisa: function (doc) {
            var did = doc.getIdentifier();
            // if (!this.getIdentifier().equals(did)) {
            //    // visa ID not match
            //    return null;
            // }
            var facebook = this.getDataSource();
            // NOTICE: only sign visa with the private key paired with your meta.key
            var sKey = facebook.getPrivateKeyForVisaSignature(did);
            //if (!sKey) {
            //    throw new ReferenceError('failed to get sign key for user: ' + did);
            //}
            var sig = doc.sign(sKey);
            if (!sig) {
                return null;
            }
            return doc;
        },

        // Override
        verifyVisa: function (doc) {
            // NOTICE: only verify visa with meta.key
            //         (if meta not exists, user won't be created)
            var did = doc.getIdentifier();
            if (!this.getIdentifier().equals(did)) {
                // visa ID not match
                return false;
            }
            // if meta not exists, user won't be created
            var meta = this.getMeta();
            var pKey = meta.getPublicKey();
            //if (!pKey) {
            //    throw new ReferenceError('failed to get meta key for user: ' + uid);
            //}
            return doc.verify(pKey);
        }
    });
