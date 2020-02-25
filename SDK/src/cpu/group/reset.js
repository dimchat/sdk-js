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
     *  Reset Group Command Processor
     */
    var ResetCommandProcessor = function (messenger) {
        GroupCommandProcessor.call(this, messenger);
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null);

    // temporary save
    var save = function (newMembers, sender, group) {
        if (!this.containsOwner(newMembers, group)) {
            // NOTICE: this is a partial member-list
            //         query the sender for full-list
            return GroupCommand.query(group);
        }
        // it's a full list, save it now
        var facebook = this.getFacebook();
        if (facebook.saveMembers(newMembers, group)) {
            var owner = facebook.getOwner(group);
            if (owner && !owner.equals(sender)) {
                // NOTICE: to prevent counterfeit,
                //         query the owner for newest member-list
                var cmd = GroupCommand.query(group);
                this.messenger.sendContent(cmd, owner, null, false);
            }
        }
        // response (no need to response this group command)
        return null;
    };

    var reset = function (newMembers, group) {
        var facebook = this.getFacebook();
        // existed members
        var oldMembers = facebook.getMembers(group);
        if (!oldMembers) {
            oldMembers = [];
        }
        // removed list
        var removedList = [];
        var i, item;
        for (i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.indexOf(item) >= 0) {
                continue;
            }
            // removing member found
            removedList.push(item);
        }
        // added list
        var addedList = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) >= 0) {
                continue;
            }
            // adding member found
            addedList.push(item);
        }
        var result = {};
        if (addedList.length > 0 || removedList.length > 0) {
            if (!facebook.saveMembers(newMembers, group)) {
                // throw Error('failed to update new members for group: ' + group);
                return result;
            }
            if (addedList.length > 0) {
                result['added'] = addedList;
            }
            if (removedList.length > 0) {
                result['removed'] = removedList;
            }
        }
        return result;
    };

    //
    //  Main
    //
    ResetCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        // new members
        var newMembers = this.getMembers(cmd);
        if (!newMembers || newMembers.length === 0) {
            throw Error('Reset group command error: ' + cmd);
        }
        // 0. check whether group info empty
        if (this.isEmpty(group)) {
            // FIXME: group info lost?
            // FIXME: how to avoid strangers impersonating group member?
            return save.call(this, newMembers, sender, group);
        }
        // 1. check permission
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error('sender is not the owner/admin of group: ' + msg);
            }
        }
        // 2. do reset
        var result = reset.call(this, newMembers, group);
        var added = result['added'];
        if (added) {
            cmd.setValue('added', added);
        }
        var removed = result['removed'];
        if (removed) {
            cmd.setValue('removed', removed);
        }
        // 3. response (no need to response this group command)
        return null;
    };

    //-------- register --------
    GroupCommandProcessor.register(GroupCommand.RESET, ResetCommandProcessor);

    //-------- namespace --------
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;

    ns.cpu.group.register('ResetCommandProcessor');

}(DIMP);
