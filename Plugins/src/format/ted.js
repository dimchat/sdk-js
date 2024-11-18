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

    var TransportableData = ns.format.TransportableData;
    var BaseDataWrapper   = ns.format.BaseDataWrapper;

    //  1. new Base64Data(dict);
    //  2. new Base64Data(data);
    var Base64Data = function (info) {
        var binary = null;
        if (info instanceof Uint8Array) {
            binary = info;
            info = null;
        }
        Dictionary.call(this, info);
        var wrapper = new BaseDataWrapper(this.toMap());
        if (binary) {
            // encode algorithm
            wrapper.setAlgorithm(TransportableData.BASE64);
            // binary data
            if (binary.length > 0) {
                wrapper.setData(binary);
            }
        }
        this.__wrapper = wrapper;
    };
    Class(Base64Data, Dictionary, [TransportableData], {

        // Override
        getAlgorithm: function () {
            return this.__wrapper.getAlgorithm();
        },

        // Override
        getData: function () {
            return this.__wrapper.getData();
        },

        // Override
        toObject: function () {
            return this.toString();
        },

        // Override
        toString: function () {
            // 0. "{BASE64_ENCODE}"
            // 1. "base64,{BASE64_ENCODE}"
            return this.__wrapper.toString();
        },

        encode: function (mimeType) {
            // 2. "data:image/png;base64,{BASE64_ENCODE}"
            return this.__wrapper.encode(mimeType);
        }
    });
    
    var Base64DataFactory = function () {
        Object.call(this);
    };
    Class(Base64DataFactory, Object, [TransportableData.Factory], {
        
        // Override
        createTransportableData: function (data) {
            return new Base64Data(data);
        },

        // Override
        parseTransportableData: function (ted) {
            // TODO: 1. check algorithm
            //       2. check data format
            return new Base64Data(ted);
        }
    });

    /**
     *  Register TED factory
     *  ~~~~~~~~~~~~~~~~~~~~
     */
    var factory = new Base64DataFactory();
    TransportableData.setFactory('*', factory);
    TransportableData.setFactory(TransportableData.BASE64, factory);
    // TransportableData.setFactory(TransportableData.DEFAULT, factory);

})(DIMP);
