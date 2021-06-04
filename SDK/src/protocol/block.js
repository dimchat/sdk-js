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

    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;

    /**
     *  Create block command
     *
     *  Usages:
     *      1. new BlockCommand();
     *      2. new BlockCommand(list);
     *      3. new BlockCommand(map);
     */
    var BlockCommand = function () {
        if (arguments.length === 0) {
            // new BlockCommand();
            Command.call(this, BlockCommand.BLOCK)
            this.list = null;
        } else if (arguments[0] instanceof Array) {
            // new BlockCommand(list);
            Command.call(this, BlockCommand.BLOCK)
            this.setBlockCList(arguments[0]);
        } else {
            // new BlockCommand(map);
            Command.call(this, arguments[0]);
            this.list = null;
        }
    };
    ns.Class(BlockCommand, Command, null);

    BlockCommand.BLOCK = 'block';

    BlockCommand.getBlockList = function (cmd) {
        var list = cmd['list'];
        if (list && list.length > 0) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    BlockCommand.setBlockList = function (list, cmd) {
        if (list && list.length > 0) {
            cmd['list'] = ID.revert(list);
        } else {
            delete cmd['list'];
        }
    };

    //-------- setter/getter --------

    BlockCommand.prototype.getBlockCList = function () {
        if (!this.list) {
            this.list = BlockCommand.getBlockList(this.getMap());
        }
        return this.list;
    };
    BlockCommand.prototype.setBlockCList = function (list) {
        BlockCommand.setBlockList(list, this.getMap());
        this.list = list;
    };

    //-------- namespace --------
    ns.protocol.BlockCommand = BlockCommand;

    ns.protocol.register('BlockCommand');

}(DIMP);
