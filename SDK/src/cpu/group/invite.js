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

    var GroupCommand = ns.protocol.GroupCommand;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    var InviteCommandProcessor = function () {
        GroupCommandProcessor.call(this);
    };
    ns.Class(InviteCommandProcessor, GroupCommandProcessor, null);

    var call_reset = function (cmd, rMsg) {
        var gpu = GroupCommandProcessor.getProcessor(GroupCommand.RESET);
        gpu.setMessenger(this.getMessenger());
        return gpu.execute(cmd, rMsg);
    };

    InviteCommandProcessor.prototype.execute = function (cmd, rMsg) {
        var facebook = this.getFacebook();

        // 0. check group
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            // NOTICE: group membership lost?
            //         reset group members
            return call_reset.call(this, cmd, rMsg);
        }

        // 1. check permission
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            // not a member? check assistants
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + ' is not a member/assistant of group '
                    + group.toString() + ', cannot invite member.');
            }
        }

        // 2. inviting members
        var invites = this.getMembers(cmd);
        if (invites.length === 0) {
            throw new EvalError('invite command error: ' + cmd.getMap());
        }
        // 2.1. check for reset
        if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
            // NOTICE: owner invites owner?
            //         it means this should be a 'reset' command
            return call_reset.call(this, cmd, rMsg);
        }
        // 2.2. build invite list
        var adds = [];
        var item, pos;
        for (var i = 0; i < invites.length; ++i) {
            item = invites[i];
            pos = members.indexOf(item);
            if (pos >= 0) {
                // member already exist
                continue;
            }
            // got new member
            adds.push(item.toString());
            members.push(item);
        }
        // 2.3. do inviting
        if (adds.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue('added', adds);
            }
        }

        // 3. response (no need to response this group command)
        return null;
    };

    //-------- namespace --------
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;

    ns.cpu.group.registers('InviteCommandProcessor');

})(DIMSDK);
