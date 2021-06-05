;
// license: https://mit-license.org
//
//  Star Trek: Interstellar Transport
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
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

/**
 *  Star Ship
 *  ~~~~~~~~~
 *
 *  Container carrying data package
 */

//! require <dimp.js>
//! require 'namespace.js'

(function (ns) {
    "use strict";

    var Ship = function () {
    };
    DIMP.Interface(Ship, null);

    /**
     *  Get the data package in this Ship
     *
     * @return {Uint8Array} the whole package
     */
    Ship.prototype.getPackage = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get ID for this Ship
     *
     * @return {Uint8Array} SN
     */
    Ship.prototype.getSN = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Get data in this Ship
     *
     * @return {Uint8Array} payload
     */
    Ship.prototype.getPayload = function () {
        console.assert(false, 'implement me!');
        return null;
    };

    /**
     *  Ship Delegate
     *  ~~~~~~~~~~~~~
     */
    var ShipDelegate = function () {
    };
    DIMP.Interface(ShipDelegate, null);

    // noinspection JSUnusedLocalSymbols
    /**
     *  Callback when package sent
     *
     * @param {Ship} ship      - package container
     * @param {Error} error     - null on success
     */
    ShipDelegate.prototype.onShipSent = function (ship, error) {
        console.assert(false, 'implement me!');
    };

    Ship.Delegate = ShipDelegate;

    //-------- namespace --------
    ns.Ship = Ship;

    ns.register('Ship');

})(StarTrek);
