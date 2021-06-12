;
// license: https://mit-license.org
//
//  Star Gate: Interfaces for network connection
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

//! require 'startrek/stardocker.js'
//! require 'startrek/starship.js'
//! require 'ship.js'

(function (ns, base, sys) {
    "use strict";

    var StarDocker = base.StarDocker;
    var StarShip = base.StarShip;
    var WSShip = ns.WSShip;

    var WSDocker = function (gate) {
        StarDocker.call(this, gate);
    };
    sys.Class(WSDocker, StarDocker, null);

    WSDocker.prototype.pack = function (payload, priority, delegate) {
        return new WSShip(payload, priority, delegate);
    };

    WSDocker.prototype.getIncomeShip = function () {
        var gate = this.getGate();
        var pack = gate.receive(1024 * 1024, true);
        if (!pack) {
            // received nothing
            return null;
        }
        return new WSShip(pack, 0, null);
    };

    WSDocker.prototype.processIncomeShip = function (income) {
        var data = income.getPayload();
        if (data.length === 0) {
            // error
            return null;
        } else if (data.length === 2) {
            if (sys.type.Arrays.equals(data, OK)) {
                // just ignore
                return null;
            }
        } else if (data.length === 4) {
            if (sys.type.Arrays.equals(data, NOOP)) {
                // just ignore
                return null;
            } else if (sys.type.Arrays.equals(data, PONG)) {
                // just ignore
                return null;
            } else if (sys.type.Arrays.equals(data, PING)) {
                // 'PING' -> 'PONG'
                return new WSShip(PONG, StarShip.SLOWER, null);
            }
        }
        var gate = this.getGate();
        var delegate = gate.getDelegate();
        var res = delegate.onGateReceived(gate, income);
        if (res) {
            return new WSShip(res, StarShip.NORMAL, null);
        } else {
            return null;
        }
    };

    WSDocker.prototype.getHeartbeat = function () {
        return new WSShip(PING, StarShip.SLOWER, null);
    };

    var PING = sys.format.UTF8.encode('PING');
    var PONG = sys.format.UTF8.encode('PONG');
    var NOOP = sys.format.UTF8.encode('NOOP');
    var OK = sys.format.UTF8.encode('OK');

    //-------- namespace --------
    ns.WSDocker = WSDocker;

    ns.registers('WSDocker');

})(StarGate, StarTrek, MONKEY);
