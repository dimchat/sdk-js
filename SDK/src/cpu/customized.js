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

//! require 'base.js'

    /**
     *  Handler for Customized Content
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    sdk.cpu.CustomizedContentHandler = Interface(null, null);
    var CustomizedContentHandler = sdk.cpu.CustomizedContentHandler;

    /**
     *  Do your job
     *
     * @param {string} act                - action name
     * @param {ID} sender                 - user ID
     * @param {CustomizedContent} content - customized content
     * @param {ReliableMessage} rMsg      - network message
     * @return {Content[]} responses
     */
    CustomizedContentHandler.prototype.handleAction = function (act, sender, content, rMsg) {};


    sdk.cpu.BaseCustomizedHandler = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    var BaseCustomizedHandler = sdk.cpu.BaseCustomizedHandler;

    Class(BaseCustomizedHandler, TwinsHelper, [CustomizedContentHandler], null);

    // Override
    BaseCustomizedHandler.prototype.handleAction = function (act, sender, content, rMsg) {
        var app = content.getApplication();
        var mod = content.getModule();
        var text = 'Content not support.';
        return this.respondReceipt(text, content, rMsg.getEnvelope(), {
            'template': 'Customized content (app: ${app}, mod: ${mod}, act: ${act}) not support yet!',
            'replacements': {
                'app': app,
                'mod': mod,
                'act': act
            }
        });
    };

    //
    //  Convenient responding
    //

    // protected
    BaseCustomizedHandler.prototype.respondReceipt = function (text, envelope, content, extra) {
        return [
            // create base receipt command with text & original envelope
            BaseContentProcessor.createReceipt(text, envelope, content, extra)
        ];
    };


    /**
     *  Customized Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    sdk.cpu.CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
        this.__defaultHandler = this.createDefaultHandler(facebook, messenger);
    };
    var CustomizedContentProcessor = sdk.cpu.CustomizedContentProcessor;

    Class(CustomizedContentProcessor, BaseContentProcessor, [CustomizedContentHandler], null);

    /**
     *  Create default customized handler
     *
     * @param {Facebook} facebook
     * @param {Messenger} messenger
     * @return {CustomizedContentHandler}
     */
    // protected
    CustomizedContentProcessor.prototype.createDefaultHandler = function (facebook, messenger) {
        return new BaseCustomizedHandler(facebook, messenger);
    };

    // protected
    CustomizedContentProcessor.prototype.getDefaultHandler = function () {
        return this.__defaultHandler;
    };

    // Override
    CustomizedContentProcessor.prototype.processContent = function (content, rMsg) {
        // get handler for 'app' & 'mod'
        var app = content.getApplication();
        var mod = content.getModule();
        var handler = this.filter(app, mod, content, rMsg);
        // handle the action
        var act = content.getAction();
        var sender = rMsg.getSender();
        return handler.handleAction(act, sender, content, rMsg);
    };

    // protected
    CustomizedContentProcessor.prototype.filter = function (app, mod, content, rMsg) {
        // if the application has too many modules, I suggest you to
        // use different handler to do the jobs for each module.
        return this.getDefaultHandler();
    };
