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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ForwardContent = ns.protocol.ForwardContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;

    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(ForwardContentProcessor, BaseContentProcessor, null, {

        // Override
        process: function (content, rMsg) {
            var secrets = content.getSecrets();
            if (!secrets) {
                return null;
            }
            // call messenger to process it
            var messenger = this.getMessenger();
            var responses = [];  // List<Content>
            var res;             // Content
            var results;         // List<Content>
            for (var i = 0; i < secrets.length; ++i) {
                results = messenger.processReliableMessage(secrets[i]);
                if (!results) {
                    res = ForwardContent.create([]);
                } else if (results.length === 1) {
                    res = ForwardContent.create(results[0]);
                } else {
                    res = ForwardContent.create(results);
                }
                responses.push(res);
            }
            return responses;
        }
    });

    //-------- namespace --------
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;

})(DIMP);
