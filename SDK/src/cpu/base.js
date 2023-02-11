;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2022 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require 'content.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;

    /**
     *  Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);

    // Override
    BaseContentProcessor.prototype.process = function (content, rMsg) {
        var text = 'Content (type: ' + content.getType() + ') not support yet!';
        return this.respondText(text, content.getGroup());
    };

    // protected
    BaseContentProcessor.prototype.respondText = function (text, group) {
        var res = new ns.dkd.BaseTextContent(text);
        if (group) {
            res.setGroup(group);
        }
        return [res];
    };

    /**
     *  Command Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        // Override
        process: function (cmd, rMsg) {
            var text = 'Command (name: ' + cmd.getCmd() + ') not support yet!';
            return this.respondText(text, cmd.getGroup());
        }
    });

    //-------- namespace --------
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor;

})(DIMP);
