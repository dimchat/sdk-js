;
// license: https://mit-license.org
//
//  DIMP : Decentralized Instant Messaging Protocol
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
 *      command : "handshake",    // command name
 *      message : "Hello world!",
 *      session : "{SESSION_KEY}" // session key
 *  }
 */

//! require 'command.js'

!function (ns) {
    'use strict';

    var HandshakeState = ns.type.Enum(null, {
        INIT:    0,
        START:   1, // C -> S, without session key(or session expired)
        AGAIN:   2, // S -> C, with new session key
        RESTART: 3, // C -> S, with new session key
        SUCCESS: 4  // S -> C, handshake accepted
    });

    var Command = ns.protocol.Command;

    /**
     *  Create handshake command
     *
     * @param {{}|String} info - command info; or message text
     * @constructor
     */
    var HandshakeCommand = function (info) {
        var message = null;
        if (!info) {
            // create empty handshake command
            info = Command.HANDSHAKE;
        } else if (typeof info === 'string') {
            // create handshake command with message string
            message = info;
            info = Command.HANDSHAKE;
        }
        Command.call(this, info);
        if (message) {
            this.setMessage(message);
        }
    };
    ns.Class(HandshakeCommand, Command, null);

    //-------- setter/getter --------

    /**
     *  Get text
     *
     * @returns {String}
     */
    HandshakeCommand.prototype.getMessage = function () {
        return this.getValue('message');
    };
    HandshakeCommand.prototype.setMessage = function (text) {
        this.setValue('message', text);
    };

    /**
     *  Get session key
     *
     * @returns {String}
     */
    HandshakeCommand.prototype.getSessionKey = function () {
        return this.getValue('session');
    };
    HandshakeCommand.prototype.setSessionKey = function (session) {
        this.setValue('session', session);
    };

    /**
     *  Get state
     *
     * @returns {HandshakeState}
     */
    HandshakeCommand.prototype.getState = function () {
        var text = this.getMessage();
        var session = this.getSessionKey();
        if (!text) {
            return HandshakeState.INIT;
        }
        if (text === 'DIM?') {
            return HandshakeState.AGAIN;
        }
        if (text === 'DIM!' || text === 'OK!') {
            return HandshakeState.SUCCESS;
        }
        if (session) {
            return HandshakeState.RESTART;
        } else {
            return HandshakeState.START;
        }
    };

    //-------- factories --------

    var handshake = function (text, session) {
        var cmd = new HandshakeCommand(text);
        if (session) {
            cmd.setSessionKey(session);
        }
        return cmd;
    };

    HandshakeCommand.start = function () {
        return handshake('Hello world!');
    };
    HandshakeCommand.restart = function (session) {
        return handshake('Hello world!', session);
    };
    HandshakeCommand.again = function (session) {
        return handshake('DIM?', session);
    };
    HandshakeCommand.success = function () {
        return handshake('DIM!');
    };

    //-------- register --------
    Command.register(Command.HANDSHAKE, HandshakeCommand);

    //-------- namespace --------
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;

    ns.protocol.register('HandshakeCommand');
    ns.protocol.register('HandshakeState');

}(DIMP);
