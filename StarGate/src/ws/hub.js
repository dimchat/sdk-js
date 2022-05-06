;
// license: https://mit-license.org
//
//  Web Socket
//
//                               Written in 2022 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require 'channel.js'

(function (ns, sys) {
    "use strict";

    var AddressPairMap = ns.type.AddressPairMap;

    var ChannelPool = function () {
        AddressPairMap.call(this);
    };
    sys.Class(ChannelPool, AddressPairMap, null, {
        // Override
        set: function (remote, local, value) {
            var old = this.get(remote, local);
            if (old && old !== value) {
                this.remove(remote, local, old);
            }
            AddressPairMap.prototype.set.call(this, remote, local, value);
        },
        // Override
        remove: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(this, remote, local, value);
            if (cached && cached.isOpen()) {
                try {
                    cached.close();
                } catch (e) {
                    console.error('ChannelPool::remove()', e, remote, local, value, cached);
                }
            }
            return cached;
        }
    })

    //-------- namespace --------
    ns.ws.ChannelPool = ChannelPool;

    ns.ws.registers('ChannelPool');

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var BaseHub = ns.socket.BaseHub;
    var ChannelPool = ns.ws.ChannelPool;
    var StreamChannel = ns.ws.StreamChannel;

    /**
     *  Stream Hub
     *
     * @param {ConnectionDelegate} delegate
     */
    var StreamHub = function (delegate) {
        BaseHub.call(this, delegate);
        this.__channelPool = this.createChannelPool();
    };
    sys.Class(StreamHub, BaseHub, null, null);

    // protected
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool();
    };

    //
    //  Channel
    //

    /**
     *  Create channel with socket & addresses
     *
     * @param {SocketAddress} remote - remote address
     * @param {SocketAddress} local  - local address
     * @param {WebSocket|*} sock     - WebSocket wrapper
     * @return {Channel} null on socket error
     */
    // protected
    StreamHub.prototype.createChannel = function (remote, local, sock) {
        return new StreamChannel(remote, local, sock);
    };

    // Override
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.allValues();
    };

    // protected
    StreamHub.prototype.getChannel = function (remote, local) {
        return this.__channelPool.get(remote, local);
    };

    // protected
    StreamHub.prototype.setChannel = function (remote, local, channel) {
        this.__channelPool.set(remote, local, channel);
    };

    // Override
    StreamHub.prototype.removeChannel = function (remote, local, channel) {
        this.__channelPool.remove(remote, local, channel);
    };

    // Override
    StreamHub.prototype.open = function (remote, local) {
        return this.getChannel(remote, local);
    };

    //-------- namespace --------
    ns.ws.StreamHub = StreamHub;

    ns.ws.registers('StreamHub');

})(StarGate, MONKEY);
