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
    ns.Class(ContentProcessor, ns.type.Object, null);

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
     * @param {Content} content - content received
     * @param {ID} sender
     * @param {ReliableMessage} msg
     * @returns {Content} - responding to sender
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

    /**
     *  Get/create content processor with content type
     *
     * @param {ContentType} type
     * @returns {ContentProcessor}
     */
    ContentProcessor.prototype.getCPU = function (type) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf();
        } else {
            value = type;
        }
        // 1. get from pool
        var cpu = this.contentProcessors[value];
        if (cpu) {
            return cpu;
        }
        // 2. get CPU class by content type
        var clazz = cpu_classes[value];
        if (!clazz) {
            if (ContentType.UNKNOWN.equals(value)) {
                throw TypeError('default CPU not register yet');
            }
            // call default CPU
            return this.getCPU(ContentType.UNKNOWN);
        }
        // 3. create CPU with messenger
        cpu = new clazz(this.messenger);
        this.contentProcessors[value] = cpu;
        return cpu;
    };

    var cpu_classes = {}; // int -> Class

    /**
     *  Register content processor class with content type
     *
     * @param {ContentType} type
     * @param {Class} clazz
     */
    ContentProcessor.register = function (type, clazz) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf();
        } else {
            value = type;
        }
        if (clazz) {
            cpu_classes[value] = clazz;
        } else {
            delete cpu_classes[value];
        }
    };

    //-------- namespace --------
    if (typeof ns.cpu !== 'object') {
        ns.cpu = {};
    }
    ns.Namespace(ns.cpu);

    ns.cpu.ContentProcessor = ContentProcessor;

    ns.cpu.register('ContentProcessor')

}(DIMP);
