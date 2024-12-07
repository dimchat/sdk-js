;
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

//! require 'crypto/*.js'
//! require 'digest/*.js'
//! require 'format/*.js'
//! require 'mkm/*.js'

(function (ns) {
    'use strict';

    var Address  = ns.protocol.Address;
    var ID       = ns.protocol.ID;
    var Meta     = ns.protocol.Meta;
    var Document = ns.protocol.Document;

    var GeneralAddressFactory    = ns.mkm.GeneralAddressFactory;
    var GeneralIdentifierFactory = ns.mkm.GeneralIdentifierFactory;
    var GeneralMetaFactory       = ns.mkm.GeneralMetaFactory;
    var GeneralDocumentFactory   = ns.mkm.GeneralDocumentFactory;

    /**
     *  Register address factory
     *  ~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var registerAddressFactory = function () {
        Address.setFactory(new GeneralAddressFactory());
    };

    /**
     *  Register ID factory
     *  ~~~~~~~~~~~~~~~~~~~
     */
    var registerIdentifierFactory = function () {
        ID.setFactory(new GeneralIdentifierFactory());
    };

    /**
     *  Register meta factories
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var registerMetaFactories = function () {
        Meta.setFactory(Meta.MKM, new GeneralMetaFactory(Meta.MKM));
        Meta.setFactory(Meta.BTC, new GeneralMetaFactory(Meta.BTC));
        Meta.setFactory(Meta.ETH, new GeneralMetaFactory(Meta.ETH));
    };

    /**
     *  Register document factories
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    var registerDocumentFactories = function () {

        Document.setFactory('*', new GeneralDocumentFactory('*'));
        Document.setFactory(Document.VISA, new GeneralDocumentFactory(Document.VISA));
        Document.setFactory(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
        Document.setFactory(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN));
    };

    //-------- namespace --------
    ns.registerAddressFactory    = registerAddressFactory;
    ns.registerIdentifierFactory = registerIdentifierFactory;
    ns.registerMetaFactories     = registerMetaFactories;
    ns.registerDocumentFactories = registerDocumentFactories;

})(DIMP);

(function (ns) {
    'use strict';

    var SymmetricKey  = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey    = ns.crypto.PrivateKey;
    var PublicKey     = ns.crypto.PublicKey;

    var PlainKey      = ns.crypto.PlainKey;

    var ECCPrivateKeyFactory = ns.crypto.ECCPrivateKeyFactory;
    var ECCPublicKeyFactory  = ns.crypto.ECCPublicKeyFactory
    var RSAPrivateKeyFactory = ns.crypto.RSAPrivateKeyFactory;
    var RSAPublicKeyFactory  = ns.crypto.RSAPublicKeyFactory

    var AESKeyFactory        = ns.crypto.AESKeyFactory;
    var PlainKeyFactory      = ns.crypto.PlainKeyFactory;

    var registerKeyFactories = function () {

        /**
         *  Register asymmetric key parsers
         *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        var ecc_pri = new ECCPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
        PrivateKey.setFactory('SHA256withECC', ecc_pri);

        var ecc_pub = new ECCPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
        PublicKey.setFactory('SHA256withECC', ecc_pub);

        var rsa_pri = new RSAPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
        PrivateKey.setFactory('SHA256withRSA', rsa_pri);
        PrivateKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pri);

        var rsa_pub = new RSAPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
        PublicKey.setFactory('SHA256withRSA', rsa_pub);
        PublicKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pub);

        /**
         *  Register symmetric key parsers
         *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         */
        var aes = new AESKeyFactory();
        SymmetricKey.setFactory(SymmetricKey.AES, aes);
        SymmetricKey.setFactory('AES/CBC/PKCS7Padding', aes);

        SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory());

    };

    var registerPlugins = function () {

        // ns.registerDataCoders();
        // ns.registerDataDigesters();

        ns.registerKeyFactories();

        ns.registerIdentifierFactory();
        ns.registerAddressFactory();
        ns.registerMetaFactories();
        ns.registerDocumentFactories();
    };

    //-------- namespace --------
    ns.registerKeyFactories = registerKeyFactories;
    ns.registerPlugins = registerPlugins;

})(DIMP);
