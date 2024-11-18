;
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

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Meta      = ns.protocol.Meta;
    var Document  = ns.protocol.Document;
    var Visa      = ns.protocol.Visa;

    /**
     *  Sender's Meta
     *  ~~~~~~~~~~~~~
     *  Extends for the first message package of 'Handshake' protocol.
     *
     * @param {Meta} meta
     * @param {Message|Mapper} msg
     */
    var setMeta = function (meta, msg) {
        msg.setMap('meta', meta);
    };
    var getMeta = function (msg) {
        var meta = msg.getValue('meta');
        return Meta.parse(meta);
    };

    /**
     *  Sender's Visa
     *  ~~~~~~~~~~~~~
     *  Extends for the first message package of 'Handshake' protocol.
     *
     * @param {Visa} visa document
     * @param {Message|Mapper} msg
     */
    var setVisa = function (visa, msg) {
        msg.setMap('visa', visa);
    };
    var getVisa = function (msg) {
        var visa = msg.getValue('visa');
        var doc = Document.parse(visa);
        if (Interface.conforms(doc, Visa)) {
            return doc;
        }
        return null;
    };

    //-------- namespace --------
    ns.msg.MessageHelper = {

        getMeta: getMeta,
        setMeta: setMeta,

        getVisa: getVisa,
        setVisa: setVisa
    };

})(DIMP);
