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
//! require 'group.js'

!function (ns) {
    'use strict';

    var TextContent = ns.protocol.TextContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.InviteCommand;
    var ResetCommand = ns.protocol.ResetCommand;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    /**
     *  Query Group Command Processor
     */
    var QueryCommandProcessor = function (messenger) {
        GroupCommandProcessor.call(this, messenger);
    };
    QueryCommandProcessor.inherits(GroupCommandProcessor);

    //
    //  Main
    //
    QueryCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        // 1. check permission
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + ' is not a member/assistant of group: ' + group);
                }
            }
        }
        // 2. get members
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            var res = new TextContent('Sorry, members not found in group: ' + group);
            res.setGroup(group);
            return res;
        }
        // 3. respond
        var user = facebook.getCurrentUser();
        if (facebook.isOwner(user.identifier, group)) {
            return new ResetCommand(group, members);
        } else {
            return new InviteCommand(group, members);
        }
    };

    //-------- register --------
    GroupCommandProcessor.register(GroupCommand.QUERY, QueryCommandProcessor);

    //-------- namespace --------
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;

}(DIMP);
