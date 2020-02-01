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

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    /**
     *  Invite Command Processor
     */
    var InviteCommandProcessor = function (messenger) {
        GroupCommandProcessor.call(this, messenger);
    };
    InviteCommandProcessor.inherits(GroupCommandProcessor);

    // check whether this is a Reset command
    var is_reset = function (inviteList, sender, group) {
        var facebook = this.getFacebook();
        // NOTICE: owner invite owner?
        //         it's a Reset command!
        if (this.containsOwner(inviteList, group)) {
            return facebook.isOwner(sender, group);
        }
        return false;
    };

    var reset = function (cmd, sender, msg) {
        var cpu = this.getCPU(GroupCommand.RESET);
        // console.assert(cpu !== null, 'reset CPU not register yet');
        return cpu.process(cmd, sender, msg);
    };

    var invite = function (inviteList, group) {
        var facebook = this.getFacebook();
        // existed members
        var members = facebook.getMembers(group);
        if (!members) {
            members = [];
        }
        // added list
        var addedList = [];
        var item;
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (members.contains(item)) {
                continue;
            }
            // adding member found
            addedList.push(item);
            members.push(item);
        }
        if (addedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                return addedList;
            }
        }
        return null;
    };

    //
    //  Main
    //
    InviteCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        // 0. check whether group info empty
        if (this.isEmpty(group)) {
            // NOTICE:
            //     group membership lost?
            //     reset group members
            return reset.call(this, cmd, sender, msg);
        }
        // 1. check permission
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + ' is not a member of group: ' + group);
                }
            }
        }
        // 1.2. get inviting members
        var inviteList = this.getMembers(cmd);
        if (!inviteList || inviteList.length === 0) {
            throw Error('Invite command error: ' + cmd);
        }
        // 1.3. check for reset
        if (is_reset.call(this, inviteList, sender, group)) {
            // NOTICE: owner invites owner?
            //         it means this should be a 'reset' command
            return reset.call(this, cmd, sender, msg);
        }
        // 2. do invite (get invited-list)
        var added = invite.call(this, inviteList, group);
        if (added) {
            cmd.setValue('added', added);
        }
        // 3. response (no need to response this group command)
        return null;
    };

    //-------- register --------
    GroupCommandProcessor.register(GroupCommand.INVITE, InviteCommandProcessor);

    //-------- namespace --------
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;

}(DIMP);
