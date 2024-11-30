;
// license: https://mit-license.org
//
//  Web Socket
//
//                               Written in 2022 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2022 Albert Moky
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

//! require <startrek.js>
//! require 'hub.js'

(function (ns, sys) {
    "use strict";

    var Class            = sys.type.Class;
    var Log              = ns.lnc.Log;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StarGate         = ns.StarGate;

    /**
     *  Common Gate
     *  ~~~~~~~~~~~
     *  Gate with hub for connection
     *
     * @param {PorterDelegate} keeper
     */
    var BaseGate = function (keeper) {
        StarGate.call(this, keeper);
        this.__hub = null;
    };
    Class(BaseGate, StarGate, null, {

        //
        //  Hub
        //
        setHub: function (hub) {
            this.__hub = hub;
        },
        getHub: function () {
            return this.__hub;
        },

        //
        //  Docker
        //

        // Override
        removePorter: function (remote, local, porter) {
            return StarGate.prototype.removePorter.call(this, remote, null, porter);
        },
        // Override
        getPorter: function (remote, local) {
            return StarGate.prototype.getPorter.call(this, remote, null);
        },
        // Override
        setPorter: function (remote, local, porter) {
            return StarGate.prototype.setPorter.call(this, remote, null, porter);
        },

        fetchPorter: function (remote, local) {
            // get connection from hub
            var hub = this.getHub();
            if (!hub) {
                throw new ReferenceError('Gate hub not found');
            }
            var conn = hub.connect(remote, local);
            if (!conn) {
                // failed to get connection
                return null;
            }
            // connected, get docker with this connection
            return this.dock(conn, true);
        },

        /**
         *  Send payload to remote address
         *
         * @param {Uint8Array} payload
         * @param {Arrival} ship
         * @param {SocketAddress} remote
         * @param {SocketAddress} local
         * @return {boolean} false on error
         */
        sendResponse: function (payload, ship, remote, local) {
            var docker = this.getPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false;
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false;
            }
            return docker.sendData(payload);
        },

        //
        //  Keep Active
        //

        // Override
        heartbeat: function (connection) {
            // let the client to do the job
            if (connection instanceof ActiveConnection) {
                StarGate.prototype.heartbeat.call(this, connection);
            }
        }
    });

    //-------- namespace --------
    ns.BaseGate = BaseGate;

})(StarGate, MONKEY);

(function (ns, fsm, sys) {
    "use strict";

    var Class       = sys.type.Class;
    var Log         = ns.lnc.Log;
    var Runnable    = fsm.skywalker.Runnable;
    var Thread      = fsm.threading.Thread;
    var BaseGate    = ns.BaseGate;

    var AutoGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__running = false;
        this.__thread = new Thread(this);
    };
    Class(AutoGate, BaseGate, [Runnable], {

        isRunning: function () {
            return this.__running;
        },

        start: function () {
            // 1. mark this gate to running
            this.__running = true;
            // 2. start an async task for this gate
            this.__thread.start();
        },
        stop: function () {
            // 1. mark this gate to stopped
            this.__running = false;
            // 2. waiting for the gate to stop
            // 3. cancel the async task
        },

        // Override
        run: function () {
            if (!this.isRunning()) {
                return false;
            }
            var busy = this.process();
            if (busy) {
                Log.debug('client busy', busy);
            }
            return true;
        },

        process: function () {
            var hub = this.getHub();
            try {
                var incoming = hub.process();
                var outgoing = BaseGate.prototype.process.call(this);
                return incoming || outgoing;
            } catch (e) {
                Log.error('client process error', e);
            }
        },

        getChannel: function (remote, local) {
            var hub = this.getHub();
            return hub.open(remote, local);
        }
    });

    //-------- namespace --------
    ns.AutoGate = AutoGate;

})(StarGate, FiniteStateMachine, MONKEY);

(function (ns, sys) {
    "use strict";

    var Class       = sys.type.Class;
    var Log         = ns.lnc.Log;
    var AutoGate    = ns.AutoGate;
    var PlainPorter = ns.PlainPorter;

    var WSClientGate = function (delegate) {
        AutoGate.call(this, delegate);
    };
    Class(WSClientGate, AutoGate, null, {

        // Override
        createPorter: function (remote, local) {
            // TODO: check data format before creating docker
            var docker = new PlainPorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker;
        },

        /**
         *  Send payload to remote address
         *
         * @param {Uint8Array} payload
         * @param {SocketAddress} remote
         * @param {SocketAddress} local
         * @return {boolean} false on error
         */
        sendMessage: function (payload, remote, local) {
            var docker = this.fetchPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false;
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false;
            }
            return docker.sendData(payload);
        }
    });

    //-------- namespace --------
    ns.WSClientGate = WSClientGate;

})(StarGate, MONKEY);
