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
//! require 'command.js'

!function (ns) {
    'use strict';

    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;

    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;

    /**
     *  Profile Command Processor
     */
    var ProfileCommandProcessor = function (messenger) {
        MetaCommandProcessor.call(this, messenger);
    };
    ns.type.Class(ProfileCommandProcessor, MetaCommandProcessor);

    // query profile for ID
    var get_profile = function (identifier) {
        var facebook = this.getFacebook();
        var profile = facebook.getProfile(identifier);
        if (!profile) {
            // profile not found
            var text = 'Sorry, profile not found for ID: ' + identifier;
            return new TextContent(text);
        }
        // response profile info
        return ProfileCommand.response(identifier, profile);
    };

    // received a profile for ID
    var put_profile = function (identifier, profile, meta) {
        var facebook = this.getFacebook();
        if (meta) {
            if (!facebook.verifyMeta(meta, identifier)) {
                // meta not match
                return new TextContent('Meta not match ID: ' + identifier);
            }
            if (!facebook.saveMeta(meta, identifier)) {
                // save meta failed
                return new TextContent('Meta not accept: ' + identifier);
            }
        }
        if (!facebook.verifyProfile(profile, identifier)) {
            // profile not match
            return new TextContent('Profile not match ID: ' + identifier);
        }
        if (!facebook.saveProfile(profile, identifier)) {
            // save profile failed
            return new TextContent('Profile not accept: ' + identifier);
        }
        // response receipt
        return new ReceiptCommand('Profile received: ' + identifier);
    };

    //
    //  Main
    //
    ProfileCommandProcessor.prototype.process = function (cmd, sender, msg) {
        var facebook = this.getFacebook();
        var identifier = cmd.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var profile = cmd.getProfile();
        if (profile) {
            var meta = cmd.getMeta();
            return put_profile.call(this, identifier, profile, meta);
        } else {
            return get_profile.call(this, identifier);
        }
    };

    //-------- register --------
    CommandProcessor.register(Command.PROFILE, ProfileCommandProcessor);

    //-------- namespace --------
    ns.cpu.ProfileCommandProcessor = ProfileCommandProcessor;

}(DIMP);
