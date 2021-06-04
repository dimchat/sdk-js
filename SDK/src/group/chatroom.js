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

!function (ns) {
    'use strict';

    var Group = ns.Group;

    /**
     *  Big group with admins
     */
    var Chatroom = function (identifier) {
        Group.call(this, identifier);
    };
    ns.Class(Chatroom, Group, null);

    Chatroom.prototype.getAdmins = function () {
        return this.getDataSource().getAdmins(this.identifier);
    };

    /**
     *  This interface is for getting information for chatroom
     *  Chatroom admins should be set complying with the consensus algorithm
     */
    var ChatroomDataSource = function () {
    };
    ns.Interface(ChatroomDataSource, [Group.DataSource]);

    /**
     *  Get all admins in the chatroom
     *
     * @returns {ID[]}
     */
    ChatroomDataSource.prototype.getAdmins = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    Chatroom.DataSource = ChatroomDataSource;

    //-------- namespace --------
    ns.Chatroom = Chatroom;

    ns.register('Chatroom');

}(DIMP);
