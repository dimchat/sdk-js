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

//! require <crypto.js>
//! require <startrek.js>

(function (ns, sys) {
    "use strict";

    //
    //  Host format
    //
    //      IPv4:
    //          127.0.0.1
    //          127.0.0.1:9527
    //
    //      IPv6:
    //          ::
    //          [::]:9527
    //          X:X:X:X:X:X:X:X
    //          [X:X:X:X:X:X:X:X]:9527
    //          X:X:X:X:X:X:127.0.0.1
    //          [X:X:X:X:X:X:127.0.0.1]:9527
    //

    var Class = sys.type.Class;
    var ConstantString = sys.type.ConstantString;

    /**
     *  Create host info with IP, port, IP data
     *
     * @param {String} string - full string
     * @param {String} ip
     * @param {Number} port
     * @param {Uint8Array} data
     * @constructor
     */
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        // ip string
        this.ip = ip;
        // port number
        this.port = port;
        // ip data array
        this.data = data;
    };
    Class(Host, ConstantString, null, null);

    /**
     *  Convert host info to data array
     *
     * @param {Number} default_port
     * @returns {Uint8Array}
     */
    Host.prototype.toArray = function (default_port) {
        var data = this.data; // ip data
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            // ip
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
        } else {
            // ip + port
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
            array[len] = port >> 8;
            array[len+1] = port & 0xFF;
        }
        return array;
    };

    //-------- namespace --------
    ns.network.Host = Host;

})(StarGate, MONKEY);
