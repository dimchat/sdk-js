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
    //  IPv6
    //      ::
    //      [::]:9527
    //      X:X:X:X:X:X:X:X
    //      [X:X:X:X:X:X:X:X]:9527
    //      X:X:X:X:X:X:127.0.0.1
    //      [X:X:X:X:X:X:127.0.0.1]:9527
    //
    var parse_v4 = function (data, array) {
        var item, index = data.byteLength;
        for (var i = array.length-1; i >= 0; --i) {
            item = array[i];
            data[--index] = item;
        }
        return data;
    };

    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf('::');
        if (pos < 0) {
            // no compress
            array = ip.split(':');
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF;
            }
        } else {
            // left part
            var left = ip.substring(0, pos).split(':');
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF;
            }
            // right part
            var right = ip.substring(pos+2).split(':');
            index = count * 2;
            for (var k = right.length-1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 0xFF;
                data[--index] = item >> 8;
            }
        }
        return data;
    };

    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16);
            }
            return Number(hi).toString(16) + '0' + Number(lo).toString(16);
        } else {
            return Number(lo).toString(16);
        }
    };

    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                // get ip+port from data array
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ':' + hex_encode(data[index], data[index+1]);
                }
                // compress it
                ip = ip.replace(/:(0:){2,}/, '::');
                ip = ip.replace(/^(0::)/, '::');
                ip = ip.replace(/(::0)$/, '::');
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17];
                }
            }
        } else if (ip) {
            // parse IPv6 string
            data = new Uint8Array(16);
            var array = ip.split('.');
            if (array.length === 1) {
                // standard IPv6 address
                //      ::7f00:1
                data = parse_v6(data, ip, 8);
            } else if (array.length === 4) {
                // compatible address for IPv4
                //      ::127.0.0.1
                var prefix = array[0];
                var pos = prefix.lastIndexOf(':');
                array[0] = prefix.substring(pos+1); // keep first number of IPv4
                prefix = prefix.substring(0, pos);  // cut IPv4
                data = parse_v6(data, prefix, 6);
                data = parse_v4(data, array);
            } else {
                throw new URIError('IPv6 format error: ' + ip);
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = '[' + ip + ']:' + port;
        }
        Host.call(this, string, ip, port, data);
    };
    Class(IPv6, Host, null);

    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;

    /**
     *  Parse IPv6 host string
     *
     * @param {String} host
     * @returns {IPv6|null}
     */
    IPv6.parse = function (host) {
        // check
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null;
        }
        var ip, port;
        if (host.charAt(0) === '[') {
            // [0:0:0:0:0:0:0:0]:9527
            var pos = host.indexOf(']');
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos+2));
        } else {
            ip = host;
            port = 0;
        }
        return new IPv6(ip, port);
    };

    //-------- namespace --------
    ns.network.IPv6 = IPv6;

})(StarGate, MONKEY);
