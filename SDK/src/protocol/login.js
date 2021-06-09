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

(function (ns) {
    'use strict';

    var map = ns.type.Map;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var Station = ns.Station;

    /**
     *  Create login command
     *
     *  Usages:
     *      1. new LoginCommand(map);
     *      2. new LoginCommand(identifier);
     */
    var LoginCommand = function (info) {
        if (ns.Interface.conforms(info, ID)) {
            // new LoginCommand(identifier);
            Command.call(this, Command.LOGIN);
            this.setValue('ID', info.toString());
        } else {
            // new LoginCommand(map);
            Command.call(this, info);
        }
    };
    ns.Class(LoginCommand, Command, null);

    //-------- client info --------

    /**
     *  Get user ID
     *
     * @returns {ID}
     */
    LoginCommand.prototype.getIdentifier = function () {
        return ID.parse(this.getValue('ID'));
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
     * @returns {{String:Object}}
     */
    LoginCommand.prototype.getStation = function () {
        return this.getValue('station');
    };
    /**
     *  Set station info
     *
     * @param {{String:Object}} station
     */
    LoginCommand.prototype.setStation = function (station) {
        var info;
        if (station instanceof Station) {
            info = {
                'host': station.getHost(),
                'port': station.getPort(),
                'ID': station.identifier.toString()
            }
        } else if (ns.Interface.conforms(station, map)) {
            info = station.getMap();
        } else {
            info = station;
        }
        this.setValue('station', info);
    };

    /**
     *  Get provider info
     *
     * @returns {{String:Object}}
     */
    LoginCommand.prototype.getProvider = function () {
        return this.getValue('provider');
    };
    /**
     *  Set provider info
     *
     * @param {{String:Object}} provider
     */
    LoginCommand.prototype.setProvider = function (provider) {
        var info;
        if (provider instanceof ns.ServiceProvider) {
            info = {
                'ID': provider.identifier.toString()
            }
        } else if (ns.Interface.conforms(provider, ID)) {
            info = {
                'ID': provider.toString()
            }
        } else if (ns.Interface.conforms(provider, map)) {
            info = provider.getMap();
        } else {
            info = provider;
        }
        this.setValue('provider', info);
    };

    //-------- namespace --------
    ns.protocol.LoginCommand = LoginCommand;

    ns.protocol.registers('LoginCommand');

})(DIMSDK);
