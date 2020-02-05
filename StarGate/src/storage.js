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

//! require <dimp.js>
//! require 'namespace.js'

!function (ns) {
    "use strict";

    var Storage = {

        ROOT: 'dim.fs',

        //
        //  Read
        //

        /**
         *  Check whether data file exists
         *
         * @param path
         * @returns {boolean}
         */
        exists: function (path) {
            return !!this.loadText(path);
        },

        /**
         *  Load text from file path
         *
         * @param path
         * @returns {string}
         */
        loadText: function (path) {
            return this.storage.getItem(this.ROOT + '.' + path);
        },
        /**
         *  Load data from file path
         *
         * @param path
         * @returns {*[]}
         */
        loadData: function (path) {
            var base64 = this.loadText(path);
            if (!base64) {
                return null;
            }
            return DIMP.format.Base64.decode(base64);
        },
        /**
         *  Load JSON from file path
         *
         * @param path
         * @returns {Dictionary|Array}
         */
        loadJSON: function (path) {
            var json = this.loadText(path);
            if (!json) {
                return null;
            }
            return DIMP.format.JSON.decode(json);
        },

        //
        //  Write
        //

        /**
         *  Delete file
         *
         * @param path
         */
        remove: function (path) {
            this.saveText(null, path);
            return true;
        },

        /**
         *  Save string into Text file
         *
         * @param text
         * @param path
         */
        saveText: function (text, path) {
            if (text) {
                this.storage.setItem(this.ROOT + '.' + path, text);
                return true;
            } else {
                this.storage.removeItem(this.ROOT + '.' + path);
                return false;
            }
        },
        /**
         *  Save data into binary file
         *
         * @param data
         * @param path
         */
        saveData: function (data, path) {
            var base64 = null;
            if (data) {
                base64 = DIMP.format.Base64.encode(data);
            }
            return this.saveText(base64, path);
        },
        /**
         *  Save Map/List into JSON file
         *
         * @param container
         * @param path
         */
        saveJSON: function (container, path) {
            var json = null;
            if (container) {
                json = DIMP.format.JSON.encode(container);
            }
            return this.saveText(json, path);
        }
    };

    Storage.storage = window.localStorage;

    //-------- namespace --------
    ns.LocalStorage = Storage;
    ns.includes('LocalStorage');

}(StarGate);
