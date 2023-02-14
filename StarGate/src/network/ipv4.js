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

//! require 'host.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var Host = ns.network.Host;

    //
    //  IPv4
    //      127.0.0.1
    //      127.0.0.1:9527
    //
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                // get ip+port from data array
                ip = data[0] + '.' + data[1] + '.' + data[2] + '.' + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5];
                }
            }
        } else if (ip) {
            // parse IPv4 string
            data = new Uint8Array(4);
            var array = ip.split('.');
            for (var index = 0; index < 4; ++index) {
                data[index] = parseInt(array[index], 10);
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = ip + ':' + port;
        }
        Host.call(this, string, ip, port, data);
    };
    Class(IPv4, Host, null);

    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;  // 127.0.0.1:9527

    /**
     *  Parse IPv4 host string
     *
     * @param {String} host
     * @returns {IPv4}
     */
    IPv4.parse = function (host) {
        // check
        if (!this.patten.test(host)) {
            return null;
        }
        var pair = host.split(':');
        var ip = pair[0], port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1]);
        }
        return new IPv4(ip, port);
    };

    //-------- namespace --------
    ns.network.IPv4 = IPv4;

})(StarGate, MONKEY);
