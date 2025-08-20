'use strict';
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

    /// 1. [Meta Protocol]
    /// 2. [Visa Protocol]
    sdk.msg.MessageUtils = {

        /**
         *  Sender's Meta
         *  ~~~~~~~~~~~~~
         *  Extends for the first message package of 'Handshake' protocol.
         *
         * @param {mkm.protocol.Meta} meta
         * @param {dkd.protocol.Message|mk.type.Mapper} msg
         */
        setMeta: function (meta, msg) {
            msg.setMap('meta', meta);
        },
        getMeta: function (msg) {
            var meta = msg.getValue('meta');
            return Meta.parse(meta);
        },

        /**
         *  Sender's Visa
         *  ~~~~~~~~~~~~~
         *  Extends for the first message package of 'Handshake' protocol.
         *
         * @param {mkm.protocol.Visa} visa document
         * @param {dkd.protocol.Message|mk.type.Mapper} msg
         */
        setVisa: function (visa, msg) {
            msg.setMap('visa', visa);
        },
        getVisa: function (msg) {
            var visa = msg.getValue('visa');
            var doc = Document.parse(visa);
            if (Interface.conforms(doc, Visa)) {
                return doc;
            }
            return null;
        }
    };
    var MessageUtils = sdk.msg.MessageUtils;
