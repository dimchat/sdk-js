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

/**
 *  Command message: {
 *      type : 0x88,
 *      sn   : 123,
 *
 *      command : "mute",
 *      list    : []      // mute-list
 *  }
 */

//! require <dimp.js>

(function (ns) {
    'use strict';

    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;

    /**
     *  Create mute command
     *
     *  Usages:
     *      1. new MuteCommand();
     *      2. new MuteCommand(list);
     *      3. new MuteCommand(map);
     */
    var MuteCommand = function (info) {
        if (arguments.length === 0) {
            // new MuteCommand();
            Command.call(this, MuteCommand.MUTE)
            this.list = null;
        } else if (arguments[0] instanceof Array) {
            // new MuteCommand(list);
            Command.call(this, MuteCommand.MUTE)
            this.setBlockCList(arguments[0]);
        } else {
            // new MuteCommand(map);
            Command.call(this, arguments[0]);
            this.list = null;
        }
    };
    ns.Class(MuteCommand, Command, null);

    MuteCommand.MUTE = 'mute';

    MuteCommand.getMuteList = function (cmd) {
        var list = cmd['list'];
        if (list && list.length > 0) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    MuteCommand.setMuteList = function (list, cmd) {
        if (list && list.length > 0) {
            cmd['list'] = ID.revert(list);
        } else {
            delete cmd['list'];
        }
    };

    //-------- setter/getter --------

    MuteCommand.prototype.getMuteCList = function () {
        if (!this.list) {
            this.list = MuteCommand.getMuteList(this.getMap());
        }
        return this.list;
    };
    MuteCommand.prototype.setMuteCList = function (list) {
        MuteCommand.setMuteList(list, this.getMap());
        this.list = list;
    };

    //-------- namespace --------
    ns.protocol.MuteCommand = MuteCommand;

    ns.protocol.register('MuteCommand');

})(DIMP);
