'use strict';
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
//
//                               Written in 2025 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2025 Albert Moky
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

//! require 'compress_keys.js'

    sdk.core.Compressor = Interface(null, null);
    var Compressor = sdk.core.Compressor;

    /**
     *  Compress Content
     *
     * @param {{}} content
     * @param {{}} key
     * @return {Uint8Array}
     */
    Compressor.prototype.compressContent = function (content, key) {};
    Compressor.prototype.extractContent = function (data, key) {};

    /**
     *  Compress SymmetricKey
     *
     * @param {{}} key
     * @return {Uint8Array}
     */
    Compressor.prototype.compressSymmetricKey = function (key) {};
    Compressor.prototype.extractSymmetricKey = function (data) {};

    /**
     *  Compress ReliableMessage
     *
     * @param {{}} msg
     * @return {Uint8Array}
     */
    Compressor.prototype.compressReliableMessage = function (msg) {};
    Compressor.prototype.extractReliableMessage = function (data) {};


    sdk.core.MessageCompressor = function (shortener) {
        BaseObject.call(this);
        this.__shortener = shortener;
    };
    var MessageCompressor = sdk.core.MessageCompressor;

    Class(MessageCompressor, BaseObject, [Compressor], null);

    MessageCompressor.prototype.getShortener = function () {
        return this.__shortener;
    };

    ///
    ///  Compress Content
    ///

    // Override
    MessageCompressor.prototype.compressContent = function (content, key) {
        var shortener = this.getShortener();
        content = shortener.compressContent(content);
        var text = JSONMap.encode(content);
        return UTF8.encode(text);
    };

    // Override
    MessageCompressor.prototype.extractContent = function (data, key) {
        var text = UTF8.decode(data);
        if (!text) {
            return null;
        }
        var info = JSONMap.decode(text);
        if (info) {
            var shortener = this.getShortener();
            info = shortener.extractContent(info);
        }
        return info;
    };

    ///
    ///  Compress SymmetricKey
    ///

    // Override
    MessageCompressor.prototype.compressSymmetricKey = function (key) {
        var shortener = this.getShortener();
        key = shortener.compressSymmetricKey(key);
        var text = JSONMap.encode(key);
        return UTF8.encode(text);
    };

    // Override
    MessageCompressor.prototype.extractSymmetricKey = function (data) {
        var text = UTF8.decode(data);
        if (!text) {
            return null;
        }
        var key = JSONMap.decode(text);
        if (key) {
            var shortener = this.getShortener();
            key = shortener.extractSymmetricKey(key);
        }
        return key;
    };

    ///
    ///  Compress ReliableMessage
    ///

    // Override
    MessageCompressor.prototype.compressReliableMessage = function (msg) {
        var shortener = this.getShortener();
        msg = shortener.compressReliableMessage(msg);
        var text = JSONMap.encode(msg);
        return UTF8.encode(text);
    };

    // Override
    MessageCompressor.prototype.extractReliableMessage = function (data) {
        var text = UTF8.decode(data);
        if (!text) {
            return null;
        }
        var msg = JSONMap.decode(text);
        if (msg) {
            var shortener = this.getShortener();
            msg = shortener.extractReliableMessage(msg);
        }
        return msg;
    };
