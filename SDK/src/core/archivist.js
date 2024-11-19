;
// license: https://mit-license.org
//
//  DIM-SDK : Decentralized Instant Messaging Software Development Kit
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

//! require 'utils/checkers.js'

(function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Entity = ns.mkm.Entity;
    var FrequencyChecker = ns.utils.FrequencyChecker;
    var RecentTimeChecker = ns.utils.RecentTimeChecker;

    var Archivist = function (lifeSpan) {
        Object.call(this);
        // query checkers
        this.__metaQueries = new FrequencyChecker(lifeSpan);
        this.__docsQueries = new FrequencyChecker(lifeSpan);
        this.__membersQueries = new FrequencyChecker(lifeSpan);
        // recent time checkers
        this.__lastDocumentTimes = new RecentTimeChecker();
        this.__lastHistoryTimes = new RecentTimeChecker();
    };
    Class(Archivist, Object, [Entity.DataSource], null);

    // each query will be expired after 10 minutes
    Archivist.kQueryExpires = 600.0;  // seconds

    // protected
    Archivist.prototype.isMetaQueryExpired = function (identifier) {
        return this.__metaQueries.isExpired(identifier);
    };

    // protected
    Archivist.prototype.isDocumentQueryExpired = function (identifier) {
        return this.__docsQueries.isExpired(identifier);
    };

    // protected
    Archivist.prototype.isMembersQueryExpired = function (identifier) {
        return this.__membersQueries.isExpired(identifier);
    };

    /**
     *  Check whether need to query meta
     *
     * @param {ID} identifier
     * @param {Meta} meta
     * @return {Boolean}
     */
    // protected
    Archivist.prototype.needsQueryMeta = function (identifier, meta) {
        if (identifier.isBroadcast()) {
            // broadcast entity has no meta to query
            return false;
        } else if (!meta) {
            // meta not found, sure to query
            return true;
        }
        return false;
    };

    //
    //  Last Document Times
    //

    Archivist.prototype.setLastDocumentTime = function (identifier, lastTime) {
        return this.__lastDocumentTimes.setLastTime(identifier, lastTime);
    };

    /**
     *  Check whether need to query documents
     *
     * @param {ID} identifier
     * @param {Document[]} docs
     * @return {Boolean}
     */
    // protected
    Archivist.prototype.needsQueryDocuments = function (identifier, docs) {
        if (identifier.isBroadcast()) {
            // broadcast entity has no document to query
            return false;
        } else if (!docs || docs.length === 0) {
            // documents not found, sure to query
            return true;
        }
        var currentTime = this.getLastDocumentTime(identifier, docs);
        return this.__lastDocumentTimes.isExpired(identifier, currentTime);
    };

    // protected
    Archivist.prototype.getLastDocumentTime = function (identifier, docs) {
        if (!docs || docs.length === 0) {
            return null;
        }
        var docTime, lastTime = null;  // Date
        for (var i = 0; i < docs.length; ++i) {
            docTime = docs[i].getTime();
            if (!docTime) {
                // document error
            } else if (!lastTime || lastTime.getTime() < docTime.getTime()) {
                lastTime = docTime;
            }
        }
        return lastTime;
    };

    //
    //  Last Group History Times
    //

    Archivist.prototype.setLastGroupHistoryTime = function (identifier, lastTime) {
        return this.__lastHistoryTimes.setLastTime(identifier, lastTime);
    };

    /**
     *  Check whether need to query group members
     *
     * @param {ID} identifier
     * @param {ID[]} members
     * @return {Boolean}
     */
    // protected
    Archivist.prototype.needsQueryMembers = function (identifier, members) {
        if (identifier.isBroadcast()) {
            // broadcast group has no members to query
            return false;
        } else if (!members || members.length === 0) {
            // members not found, sure to query
            return true;
        }
        var currentTime = this.getLastGroupHistoryTime(identifier);
        return this.__lastHistoryTimes.isExpired(identifier, currentTime);
    };

    // protected
    Archivist.prototype.getLastGroupHistoryTime = function (identifier) {
        throw new Error('Archivist::getLastGroupHistoryTime: ' + identifier);
    };


    /**
     *  Check meta for querying
     *
     * @param {ID} identifier - entity ID
     * @param {Meta} meta     - exists meta
     * @return {boolean} true on querying
     */
    Archivist.prototype.checkMeta = function (identifier, meta) {
        if (this.needsQueryMeta(identifier, meta)) {
            // if (!this.isMetaQueryExpired(identifier)) {
            //     // query not expired yet
            //     return false;
            // }
            return this.queryMeta(identifier);
        } else {
            // no need to query meta again
            return false;
        }
    };

    /**
     *  Check documents for querying/updating
     *
     * @param {ID} identifier   - entity ID
     * @param {Document[]} docs - exist documents
     * @return {boolean} true on querying
     */
    Archivist.prototype.checkDocuments = function (identifier, docs) {
        if (this.needsQueryDocuments(identifier, docs)) {
            // if (!this.isDocumentQueryExpired(identifier)) {
            //     // query not expired yet
            //     return false;
            // }
            return this.queryDocuments(identifier, docs);
        } else {
            // no need to update documents now
            return false;
        }
    };

    /**
     *  Check group members for querying
     *
     * @param {ID} identifier - group ID
     * @param {ID[]} members  - exist members
     * @return {boolean} true on querying
     */
    Archivist.prototype.checkMembers = function (identifier, members) {
        if (this.needsQueryMembers(identifier, members)) {
            if (!this.isMembersQueryExpired(identifier)) {
                // query not expired yet
                return false;
            }
            return this.queryMembers(identifier, members);
        } else {
            // no need to update group members now
            return false;
        }
    };

    /**
     *  Request for meta with entity ID
     *  (call 'isMetaQueryExpired()' before sending command)
     *
     * @param {ID} identifier - entity ID
     * @return {boolean} false on duplicated
     */
    Archivist.prototype.queryMeta = function (identifier) {
        throw new Error('Archivist::queryMeta: ' + identifier);
    };

    /**
     *  Request for documents with entity ID
     *  (call 'isDocumentQueryExpired()' before sending command)
     *
     * @param {ID} identifier   - entity ID
     * @param {Document[]} docs - exist documents
     * @return {boolean} false on duplicated
     */
    Archivist.prototype.queryDocuments = function (identifier, docs) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + docs);
    };

    /**
     *  Request for group members with group ID
     *  (call 'isMembersQueryExpired()' before sending command)
     *
     * @param {ID} identifier   - group ID
     * @param {ID[]} members    - exist members
     * @return {boolean} false on duplicated
     */
    Archivist.prototype.queryMembers = function (identifier, members) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + members);
    };

    /**
     *  Save meta for entity ID (must verify first)
     *
     * @param {Meta} meta     - entity meta
     * @param {ID} identifier - entity ID
     * @return {boolean} true on success
     */
    Archivist.prototype.saveMeta = function (meta, identifier) {
        throw new Error('Archivist::saveMeta: ' + identifier + ', ' + meta);
    };

    /**
     *  Save entity document with ID (must verify first)
     *
     * @param {Document} doc - entity document
     * @return {boolean} true on success
     */
    Archivist.prototype.saveDocument = function (doc) {
        throw new Error('Archivist::saveDocument: ' + doc);
    };


    //-------- namespace --------
    ns.Archivist = Archivist;

})(DIMP);
