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
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;

    /**
     *  CPU Creator
     *  ~~~~~~~~~~~
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     */
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {

        // Override
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // forward content
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger);
            }
            // array content
            if (ContentType.ARRAY.equals(type)) {
                return new ns.cpu.ArrayContentProcessor(facebook, messenger);
            }

            /*/
            // application customized
            if (ContentType.APPLICATION.equals(type)) {
                return new ns.cpu.CustomizedContentProcessor(facebook, messenger);
            } else if (ContentType.CUSTOMIZED.equals(type)) {
                return new ns.cpu.CustomizedContentProcessor(facebook, messenger);
            }
            /*/

            // default commands
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger);
            }
            /*/
            // default contents
            if (0 === type) {
                // must return a default processor for type==0
                return new ns.cpu.BaseContentProcessor(facebook, messenger);
            }
            /*/
            // unknown
            return null;
        },

        // Override
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            // meta command
            if (cmd === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger);
            } else if (cmd === Command.DOCUMENT) {
                return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
            }

            // unknown
            return null;
        }
    });

    //-------- namespace --------
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;

})(DIMP);
