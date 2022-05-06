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

//! require 'hub.js'
//! require 'socket.js'

(function (ns, sys) {
    "use strict";

    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;

    var StreamClientHub = function (delegate) {
        StreamHub.call(this, delegate);
    };
    sys.Class(StreamClientHub, StreamHub, null, {
        // Override
        createConnection: function (remote, local, channel) {
            var conn = new ActiveConnection(remote, local, channel, this);
            conn.setDelegate(this.getDelegate());  // gate
            conn.start();  // start FSM
            return conn;
        },
        open: function (remote, local) {
            var channel = StreamHub.prototype.open.call(this, remote, local);
            if (!channel) {
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
            console.error('StreamClientHub::createSocketChannel()', e, remote, local);
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
    ns.ws.StreamClientHub = StreamClientHub;

    ns.ws.registers('StreamClientHub');

})(StarGate, MONKEY);
