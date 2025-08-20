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

//! require 'namespace.js'

    /**
     *  Content Processing Unit
     *  ~~~~~~~~~~~~~~~~~~~~~~~
     */
    sdk.cpu.ContentProcessor = Interface(null, null);
    var ContentProcessor = sdk.cpu.ContentProcessor;

    /**
     *  Process message content
     *
     * @param {Content} content      - content received
     * @param {ReliableMessage} rMsg - reliable message
     * @returns {Content[]} responses to sender
     */
    ContentProcessor.prototype.processContent = function (content, rMsg) {};

    /**
     *  CPU Creator
     *  ~~~~~~~~~~~
     */
    ContentProcessor.Creator = Interface(null, null);
    var ContentProcessorCreator = ContentProcessor.Creator;

    /**
     *  Create content processor with type
     *
     * @param {string} type - content type
     * @return {ContentProcessor}
     */
    ContentProcessorCreator.prototype.createContentProcessor = function (type) {};

    /**
     *  Create command processor with type & name
     *
     * @param {string} type - content type
     * @param {string} cmd  - command name
     * @return {ContentProcessor}
     */
    ContentProcessorCreator.prototype.createCommandProcessor = function (type, cmd) {};

    /**
     *  CPU Factory
     *  ~~~~~~~~~~~
     */
    ContentProcessor.Factory = Interface(null, null);
    var ContentProcessorFactory = ContentProcessor.Factory;

    /**
     *  Get content processor with message content
     *
     * @param {Content} content - message content
     * @return {ContentProcessor}
     */
    ContentProcessorFactory.prototype.getContentProcessor = function (content) {};

    /**
     *  Get content processor with message type
     *
     * @param {ContentType|uint} type - content type
     * @return {ContentProcessor}
     */
    ContentProcessorFactory.prototype.getContentProcessorForType = function (type) {};
