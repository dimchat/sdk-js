;
// license: https://mit-license.org
//
//  Local Notification
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
//! require 'namespace.js'

!function (ns) {
    "use strict";

    /**
     *  Notification observer
     */
    var Observer = function () {
    };
    DIMP.Interface(Observer, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when received notification
     *
     * @param {Notification} notification
     */
    Observer.prototype.onReceiveNotification = function (notification) {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Observer = Observer;

    ns.register('Observer');

}(StarGate);

!function (ns) {
    "use strict";

    /**
     *  Notification object with name, sender and extra info
     *
     * @param {String} name
     * @param {Object} sender
     * @param {{}} userInfo
     * @constructor
     */
    var Notification = function (name, sender, userInfo) {
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo;
    };
    DIMP.Class(Notification, DIMP.type.Object, null);

    //-------- namespace --------
    ns.Notification = Notification;

    ns.register('Notification');

}(StarGate);

!function (ns) {
    "use strict";

    var Notification = ns.Notification;
    var Observer = ns.Observer;

    /**
     *  Notification center
     */
    var Center = function () {
        this.observerMap = {};
    };
    DIMP.Class(Center, DIMP.type.Object, null);

    /**
     *  Add observer with notification name
     *
     * @param {Observer|Function} observer
     * @param {String} name
     */
    Center.prototype.addObserver = function (observer, name) {
        var list = this.observerMap[name];
        if (list) {
            if (list.indexOf(observer) >= 0) {
                // already exists
                return;
            }
        } else {
            list = [];
            this.observerMap[name] = list;
        }
        list.push(observer);
    };

    /**
     *  Remove observer from notification center
     *
     * @param {Observer|Function} observer
     * @param {String} name - OPTIONAL
     */
    Center.prototype.removeObserver = function (observer, name) {
        if (name) {
            // Remove observer for notification name
            var list = this.observerMap[name];
            if (list/* instanceof Array*/) {
                DIMP.type.Arrays.remove(list, observer);
            }
        } else {
            // Remove observer from notification center, no mather what names
            var names = Object.keys(this.observerMap);
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i]);
            }
        }
    };

    /**
     *  Post a notification
     *
     * @param {Notification|String} notification - notification or name
     * @param {Object} sender - OPTIONAL
     * @param {{}} userInfo - OPTIONAL
     */
    Center.prototype.postNotification = function (notification, sender, userInfo) {
        if (typeof notification === 'string') {
            notification = new Notification(notification, sender, userInfo);
        }
        var observers = this.observerMap[notification.name];
        if (!observers) {
            return;
        }
        // send to all observers with this notification name
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (DIMP.Interface.conforms(obs, Observer)) {
                obs.onReceiveNotification(notification);
            } else if (typeof obs === 'function') {
                obs.call(notification);
            }
        }
    };

    //-------- singleton --------
    var s_notification_center = null;
    Center.getInstance = function () {
        if (!s_notification_center) {
            s_notification_center = new Center();
        }
        return s_notification_center;
    };

    //-------- namespace --------
    ns.NotificationCenter = Center;

    ns.register('NotificationCenter');

}(StarGate);
