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

//! require 'base.js'

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;

    var CustomizedContentHandler = Interface(null, null);

    /**
     *  Do your job
     *
     * @param {string} act                - action name
     * @param {ID} sender                 - user ID
     * @param {CustomizedContent} content - customized content
     * @param {ReliableMessage} rMsg      - network message
     * @return {Content[]} responses
     */
    CustomizedContentHandler.prototype.handleAction = function (act, sender, content, rMsg) {
        throw new Error('NotImplemented');
    };

    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(CustomizedContentProcessor, BaseContentProcessor, [CustomizedContentHandler], {

        // Override
        process: function (content, rMsg) {
            // 1. check app id
            var app = content.getApplication();
            var res = this.filterApplication(app, content, rMsg);
            if (res) {
                // app id not found
                return res;
            }
            // 2. get handler with module name
            var mod = content.getModule();
            var handler = this.fetchHandler(mod, content, rMsg);
            if (!handler) {
                // module not support
                return null;
            }
            // 3. do the job
            var act = rMsg.getAction();
            var sender = rMsg.getSender();
            return handler.handleAction(act, sender, content, rMsg);
        },

        /**
         *  Check App ID
         *
         * @param {String} app                  - App ID
         * @param {CustomizedContent|*} content - customized content
         * @param {ReliableMessage} rMsg        - network message
         * @return {Content[]} responses when app not match
         */
        // protected: override for your application
        filterApplication: function (app, content, rMsg) {
            var text = 'Customized Content (app: ' + app + ') not support yet!';
            return this.respondText(text, content.getGroup());
        },

        /**
         *  Check Module
         *
         * @param {String} mod                  - module name
         * @param {CustomizedContent|*} content - customized content
         * @param {ReliableMessage} rMsg        - network message
         * @return {CustomizedContentHandler} handler
         */
        // protected: override for your module
        fetchHandler: function (mod, content, rMsg) {
            // if the application has too many modules, I suggest you to
            // use different handler to do the jobs for each module.
            return this;
        },

        // Override
        handleAction: function (act, sender, content, rMsg) {
            var app = content.getApplication();
            var mod = content.getModule();
            var text = 'Customized Content (app: ' + app + ', mod: ' + mod + ', act: ' + act + ') not support yet!';
            return this.respondText(text, content.getGroup());
        }
    });

    //-------- namespace --------
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor;

})(DIMP);
