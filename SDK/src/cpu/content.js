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

    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var TextContent = ns.protocol.TextContent;

    /**
     *  Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    var ContentProcessor = function () {
        this.__messenger = null;
    };
    ns.Class(ContentProcessor, ns.type.Object, null);

    ContentProcessor.prototype.getMessenger = function () {
        return this.__messenger;
    };
    ContentProcessor.prototype.setMessenger = function (messenger) {
        this.__messenger = messenger;
    };

    ContentProcessor.prototype.getFacebook = function () {
        return this.getMessenger().getFacebook();
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Process message content
     *
     * @param {Content} content      - content received
     * @param {ReliableMessage} rMsg - reliable message
     * @returns {Content} response to sender
     */
    ContentProcessor.prototype.process = function (content, rMsg) {
        var text = 'Content (type: ' + content.getType() + ') not support yet!';
        var res = new TextContent(text)
        // check group
        var group = content.getGroup();
        if (group) {
            res.setGroup(group);
        }
        return res;
    };

    //
    //  CPU factories
    //
    var contentProcessors = {};  // uint(ContentType) -> ContentProcessor

    /**
     *  Get content processor with content type
     *
     * @param {Content|ContentType|uint} info
     * @returns {ContentProcessor}
     */
    ContentProcessor.getProcessor = function (info) {
        if (ns.Interface.conforms(info, Content)) {
            return contentProcessors[info.getType()];
        } else if (info instanceof ContentType) {
            return contentProcessors[info.valueOf()];
        } else {
            return contentProcessors[info];
        }
    };

    /**
     *  Register content processor class with content type
     *
     * @param {ContentType|uint} type
     * @param {ContentProcessor} cpu
     */
    ContentProcessor.register = function (type, cpu) {
        if (type instanceof ContentType) {
            contentProcessors[type.valueOf()] = cpu;
        } else {
            contentProcessors[type] = cpu;
        }
    };

    //-------- namespace --------
    ns.cpu.ContentProcessor = ContentProcessor;

    ns.cpu.register('ContentProcessor')

})(DIMP);
