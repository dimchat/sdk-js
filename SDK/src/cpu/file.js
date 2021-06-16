;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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
//! require 'content.js'

(function (ns) {
    'use strict';

    var FileContent = ns.protocol.FileContent;
    var InstantMessage = ns.protocol.InstantMessage;

    var ContentProcessor = ns.cpu.ContentProcessor;

    var FileContentProcessor = function () {
        ContentProcessor.call(this);
    };
    ns.Class(FileContentProcessor, ContentProcessor, null);

    /**
     *  Encrypt data in file content with the password, and upload to CDN
     *
     * @param {FileContent} content - file content
     * @param {EncryptKey} pwd      - symmetric key
     * @param {InstantMessage} iMsg - plain message
     * @return {boolean} false on error
     */
    FileContentProcessor.prototype.uploadFileContent = function (content, pwd, iMsg) {
        var data = content.getData();
        if (!data || data.length === 0) {
            // FIXME: already uploaded?
            //throw new ReferenceError('failed to get file data: ' + content.getMap());
            return false;
        }
        // encrypt and upload file data onto CDN and save the URL in message content
        var encrypted = pwd.encrypt(data);
        if (!encrypted || encrypted.length === 0) {
            throw new Error('failed to encrypt file data with key: ' + pwd.getMap());
        }
        var url = this.getMessenger().uploadData(encrypted, iMsg);
        if (url) {
            // replace 'data' with 'URL';
            content.setURL(url);
            content.setData(null);
            return true;
        } else {
            return false;
        }
    };

    /**
     *  Download data for file content from CDN, and decrypt it with the password
     *
     * @param {FileContent} content - file content
     * @param {DecryptKey} pwd      - symmetric key
     * @param {SecureMessage} sMsg  - encrypted message
     * @return {boolean} false on error
     */
    FileContentProcessor.prototype.downloadFileContent = function (content, pwd, sMsg) {
        var url = content.getURL();
        if (!url || url.indexOf('://') < 3) {
            // download URL error
            return false;
        }
        var iMsg = InstantMessage.create(sMsg.getEnvelope(), content);
        // download from CDN
        var encrypted = this.getMessenger().downloadData(url, iMsg);
        if (!encrypted || encrypted.length === 0) {
            // save symmetric key for decrypting file data after download from CDN
            content.setPassword(pwd);
            return false;
        } else {
            // decrypt file data
            var data = pwd.decrypt(encrypted);
            if (!data || data.length === 0) {
                throw new Error('failed to decrypt file data with key: ' + pwd.getMap());
            }
            content.setData(data);
            content.setURL(null);
            return true;
        }
    };

    // @Override
    FileContentProcessor.prototype.process = function (content, rMsg) {
        // TODO: process file content
        return null;
    };

    //-------- namespace --------
    ns.cpu.FileContentProcessor = FileContentProcessor;

    ns.cpu.registers('FileContentProcessor');

})(DIMSDK);
