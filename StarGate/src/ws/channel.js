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

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;

    /**
     *  Stream Channel Reader
     *  ~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Channel} channel
     */
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel);
    };
    sys.Class(StreamChannelReader, ChannelReader, null, {
        // Override
        receive: function (maxLen) {
            return this.read(maxLen);
        }
    });

    /**
     *  Stream Channel Writer
     *  ~~~~~~~~~~~~~~~~~~~~~
     *
     * @param {Channel} channel
     */
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel);
    };
    sys.Class(StreamChannelWriter, ChannelWriter, null, {
        // Override
        send: function (data, target) {
            // TCP channel will be always connected,
            // so the target address must be the remote address
            return this.write(data);
        }
    });

    //-------- namespace --------
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;

    ns.ws.registers('StreamChannelReader');
    ns.ws.registers('StreamChannelWriter');

})(StarTrek, MONKEY);

(function (ns, sys) {
    "use strict";

    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = ns.ws.StreamChannelReader;
    var StreamChannelWriter = ns.ws.StreamChannelWriter;

    /**
     *  Stream Channel
     *  ~~~~~~~~~~~~~~
     *
     * @param {SocketAddress} remote - remote address
     * @param {SocketAddress} local  - local address
     * @param {WebSocket|*} sock     - WebSocket wrapper
     */
    var StreamChannel = function (remote, local, sock) {
        BaseChannel.call(this, remote, local, sock);
    };
    sys.Class(StreamChannel, BaseChannel, null, {
        // Override
        createReader: function () {
            return new StreamChannelReader(this);
        },
        // Override
        createWriter: function () {
            return new StreamChannelWriter(this);
        }
    });

    //-------- namespace --------
    ns.ws.StreamChannel = StreamChannel;

    ns.ws.registers('StreamChannel');

})(StarTrek, MONKEY);
