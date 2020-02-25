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
 *      command : "block",
 *      list    : []      // block-list
 *  }
 */

//! require <dimp.js>

!function (ns) {
    'use strict';

    var Command = ns.protocol.Command;

    var BlockCommand = function (info) {
        var list = null;
        if (!info) {
            // create empty block command
            info = BlockCommand.BLOCK;
        } else if (info instanceof Array) {
            // create new command with block-list
            list = info;
            info = BlockCommand.BLOCK;
        }
        // create block command
        Command.call(this, info);
        if (list) {
            this.setBlockCList(list);
        }
    };
    ns.Class(BlockCommand, Command);

    BlockCommand.BLOCK = 'block';

    //-------- setter/getter --------

    BlockCommand.prototype.getBlockCList = function () {
        return this.getValue('list');
    };
    BlockCommand.prototype.setBlockCList = function (list) {
        this.setValue('list', list);
    };

    //-------- register --------
    Command.register(BlockCommand.BLOCK, BlockCommand);

    //-------- namespace --------
    ns.protocol.BlockCommand = BlockCommand;

}(DIMP);
