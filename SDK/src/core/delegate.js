;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

(function (ns) {
    'use strict';

    var Interface = ns.type.Interface;
    var ID        = ns.protocol.ID;

    /*  Situations:
                      +-------------+-------------+-------------+-------------+
                      |  receiver   |  receiver   |  receiver   |  receiver   |
                      |     is      |     is      |     is      |     is      |
                      |             |             |  broadcast  |  broadcast  |
                      |    user     |    group    |    user     |    group    |
        +-------------+-------------+-------------+-------------+-------------+
        |             |      A      |             |             |             |
        |             +-------------+-------------+-------------+-------------+
        |    group    |             |      B      |             |             |
        |     is      |-------------+-------------+-------------+-------------+
        |    null     |             |             |      C      |             |
        |             +-------------+-------------+-------------+-------------+
        |             |             |             |             |      D      |
        +-------------+-------------+-------------+-------------+-------------+
        |             |      E      |             |             |             |
        |             +-------------+-------------+-------------+-------------+
        |    group    |             |             |             |             |
        |     is      |-------------+-------------+-------------+-------------+
        |  broadcast  |             |             |      F      |             |
        |             +-------------+-------------+-------------+-------------+
        |             |             |             |             |      G      |
        +-------------+-------------+-------------+-------------+-------------+
        |             |      H      |             |             |             |
        |             +-------------+-------------+-------------+-------------+
        |    group    |             |      J      |             |             |
        |     is      |-------------+-------------+-------------+-------------+
        |    normal   |             |             |      K      |             |
        |             +-------------+-------------+-------------+-------------+
        |             |             |             |             |             |
        +-------------+-------------+-------------+-------------+-------------+
     */
    var getDestination = function (receiver, group) {
        if (!group && receiver.isGroup()) {
            /// Transform:
            ///     (B) => (J)
            ///     (D) => (G)
            group = receiver;
        }
        if (!group) {
            /// A : personal message (or hidden group message)
            /// C : broadcast message for anyone
            return receiver;
        }
        if (group.isBroadcast()) {
            /// E : unencrypted message for someone
            //      return group as broadcast ID for disable encryption
            /// F : broadcast message for anyone
            /// G : (receiver == group) broadcast group message
            return group;
        } else if (receiver.isBroadcast()) {
            /// K : unencrypted group message, usually group command
            //      return receiver as broadcast ID for disable encryption
            return receiver;
        } else {
            /// H    : group message split for someone
            /// J    : (receiver == group) non-split group message
            return group;
        }
    };

    var CipherKeyDelegate = Interface(null, null);

    /**
     *  Get destination for cipher key vector: (sender, dest)
     *
     * @param {Message|Mapper} msg
     * @return {ID}
     */
    CipherKeyDelegate.getDestinationForMessage = function (msg) {
        var group = ID.parse(msg.getValue('group'));
        return getDestination(msg.getReceiver(), group);
    };

    CipherKeyDelegate.getDestination = getDestination;

    /**
     *  Get cipher key for encrypt message from 'sender' to 'receiver'
     *
     * @param {ID} sender        - from where (user or contact ID)
     * @param {ID} receiver      - to where (contact or user/group ID)
     * @param {Boolean} generate - generate when key not exists
     * @return {SymmetricKey} cipher key
     */
    CipherKeyDelegate.prototype.getCipherKey = function (sender, receiver, generate) {};

    /**
     *  Cache cipher key for reusing, with the direction ('sender' => 'receiver')
     *
     * @param {ID} sender        - from where (user or contact ID)
     * @param {ID} receiver      - to where (contact or user/group ID)
     * @param {SymmetricKey} key - cipher key
     */
    CipherKeyDelegate.prototype.cacheCipherKey = function (sender, receiver, key) {};

    //-------- namespace --------
    ns.CipherKeyDelegate = CipherKeyDelegate;

})(DIMP);

