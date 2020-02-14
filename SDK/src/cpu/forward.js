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
//! require 'content.js'

!function (ns) {
    'use strict';

    var ContentType = ns.protocol.ContentType;

    var ContentProcessor = ns.cpu.ContentProcessor;

    /**
     *  Forward Content Processor
     */
    var ForwardContentProcessor = function (messenger) {
        ContentProcessor.call(this, messenger);
    };
    ns.type.Class(ForwardContentProcessor, ContentProcessor);

    //
    //  Main
    //
    ForwardContentProcessor.prototype.process = function (content, sender, msg) {
        var rMsg = content.getMessage();
        // [Forward Protocol]
        // do it again to drop the wrapper,
        // the secret inside the content is the real message
        var sMsg = this.messenger.verifyMessage(rMsg);
        if (!sMsg) {
            // TODO: save this message in a queue to wait meta response
            //messenger.suspendMessage(rMsg);
            //throw Error('failed to verify message: ' + rMsg);
            return null;
        }
        return this.messenger.process(sMsg);

        // NOTICE: decrypt failed, not for you?
        //         check content type in subclass, if it's a 'forward' message,
        //         it means you are asked to re-pack and forward this message
        // TODO: override to catch the exception 'receiver error ...'
    };

    //-------- register --------
    ContentProcessor.register(ContentType.FORWARD, ForwardContentProcessor);

    //-------- namespace --------
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;

}(DIMP);
