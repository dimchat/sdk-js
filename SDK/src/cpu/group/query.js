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

//! require 'group.js'

(function (ns) {
    'use strict';

    var TextContent = ns.protocol.TextContent;
    var InviteCommand = ns.protocol.InviteCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    var QueryCommandProcessor = function () {
        GroupCommandProcessor.call(this);
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null);

    // @Override
    QueryCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var facebook = this.getFacebook();

        // 0. check group
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            var text = 'Sorry, members not found in group: ' + group.toString();
            var res = new TextContent(text);
            res.setGroup(group);
            return res;
        }

        // 1. check permission
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            // not a member? check assistants
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + ' is not a member/assistant of group '
                    + group.toString() + ', cannot query.');
            }
        }

        // 2. respond
        var user = facebook.getCurrentUser();
        if (owner.equals(user.identifier)) {
            return new ResetCommand(group, members);
        } else {
            return new InviteCommand(group, members);
        }
    };

    //-------- namespace --------
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;

    ns.cpu.group.register('QueryCommandProcessor');

})(DIMP);
