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
//! require 'history.js'

!function (ns) {
    'use strict';

    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;

    /**
     *  Group Command Processor
     */
    var GroupCommandProcessor = function (messenger) {
        HistoryCommandProcessor.call(this, messenger);
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null);

    // convert String list to ID list
    var convert_id_list = function (list) {
        var facebook = this.getFacebook();
        var array = [];
        var identifier;
        for (var i = 0; i < list.length; ++i) {
            identifier = facebook.getIdentifier(list[i]);
            if (!identifier) {
                // throw Error('Member ID error: ' + list[i]);
                continue;
            }
            array.push(identifier);
        }
        return array;
    };

    GroupCommandProcessor.prototype.getMembers = function (cmd) {
        var members = cmd.getMembers();
        if (!members) {
            var member = cmd.getMember();
            if (!member) {
                return null;
            }
            members = [member];
        }
        return convert_id_list.call(this, members);
    };

    // check whether the list contains owner
    GroupCommandProcessor.prototype.containsOwner = function (members, group) {
        var facebook = this.getFacebook();
        var identifier;
        for (var i = 0; i < members.length; ++i) {
            identifier = facebook.getIdentifier(members[i]);
            if (facebook.isOwner(identifier, group)) {
                return true;
            }
        }
        return false;
    };

    // check whether the group info is empty(lost)
    GroupCommandProcessor.prototype.isEmpty = function (group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true;
        }
        var owner = facebook.getOwner(group);
        return !owner;
    };

    //
    //  Main
    //
    GroupCommandProcessor.prototype.process = function (cmd, sender, msg) {
        // process command content by name
        var name = cmd.getCommand();
        var cpu = this.getCPU(name);
        // if (!cpu) {
        //     var res = new TextContent('Group command ('+ name + ') not support yet!');
        //     res.setGroup(cmd.getGroup());
        //     return res;
        // }
        return cpu.process(cmd, sender, msg);
    };

    //-------- Runtime --------
    GroupCommandProcessor.register = function (command, clazz) {
        HistoryCommandProcessor.register.call(this, command, clazz);
    };

    //-------- namespace --------
    if (typeof ns.cpu.group !== 'object') {
        ns.cpu.group = {};
    }
    ns.Namespace(ns.cpu.group);

    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;

    ns.cpu.register('GroupCommandProcessor');

}(DIMP);
