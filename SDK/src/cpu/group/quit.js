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
     *  Quit Group Command Processor
     */
    var QuitCommandProcessor = function (messenger) {
        GroupCommandProcessor.call(this, messenger);
    };
    ns.type.Class(QuitCommandProcessor, GroupCommandProcessor);

    //
    //  Main
    //
    QuitCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        // 1. check permission
        if (facebook.isOwner(sender, group)) {
            throw Error('owner cannot quit: ' + sender + ', ' + group);
        }
        if (facebook.existsAssistant(sender, group)) {
            throw Error('assistant cannot quit: ' + sender + ', ' + group);
        }
        // 2. do quit (remove the sender from group members)
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error('Group members not found: ' + group);
        }
        if (members.indexOf(sender) < 0) {
            // throw Error('sender (' + sender + ') is not a member of group: ' + group);
            return;
        }
        ns.type.Arrays.remove(members, sender);
        facebook.saveMembers(members, group);
        // 3. response (no need to response this group command)
        return null;
    };

    //-------- register --------
    GroupCommandProcessor.register(GroupCommand.QUIT, QuitCommandProcessor);

    //-------- namespace --------
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;

}(DIMP);
