;
// license: https://mit-license.org
//
//  File System
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

//! require 'namespace.js'

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var JsON = sys.format.JSON;
    var Base64 = sys.format.Base64;

    var Storage = function (storage, prefix) {
        Object.call(this);
        // Web storage
        this.storage = storage;
        // key prefix
        if (prefix) {
            this.ROOT = prefix;
        } else {
            this.ROOT = 'dim';
        }
    };
    Class(Storage, Object, null, null);

    Storage.prototype.getItem = function (key) {
        return this.storage.getItem(key);
    };
    Storage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value);
    };
    Storage.prototype.removeItem = function (key) {
        this.storage.removeItem(key);
    };
    Storage.prototype.clear = function () {
        this.storage.clear();
    };

    Storage.prototype.getLength = function () {
        return this.storage.length;
    };
    Storage.prototype.key = function (index) {
        return this.storage.key(index);
    };

    //
    //  Read
    //

    /**
     *  Check whether data file exists
     *
     * @param {String} path
     * @returns {boolean}
     */
    Storage.prototype.exists = function (path) {
        return !!this.getItem(this.ROOT + '.' + path);
    };

    /**
     *  Load text from file path
     *
     * @param {String} path
     * @returns {string}
     */
    Storage.prototype.loadText = function (path) {
        return this.getItem(this.ROOT + '.' + path);
    };

    /**
     *  Load data from file path
     *
     * @param {String} path
     * @returns {Uint8Array}
     */
    Storage.prototype.loadData = function (path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null;
        }
        return Base64.decode(base64);
    };

    /**
     *  Load JSON from file path
     *
     * @param {String} path
     * @returns {{}|[]}
     */
    Storage.prototype.loadJSON = function (path) {
        var json = this.loadText(path);
        if (!json) {
            return null;
        }
        return JsON.decode(json);
    };

    //
    //  Write
    //

    /**
     *  Delete file
     *
     * @param {String} path
     */
    Storage.prototype.remove = function (path) {
        this.removeItem(this.ROOT + '.' + path);
        return true;
    };

    /**
     *  Save string into Text file
     *
     * @param {String} text
     * @param {String} path
     */
    Storage.prototype.saveText = function (text, path) {
        if (text) {
            this.setItem(this.ROOT + '.' + path, text);
            return true;
        } else {
            this.removeItem(this.ROOT + '.' + path);
            return false;
        }
    };

    /**
     *  Save data into binary file
     *
     * @param {Uint8Array} data
     * @param {String} path
     */
    Storage.prototype.saveData = function (data, path) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data);
        }
        return this.saveText(base64, path);
    };

    /**
     *  Save Map/List into JSON file
     *
     * @param {{}|[]} container
     * @param {String} path
     */
    Storage.prototype.saveJSON = function (container, path) {
        var json = null;
        if (container) {
            json = JsON.encode(container);
        }
        return this.saveText(json, path);
    };

    //-------- namespace --------
    ns.dos.LocalStorage = new Storage(window.localStorage, 'dim.fs');
    ns.dos.SessionStorage = new Storage(window.sessionStorage, 'dim.mem');

})(StarGate, MONKEY);
