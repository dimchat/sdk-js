'use strict';
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

//! require 'dkd/proc.js'
//! require 'twins.js'

    /**
     *  Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    sdk.cpu.BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;

    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);

    // Override
    BaseContentProcessor.prototype.processContent = function (content, rMsg) {
        var text = 'Content not support.';
        return this.respondReceipt(text, rMsg.getEnvelope(), content, {
            'template': 'Content (type: ${type}) not support yet!',
            'replacements': {
                'type': content.getType()
            }
        });
    };

    //
    //  Convenient responding
    //

    // protected
    BaseContentProcessor.prototype.respondReceipt = function (text, envelope, content, extra) {
        return [
            BaseContentProcessor.createReceipt(text, envelope, content, extra)
        ];
    };

    /**
     *  Receipt command with text, original envelope, serial number & group
     *
     * @param {string} text     - respond message
     * @param {Envelope} envelope - original message envelope
     * @param {Content} content  - original message content
     * @param {*} extra    - extra info
     * @return {ReceiptCommand}
     */
    BaseContentProcessor.createReceipt = function (text, envelope, content, extra) {
        // create base receipt command with text, original envelope, serial number & group ID
        var res = ReceiptCommand.create(text, envelope, content);
        // add extra key-values
        if (extra) {
            Mapper.addAll(res, extra);
        }
        return res;
    };

    /**
     *  Command Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    sdk.cpu.BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;

    Class(BaseCommandProcessor, BaseContentProcessor, null, {

        // Override
        processContent: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Command (name: ${command}) not support yet!',
                'replacements': {
                    'command': content.getCmd()
                }
            });
        }
    });
