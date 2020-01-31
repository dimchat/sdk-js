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
//! require 'cpu/content.js'

!function (ns) {
    'use strict';

    var ForwardContent = ns.protocol.ForwardContent;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;

    var ContentProcessor = ns.cpu.ContentProcessor;

    var MessageProcessor = function (messenger) {
        this.messenger = messenger;
        this.cpu = null;
    };

    MessageProcessor.prototype.getFacebook = function () {
        return this.messenger.getFacebook();
    };

    // check whether group info empty
    var is_empty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        }
        var owner = facebook.getOwner(group);
        return owner === null;
    };

    // check whether need to update group
    var check_group = function (content, sender) {
        // Check if it is a group message,
        // and whether the group members info needs update
        var facebook = this.getFacebook();
        var group = facebook.getIdentifier(content.getGroup());
        if (!group || group.isBroadcast()) {
            // 1. personal message
            // 2. broadcast message
            return false;
        }
        // check meta for new group ID
        var meta = facebook.getMeta(group);
        if (!meta) {
            // NOTICE: if meta for group not found,
            //         facebook should query it from DIM network automatically
            // TODO: insert the message to a temporary queue to wait meta
            //throw new NullPointerException("group meta not found: " + group);
            return true;
        }
        // NOTICE: if the group info not found, and this is not an 'invite' command
        //         query group info from the sender
        var needsUpdate = is_empty.call(this, group);
        if (content instanceof InviteCommand) {
            // FIXME: can we trust this stranger?
            //        may be we should keep this members list temporary,
            //        and send 'query' to the owner immediately.
            // TODO: check whether the members list is a full list,
            //       it should contain the group owner(owner)
            needsUpdate = false;
        }
        if (needsUpdate) {
            var cmd = new QueryCommand(group);
            return this.messenger.sendContent(cmd, sender);
        }
        return false;
    };

    MessageProcessor.prototype.process = function (msg) {
        // verify
        var sMsg = this.messenger.verifyMessage(msg);
        if (!sMsg) {
            // TODO: save this message in a queue to wait meta response
            //throw new RuntimeException("failed to verify message: " + rMsg);
            return null;
        }
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        //
        //  1. check broadcast
        //
        if (receiver.getType().isGroup() && receiver.isBroadcast()) {
            // if it's a grouped broadcast ID, then
            //    split and deliver to everyone
            return this.messenger.broadcastMessage(msg);
        }
        //
        //  2. try to decrypt
        //
        var iMsg = this.messenger.decryptMessage(sMsg);
        if (!iMsg) {
            // cannot decrypt this message, not for you?
            // deliver to the receiver
            return this.messenger.deliverMessage(msg);
        }
        //
        //  3. check top-secret message
        //
        if (iMsg.content instanceof ForwardContent) {
            // it's asking you to forward it
            var secret = iMsg.content.getMessage();
            return this.messenger.forwardMessage(secret);
        }
        //
        //  4. check group
        //
        var sender = msg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        if (check_group.call(this, iMsg.content, sender)) {
            // save this message in a queue to wait group meta response
            this.messenger.suspendMessage(msg);
            return null;
        }
        //
        //  5. process
        //
        if (!this.cpu) {
            this.cpu = new ContentProcessor(this.messenger);
        }
        var response = this.cpu.process(iMsg.content, sender, iMsg);
        if (this.messenger.saveMessage(iMsg)) {
            return response;
        }
        // error
        return null;
    };

    //-------- namespace --------
    ns.MessageProcessor = MessageProcessor;

}(DIMP);
