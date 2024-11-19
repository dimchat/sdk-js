;
// license: https://mit-license.org
//
//  MONKEY: Memory Object aNd KEYs
//
//                               Written in 2024 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2024 Albert Moky
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

(function (ns) {
    'use strict';

    var Class      = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var JsON       = ns.format.JSON;

    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var BaseFileWrapper     = ns.format.BaseFileWrapper;

    //  1. new BaseNetworkFile(dict);
    //  2. new BaseNetworkFile(data, filename, url, password);
    var BaseNetworkFile = function () {
        var ted = null, filename = null, url = null, password = null;
        if (arguments.length === 1) {
            // new BaseNetworkFile(dict);
            Dictionary.call(this, arguments[0]);
        } else if (arguments.length === 4) {
            // new BaseNetworkFile(data, filename, url, password);
            Dictionary.call(this);
            ted      = arguments[0];
            filename = arguments[1];
            url      = arguments[2];
            password = arguments[3];
        } else {
            throw new SyntaxError('PNF arguments error: ' + arguments);
        }
        var wrapper = new BaseFileWrapper(this.toMap());
        // file data
        if (ted) {
            wrapper.setData(ted);
        }
        // file name
        if (filename) {
            wrapper.setFilename(filename);
        }
        // remote URL
        if (url) {
            wrapper.setURL(url);
        }
        // decrypt key
        if (password) {
            wrapper.setPassword(password);
        }
        this.__wrapper = wrapper;
    };
    Class(BaseNetworkFile, Dictionary, [PortableNetworkFile], {

        // Override
        getData: function () {
            var ted = this.__wrapper.getData();
            return !ted ? null : ted.getData();
        },

        // Override
        setData: function (binary) {
            this.__wrapper.setBinaryData(binary);
        },

        // Override
        getFilename: function () {
            return this.__wrapper.getFilename();
        },

        // Override
        setFilename: function (filename) {
            this.__wrapper.setFilename(filename);
        },

        // Override
        getURL: function () {
            return this.__wrapper.getURL();
        },

        // Override
        setURL: function (url) {
            this.__wrapper.setURL(url);
        },

        // Override
        getPassword: function () {
            return this.__wrapper.getPassword();
        },

        // Override
        setPassword: function (key) {
            this.__wrapper.setPassword(key);
        },

        ///
        /// encoding
        ///

        // Override
        toString: function () {
            var url = this.getURLString();
            if (url) {
                // only contains 'URL', return the URL string directly
                return url;
            }
            // not a single URL, encode the entire dictionary
            return JsON.encode(this.toMap());
        },

        // Override
        toObject: function () {
            var url = this.getURLString();
            if (url) {
                // only contains 'URL', return the URL string directly
                return url;
            }
            // not a single URL, return the entire dictionary
            return this.toMap();
        },

        // private
        getURLString: function () {
            var url = this.getString('URL', '');
            var len = url.length;
            if (len === 0) {
                return null;
            } else if (len > 5 && url.substring(0, 5) === 'data:') {
                // 'data:...;...,...'
                return url;
            }
            var count = this.getLength();
            if (count === 1) {
                // if only contains 'URL' field, return the URL string directly
                return url;
            } else if (count === 2 && this.getValue('filename')) {
                // ignore 'filename' field
                return url;
            } else {
                // not a single URL
                return null;
            }
        }
    });

    var BaseNetworkFileFactory = function () {
        Object.call(this);
    };
    Class(BaseNetworkFileFactory, Object, [PortableNetworkFile.Factory], {

        // Override
        createPortableNetworkFile: function (ted, filename, url, password) {
            return new BaseNetworkFile(ted, filename, url, password);
        },

        // Override
        parsePortableNetworkFile: function (pnf) {
            return new BaseNetworkFile(pnf);
        }
    });

    /**
     *  Register PNF factory
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var factory = new BaseNetworkFileFactory();
    PortableNetworkFile.setFactory(factory);

})(DIMP);
