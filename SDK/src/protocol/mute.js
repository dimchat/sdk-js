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

!function (ns) {
    'use strict';

    var Command = ns.protocol.Command;

    var MuteCommand = function (info) {
        var list = null;
        if (!info) {
            // create empty mute command
            info = MuteCommand.MUTE;
        } else if (info instanceof Array) {
            // create new command with mute-list
            list = info;
            info = MuteCommand.MUTE;
        }
        // create mute command
        Command.call(this, info);
        if (list) {
            this.setMuteCList(list);
        }
    };
    MuteCommand.inherits(Command);

    MuteCommand.MUTE = 'mute';

    //-------- setter/getter --------

    MuteCommand.prototype.getMuteCList = function () {
        return this.getValue('list');
    };
    MuteCommand.prototype.setMuteCList = function (list) {
        this.setValue('list', list);
    };

    //-------- register --------
    Command.register(MuteCommand.MUTE, MuteCommand);

    //-------- namespace --------
    ns.protocol.MuteCommand = MuteCommand;

}(DIMP);
