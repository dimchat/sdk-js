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

//! require 'notification.js'
//! require 'observer.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var Arrays = sys.type.Arrays;

    var BaseCenter = function () {
        Object.call(this);
        this.__observers = {}; // str(name) => Set<Observer>
    };
    Class(BaseCenter, Object, null, null);

    BaseCenter.prototype.addObserver = function (observer, name) {
        var list = this.__observers[name];
        if (!list) {
            // new set
            list = [];
            this.__observers[name] = list;
        } else if (list.indexOf(observer) >= 0) {
            // already exists
            return;
        }
        list.push(observer);
    };

    BaseCenter.prototype.removeObserver = function (observer, name) {
        if (name) {
            remove.call(this, observer, name);
        } else {
            // Remove observer from notification center, no mather what names
            var names = Object.keys(this.__observers);
            for (var i = names.length - 1; i >= 0; --i) {
                remove.call(this, observer, names[i]);
            }
        }
    };
    var remove = function (observer, name) {
        // Remove observer for notification name
        var list = this.__observers[name];
        if (list/* instanceof Array*/) {
            Arrays.remove(list, observer);
            if (list.length === 0) {
                delete this.__observers[name];
            }
        }
    };

    var getObservers = function (name) {
        var list = this.__observers[name];
        if (list) {
            return list.slice();
        } else {
            return [];
        }
    };

    BaseCenter.prototype.postNotification = function (notification, sender, userInfo) {
        throw new Error('NotImplemented');
    };

    // protected
    BaseCenter.prototype.post = function (notification) {
        var name = notification.name;
        var sender = notification.sender;
        var userInfo = notification.userInfo;
        // send to all observers with this notification name
        var observers = getObservers.call(this, name);
        var obs;
        for (var i = observers.length - 1; i >= 0; --i) {
            obs = observers[i];
            try {
                if (typeof obs === 'function') {
                    obs.call(notification, name, sender, userInfo);
                } else {
                    obs.onReceiveNotification(notification);
                }
            } catch (e) {
                console.error('DefaultCenter::post() error', notification, obs, e);
            }
        }
    };

    //-------- namespace --------
    ns.lnc.BaseCenter = BaseCenter;

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;

    /**
     *  Default Notification Center
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  call for each observers immediately
     */
    var DefaultCenter = function () {
        BaseCenter.call(this);
    };
    Class(DefaultCenter, BaseCenter, null, {
        
        // Override
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === 'string') {
                notification = new Notification(notification, sender, userInfo);
            }
            this.post(notification);
        }
    });

    /**
     *  Singleton
     *  ~~~~~~~~~
     */
    var NotificationCenter = {

        /**
         *  Add observer with notification name
         *
         * @param {Observer|Function} observer
         * @param {string} name
         */
        addObserver: function (observer, name) {
            this.defaultCenter.addObserver(observer, name);
        },

        /**
         *  Remove observer from notification center
         *
         * @param {Observer|Function} observer
         * @param {string} name - OPTIONAL
         */
        removeObserver: function (observer, name) {
            this.defaultCenter.removeObserver(observer, name);
        },

        /**
         *  Post notification with name
         *
         * @param {Notification|string} notification - notification or name
         * @param {*} sender
         * @param {{}} userInfo - OPTIONAL
         */
        postNotification: function (notification, sender, userInfo) {
            this.defaultCenter.postNotification(notification, sender, userInfo);
        },

        getInstance: function () {
            return this.defaultCenter;
        },
        defaultCenter: new DefaultCenter()
    };

    //-------- namespace --------
    ns.lnc.DefaultCenter = DefaultCenter;
    ns.lnc.NotificationCenter = NotificationCenter;

})(StarGate, MONKEY);
