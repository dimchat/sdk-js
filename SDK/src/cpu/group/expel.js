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

    var GroupCommand = ns.protocol.GroupCommand;

    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;

    /**
     *  Expel Group Command Processor
     */
    var ExpelCommandProcessor = function (messenger) {
        GroupCommandProcessor.call(this, messenger);
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null);

    //
    //  Main
    //
    ExpelCommandProcessor.prototype.process = function (cmd, sender, iMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        // 1. check permission
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error('sender is not the owner/admin of group: ' + iMsg);
            }
        }
        // 1.2. get expelling members from command content
        var expelList = this.getMembers(cmd);
        if (!expelList || expelList.length === 0) {
            throw Error('Expel command error: ' + cmd);
        }
        // 2. do expel
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error('Group members not found: ' + group);
        }
        var removedList = [];
        var item;
        for (var i = 0; i < expelList.length; ++i) {
            item = expelList[i];
            if (members.indexOf(item) < 0) {
                // this user is not a member not
                continue;
            }
            // removing member found
            removedList.push(item);
            ns.type.Arrays.remove(members, item);
        }
        if (removedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                // save removed-list in command content
                cmd.setValue('removed', removedList);
            }
        }
        // 3. response (no need to response this group command)
        return null;
    };

    //-------- register --------
    GroupCommandProcessor.register(GroupCommand.EXPEL, ExpelCommandProcessor);

    //-------- namespace --------
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;

    ns.cpu.group.register('ExpelCommandProcessor');

}(DIMP);
