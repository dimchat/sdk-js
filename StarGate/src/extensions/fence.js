;
// license: https://mit-license.org
//
//  Star Gate: Interfaces for network connection
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

//! require 'star.js'
//! require 'task.js'

!function (ns) {
    "use strict";

    var Task = ns.extensions.Task;

    var StarStatus = ns.StarStatus;
    var Star = ns.Star;

    /**
     *  Create a star gate with delegate
     *
     * @param {StarDelegate|*} delegate
     * @constructor
     */
    var Fence = function (delegate) {
        this.delegate = delegate;
        this.status = StarStatus.Init;
        this.waitingList = [];
    };
    DIMP.Class(Fence, DIMP.type.Object, [Star]);

    /**
     *  Callback when received data
     *
     * @param {Uint8Array} data
     */
    Fence.prototype.onReceived = function (data) {
        this.delegate.onReceived(data, this);
    };

    /**
     *  Get connection status
     *
     * @returns {StarStatus}
     */
    Fence.prototype.getStatus = function () {
        return this.status;
    };
    Fence.prototype.setStatus = function (status) {
        if (status.equals(this.status)) {
            return;
        }
        this.delegate.onStatusChanged(status, this);
        this.status = status;
    };

    /**
     *  Get next task
     *
     * @returns {Object<Task>}
     */
    Fence.prototype.getTask = function () {
        if (this.waitingList.length === 0) {
            return null;
        }
        return this.waitingList.shift();
    };

    // noinspection JSUnusedLocalSymbols
    /**
     *  Connect to a server
     *
     * @param {String} host
     * @param {Number} port
     */
    Fence.prototype.connect = function (host, port) {
        console.assert(false, 'implement me!');
    };
    Fence.prototype.disconnect = function () {
        console.assert(false, 'implement me!');
    };

    Fence.prototype.isConnected = function () {
        return this.status.equals(StarStatus.Connected);
    };

    Fence.prototype.onConnected = function () {
        this.setStatus(StarStatus.Connected);
    };
    Fence.prototype.onClosed = function () {
        this.setStatus(StarStatus.Init);
    };
    Fence.prototype.onError = function (error) {
        this.setStatus(StarStatus.Error);
    };
    /**
     *  Callback when received response
     *
     * @param {Uint8Array} data
     */
    Fence.prototype.onReceived = function (data) {
        this.delegate.onReceived(data, this);
    };

    Fence.prototype.launch = function (options) {
        this.disconnect();
        this.setStatus(StarStatus.Connecting);
        var host = options['host'];
        var port = options['port'];
        this.connect(host, port);
    };
    Fence.prototype.terminate = function () {
        this.disconnect();
        this.setStatus(StarStatus.Init);
    };

    /**
     *  Send request data to server
     *
     * @param {Uint8Array} data
     * @param {StarDelegate} delegate
     */
    Fence.prototype.send = function (data, delegate) {
        var task = new Task(data, delegate);
        task.star = this;
        this.waitingList.push(task);
    };

    //-------- namespace --------
    ns.extensions.Fence = Fence;

    ns.extensions.register('Fence');

}(StarGate);
