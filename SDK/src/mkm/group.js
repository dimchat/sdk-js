'use strict';
// license: https://mit-license.org
//
//  Ming-Ke-Ming : Decentralized User Identity Authentication
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

//! require 'entity.js'
//! require 'utils.js'

    /**
     *  This class is for creating group
     *
     *      roles:
     *          founder
     *          owner
     *          members
     *          administrators - Optional
     *          assistants     - group bots
     */
    mkm.mkm.Group = Interface(null, [Entity]);
    var Group = mkm.mkm.Group;

    /**
     *  Get group document
     *
     * @return {Bulletin}
     */
    Group.prototype.getBulletin = function () {};

    /**
     *  Get group founder
     *
     * @return {ID}
     */
    Group.prototype.getFounder = function () {};

    /**
     *  Get group owner
     *
     * @return {ID}
     */
    Group.prototype.getOwner = function () {};

    /**
     *  Get group members
     *  (NOTICE: the owner must be a member, usually the first one)
     *
     * @return {ID[]}
     */
    Group.prototype.getMembers = function () {};

    /**
     *  Get group assistants
     *
     * @return {ID[]} bots IDs
     */
    Group.prototype.getAssistants = function () {};

    /**
     *  This interface is for getting information for group
     *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     *  1. founder has the same public key with the group's meta.key
     *  2. owner and members should be set complying with the consensus algorithm
     */
    Group.DataSource = Interface(null, [EntityDataSource]);
    var GroupDataSource = Group.DataSource;

    /**
     *  Get group founder
     *
     * @param {ID} identifier - group ID
     * @returns {ID}
     */
    GroupDataSource.prototype.getFounder = function (identifier) {};

    /**
     *  Get group owner
     *
     * @param {ID} identifier - group ID
     * @returns {ID}
     */
    GroupDataSource.prototype.getOwner = function (identifier) {};

    /**
     *  Get group members list
     *
     * @param {ID} identifier - group ID
     * @returns {ID[]}
     */
    GroupDataSource.prototype.getMembers = function (identifier) {};

    /**
     *  Get assistants for this group
     *
     * @param {ID} identifier - group ID
     * @returns {ID[]} robot ID list
     */
    GroupDataSource.prototype.getAssistants = function (identifier) {};


    //
    //  Base Group
    //
    mkm.mkm.BaseGroup = function (identifier) {
        BaseEntity.call(this, identifier);
        this.__founder = null;
    };
    var BaseGroup = mkm.mkm.BaseGroup;

    Class(BaseGroup, BaseEntity, [Group], {

        // Override
        getBulletin: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastBulletin(docs);
        },

        // Override
        getFounder: function () {
            var founder = this.__founder;
            if (!founder) {
                var facebook = this.getDataSource();
                var group = this.getIdentifier();
                founder = facebook.getFounder(group);
                this.__founder = founder;
            }
            return founder;
        },

        // Override
        getOwner: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getOwner(group);
        },

        // Override
        getMembers: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getMembers(group);
        },

        // Override
        getAssistants: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getAssistants(group);
        }
    });
