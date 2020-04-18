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
 *      command : "login",
 *      time    : 0,
 *      //---- client info ----
 *      ID       : "{UserID}",
 *      device   : "DeviceID",  // (optional)
 *      agent    : "UserAgent", // (optional)
 *      //---- server info ----
 *      station  : {
 *          ID   : "{StationID}",
 *          host : "{IP}",
 *          port : 9394
 *      },
 *      provider : {
 *          ID   : "{SP_ID}"
 *      }
 *  }
 */

//! require 'command.js'

!function (ns) {
    'use strict';

    var Dictionary = ns.type.Dictionary;

    var ID = ns.ID;

    var Command = ns.protocol.Command;

    /**
     *  Create login command
     *
     * @param {{}|ID} info - command info; or user ID
     * @constructor
     */
    var LoginCommand = function (info) {
        var identifier = null;
        var time = null;
        if (!info) {
            // create empty login command
            time = new Date();
            info = Command.LOGIN;
        } else if (info instanceof ID) {
            // create login command with user ID
            identifier = info;
            time = new Date();
            info = Command.LOGIN;
        }
        Command.call(this, info);
        if (identifier) {
            this.setIdentifier(identifier);
        }
        if (time) {
            this.setTime(time);
        }
    };
    ns.Class(LoginCommand, Command, null);

    //-------- setter/getter --------

    /**
     *  Command time
     *
     * @returns {Date}
     */
    LoginCommand.prototype.getTime = function () {
        var time = this.getValue('time');
        if (time) {
            return new Date(time * 1000);
        } else {
            return null;
        }
    };
    LoginCommand.prototype.setTime = function (time) {
        if (!time) {
            // get current time
            time = new Date();
        }
        if (time instanceof Date) {
            // set timestamp in seconds
            this.setValue('time', time.getTime() / 1000);
        } else if (typeof time === 'number') {
            this.setValue('time', time);
        } else {
            throw TypeError('time error: ' + time);
        }
    };

    //-------- client info --------

    /**
     *  Get user ID
     *
     * @returns {ID|String}
     */
    LoginCommand.prototype.getIdentifier = function () {
        return this.getValue('ID');
    };
    /**
     *  Set user ID
     *
     * @param {ID} identifier
     */
    LoginCommand.prototype.setIdentifier = function (identifier) {
        this.setValue('ID', identifier);
    };

    /**
     *  Get device ID
     *
     * @returns {String}
     */
    LoginCommand.prototype.getDevice = function () {
        return this.getValue('device');
    };
    /**
     *  Set device ID
     *
     * @param {String} device
     */
    LoginCommand.prototype.setDevice = function (device) {
        this.setValue('device', device);
    };

    /**
     *  Get user agent
     *
     * @returns {String}
     */
    LoginCommand.prototype.getAgent = function () {
        return this.getValue('agent');
    };
    /**
     *  Set user agent
     *
     * @param {String} UA
     */
    LoginCommand.prototype.setAgent = function (UA) {
        this.setValue('agent', UA);
    };

    //-------- server info --------

    /**
     *  Get station info
     *
     * @returns {map}
     */
    LoginCommand.prototype.getStation = function () {
        return this.getValue('station');
    };
    /**
     *  Set station info
     *
     * @param {*} station
     */
    LoginCommand.prototype.setStation = function (station) {
        var info;
        if (station instanceof ns.Station) {
            info = {
                'host': station.host,
                'port': station.port,
                'ID': station.identifier
            }
        } else if (station instanceof Dictionary) {
            info = station.getMap(false);
        } else {
            info = station;
        }
        this.setValue('station', info);
    };

    /**
     *  Get provider info
     *
     * @returns {map}
     */
    LoginCommand.prototype.getProvider = function () {
        return this.getValue('provider');
    };
    /**
     *  Set provider info
     *
     * @param {*} provider
     */
    LoginCommand.prototype.setProvider = function (provider) {
        var info;
        if (provider instanceof ns.ServiceProvider) {
            info = {
                'ID': provider.identifier
            }
        } else if (provider instanceof ID) {
            info = {
                'ID': provider
            }
        } else if (provider instanceof Dictionary) {
            info = provider.getMap(false);
        } else {
            info = provider;
        }
        this.setValue('provider', info);
    };

    //-------- register --------
    Command.register(Command.LOGIN, LoginCommand);

    //-------- namespace --------
    ns.protocol.LoginCommand = LoginCommand;

    ns.protocol.register('LoginCommand');

}(DIMP);
