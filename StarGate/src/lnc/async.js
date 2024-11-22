;
// license: https://mit-license.org
//
//  Local Notification Service
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

//! require 'center.js'

(function (ns, fsm, sys) {
    "use strict";

    var Class    = sys.type.Class;
    var Runnable = fsm.skywalker.Runnable;
    var Thread   = fsm.threading.Thread;

    var BaseCenter   = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;

    /**
     *  Asynchronous Notification Center
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  call for each observers in background thread
     */
    var AsyncCenter = function () {
        BaseCenter.call(this);
        this.__notifications = []; // List<Notification>
        this.__running = false;
        this.__thread = null;
    };
    Class(AsyncCenter, BaseCenter, [Runnable], {

        // Override
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === 'string') {
                notification = new Notification(notification, sender, userInfo);
            }
            this.__notifications.push(notification);
        },

        // Override
        run: function () {
            while (this.isRunning()) {
                if (!this.process()) {
                    // nothing to do now,
                    // return true to run again after idled a while.
                    return true;
                }
            }
            // return false to stopped running
            return false;
        },

        // protected
        process: function () {
            var notification = this.__notifications.shift();
            if (notification) {
                this.postNotification(notification);
                return true;
            } else {
                // nothing to do now,
                // return false to have a rest ^_^
                return false;
            }
        }
    });

    AsyncCenter.prototype.start = function () {
        force_stop.call(this);
        this.__running = true;
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread;
    };
    AsyncCenter.prototype.stop = function () {
        force_stop.call(this);
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop();
        }
    };

    AsyncCenter.prototype.isRunning = function () {
        return this.__running;
    };

    //-------- namespace --------
    ns.lnc.AsyncCenter = AsyncCenter;

})(StarGate, FiniteStateMachine, MONKEY);
