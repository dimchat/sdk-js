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

    var ContentType = ns.protocol.ContentType;

    /**
     *  Content/Command Processing Units
     */
    var ContentProcessor = function (messenger) {
        this.messenger = messenger;
        // CPU pool (ContentType -> ContentProcessor)
        this.contentProcessors = {};
    };
    ns.type.Class(ContentProcessor);

    //
    //  Environment variables as context
    //
    ContentProcessor.prototype.getContext = function (key) {
        return this.messenger.getContext(key);
    };
    ContentProcessor.prototype.setContext = function (key, value) {
        this.messenger.setContext(key, value);
    };

    //
    //  Data source for getting entity info
    //
    ContentProcessor.prototype.getFacebook = function () {
        return this.messenger.getFacebook();
    };

    /**
     *  Main function for process message content
     *
     * @param content - content received
     * @param sender - sender ID
     * @param msg - instant message
     * @returns {Content|null} - responding to sender
     */
    ContentProcessor.prototype.process = function (content, sender, msg) {
        // process content by type
        var cpu = this.getCPU(content.type);
        // if (!cpu) {
        //     throw TypeError('failed to get CPU for content: ' + content);
        // } else if (cpu === this) {
        //     throw Error('Dead cycle!');
        // }
        return cpu.process(content, sender, msg);
    };

    //-------- Runtime --------

    ContentProcessor.prototype.getCPU = function (type) {
        // 1. get from pool
        var cpu = this.contentProcessors[type];
        if (cpu) {
            return cpu;
        }
        // 2. get CPU class by content type
        var clazz = cpu_classes[type];
        if (!clazz) {
            // default CPU
            clazz = cpu_classes[ContentType.UNKNOWN];
            // if (!clazz) {
            //     throw TypeError('failed to get CPU for content type: ' + type);
            // }
        }
        // 3. create CPU with messenger
        cpu = new clazz(this.messenger);
        this.contentProcessors[type] = cpu;
        return cpu;
    };

    var cpu_classes = {}; // ContentType -> Class

    ContentProcessor.register = function (type, clazz) {
        if (clazz) {
            cpu_classes[type] = clazz;
        } else {
            delete cpu_classes[type];
        }
    };

    //-------- namespace --------
    if (typeof ns.cpu !== 'object') {
        ns.cpu = {};
    }
    ns.cpu.ContentProcessor = ContentProcessor;

}(DIMP);
