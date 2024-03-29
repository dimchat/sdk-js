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

//! require 'socket.js'
//! require 'channel.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var BaseHub = ns.socket.BaseHub;
    var StreamChannel = ns.ws.StreamChannel;

    var ChannelPool = function () {
        AddressPairMap.call(this);
    };
    Class(ChannelPool, AddressPairMap, null, {
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

    /**
     *  Stream Hub
     *
     * @param {ConnectionDelegate} delegate
     */
    var StreamHub = function (delegate) {
        BaseHub.call(this, delegate);
        this.__channelPool = this.createChannelPool();
    };
    Class(StreamHub, BaseHub, null, null);

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
        return this.__channelPool.values();
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
    ns.ws.ChannelPool = ChannelPool;
    ns.ws.StreamHub = StreamHub;

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;

    var ClientHub = function (delegate) {
        StreamHub.call(this, delegate);
    };
    Class(ClientHub, StreamHub, null, {
        // Override
        createConnection: function (remote, local, channel) {
            var conn = new ActiveConnection(remote, local, channel, this);
            conn.setDelegate(this.getDelegate());  // gate
            conn.start();  // start FSM
            return conn;
        },
        open: function (remote, local) {
            var channel = StreamHub.prototype.open.call(this, remote, local);
            if (!channel/* && remote*/) {
                channel = createSocketChannel.call(this, remote, local);
                if (channel) {
                    this.setChannel(channel.getRemoteAddress(), channel.getLocalAddress(), channel);
                }
            }
            return channel;
        }
    });

    var createSocketChannel = function (remote, local) {
        try {
            var sock = createWebSocketClient(remote, local);
            if (!local) {
                local = sock.getLocalAddress();
            }
            return this.createChannel(remote, local, sock);
        } catch (e) {
            console.error('ClientHub::createSocketChannel()', remote, local, e);
            return null;
        }
    };
    var createWebSocketClient = function (remote, local) {
        var sock = new Socket();
        sock.configureBlocking(true);
        if (local) {
            sock.bind(local);
        }
        sock.connect(remote);
        sock.configureBlocking(false);
        return sock;
    };

    //-------- namespace --------
    ns.ws.ClientHub = ClientHub;

})(StarGate, MONKEY);
