;
// license: https://mit-license.org
//
//  LNC : Log & Notification Center
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

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Interface = sys.type.Interface;
    var Class     = sys.type.Class;
    var Enum      = sys.type.Enum;

    var   debugFlag = 1 << 0;
    var    infoFlag = 1 << 1;
    var warningFlag = 1 << 2;
    var   errorFlag = 1 << 3;

    var LogLevel = Enum('LogLevel', {
        DEBUG: debugFlag|infoFlag|warningFlag|errorFlag,
        DEVELOP:         infoFlag|warningFlag|errorFlag,
        RELEASE:                  warningFlag|errorFlag
    });

    var check_level = function (flag) {
        return shared.level & flag;
    };

    /**
     *  Log Interface
     *  ~~~~~~~~~~~~~
     */
    var Log = {

        debug: function (...data) {
            if (check_level(debugFlag)) {
                shared.logger.debug.apply(shared.logger, arguments);
            }
        },

        info: function (...data) {
            if (check_level(infoFlag)) {
                shared.logger.info.apply(shared.logger, arguments);
            }
        },

        warning: function (...data) {
            if (check_level(warningFlag)) {
                shared.logger.warning.apply(shared.logger, arguments);
            }
        },

        error: function (...data) {
            if (check_level(errorFlag)) {
                shared.logger.error.apply(shared.logger, arguments);
            }
        },

        showTime: false
    };

    /**
     *  Set log level
     *
     * @param {uint|LogLevel|*} level
     */
    Log.setLevel = function (level) {
        if (Enum.isEnum(level)) {
            level = level.getValue();
        }
        shared.level = level;
    };

    /**
     *  Change logger
     *
     * @param {Logger} logger
     */
    Log.setLogger = function (logger) {
        shared.logger = logger;
    };

    var Logger = Interface(null, null);
    Logger.prototype.debug   = function (...data) {};
    Logger.prototype.info    = function (...data) {};
    Logger.prototype.warning = function (...data) {};
    Logger.prototype.error   = function (...data) {};

    var DefaultLogger = function () {
        Object.call(this);
    };
    Class(DefaultLogger, Object, [Logger], {

        // Override
        debug: function () {
            console.debug.apply(console, _args(arguments));
        },
        // Override
        info: function () {
            console.info.apply(console, _args(arguments));
        },
        // Override
        warning: function () {
            console.warn.apply(console, _args(arguments));
        },
        // Override
        error: function () {
            console.error.apply(console, _args(arguments));
        }
    });

    var _args = function (args) {
        if (Log.showTime === false) {
            return args;
        }
        var array = ['[' + current_time() + ']'];
        for (var i = 0; i < args.length; ++i) {
            array.push(args[i]);
        }
        return array;
    };

    //
    //  LogTimer
    //
    var current_time = function () {
        var now = new Date();
        var year    = now.getFullYear();
        var month   = now.getMonth();
        var date    = now.getDate();
        var hours   = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        return year + '-' + _pad(month + 1) + '-' + _pad(date)
            + ' ' + _pad(hours) + ':' + _pad(minutes) + ':' + _pad(seconds);
    };
    var _pad = function (value) {
        if (value < 10) {
            return '0' + value;
        } else {
            return '' + value;
        }
    };

    var shared = {
        logger: new DefaultLogger(),
        level: LogLevel.RELEASE.getValue()
    };

    //-------- namespace --------
    ns.lnc.LogLevel = LogLevel;
    ns.lnc.Logger   = Logger;
    ns.lnc.Log      = Log;

})(StarGate, MONKEY);
