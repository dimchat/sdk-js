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

//! require 'startrek/docker.js'
//! require 'hub.js'

(function (ns, sys) {
    "use strict";

    var StarGate = ns.StarGate;

    var BaseGate = function (delegate) {
        StarGate.call(this, delegate);
        this.__hub = null;
    };
    sys.Class(BaseGate, StarGate, null, {
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
        fetchDocker: function (remote, local, advanceParties) {
            var docker = this.getDocker(remote, local);
            if (!docker) {
                var hub = this.getHub();
                var conn = hub.connect(remote, local);
                if (conn) {
                    docker = this.createDocker(conn, advanceParties);
                    this.setDocker(docker.getRemoteAddress(), docker.getLocalAddress(), docker);
                }
            }
            return docker;
        },
        // Override
        getDocker: function (remote, local) {
            return StarGate.prototype.getDocker.call(this, remote, null);
        },
        // Override
        setDocker: function (remote, local, docker) {
            return StarGate.prototype.setDocker.call(this, remote, null, docker);
        },
        // Override
        removeDocker: function (remote, local, docker) {
            return StarGate.prototype.setDocker.removeDocker(this, remote, null, docker);
        },
        /*/
        // Override
        heartbeat: function (connection) {
            // let the client to do the job
            if (connection instanceof ActiveConnection) {
                super.heartbeat(connection);
            }
        },
        /*/
        // Override
        cacheAdvanceParty: function (data, connection) {
            // TODO: cache the advance party before decide which docker to user
            var array = [];
            if (data && data.length > 0) {
                array.push(data);
            }
            return array;
        },
        // Override
        clearAdvanceParty: function (connection) {
            // TODO: remove cached advance party for this connection
        }
    });

    //-------- namespace --------
    ns.BaseGate = BaseGate;

    ns.registers('BaseGate');

})(StarTrek, MONKEY);

(function (ns, sys) {
    "use strict";

    var Thread = sys.threading.Thread;
    var BaseGate = ns.BaseGate;

    var AutoGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__daemon = new Thread(this);
    };
    sys.Class(AutoGate, BaseGate, null, {
        //
        //  Threading
        //
        isRunning: function () {
            return this.__daemon.isRunning();
        },
        start: function () {
            this.stop();
            this.__daemon.start();
        },
        stop: function () {
            this.__daemon.stop();
        },

        // Override
        run: function () {
            this.process();
            return true;
        },

        // Override
        process: function () {
            try {
                var hub = this.getHub();
                var incoming = hub.process();
                var outgoing = BaseGate.prototype.process.call(this);
                return incoming || outgoing;
            } catch (e) {
                console.error('AutoGate::process()', e);
                return false;
            }
        }
    });

    //-------- namespace --------
    ns.AutoGate = AutoGate;

    ns.registers('AutoGate');

})(StarTrek, MONKEY);

(function (ns, sys) {
    "use strict";

    var AutoGate = ns.AutoGate;
    var PlainDocker = ns.PlainDocker;

    var WSGate = function (delegate) {
        AutoGate.call(this, delegate);
    };
    sys.Class(WSGate, AutoGate, null, {
        /**
         *  Send payload to remote address
         *
         * @param {Uint8Array} payload
         * @param {SocketAddress} remote
         * @param {SocketAddress} local
         * @return {boolean} false on error
         */
        sendMessage: function (payload, remote, local) {
            var docker = this.fetchDocker(remote, local, null);
            if (!docker || !docker.isOpen()) {
                return false;
            }
            return docker.sendData(payload);
        },

        //
        //  Docker
        //

        // Override
        createDocker: function (connection, advanceParties) {
            // TODO: check data format before creating docker
            var docker = new PlainDocker(connection);
            docker.setDelegate(this.getDelegate());
            return docker;
        },

        //
        //  Connection Delegate
        //

        // Override
        onConnectionStateChanged: function (previous, current, connection) {
            AutoGate.prototype.onConnectionStateChanged.call(this, previous, current, connection);
            var remote = connection.getRemoteAddress();
            if (remote) remote = remote.toString();
            if (previous) previous = previous.toString();
            if (current) current = current.toString();
            console.info('connection state changed: ', previous, current, remote);
        },

        // Override
        onConnectionFailed: function (error, data, connection) {
            AutoGate.prototype.onConnectionFailed.call(this, error, data, connection);
            var remote = connection.getRemoteAddress();
            if (remote) remote = remote.toString();
            console.info('connection failed: ', error, data, remote);
        },

        // Override
        onConnectionError: function (error, connection) {
            AutoGate.prototype.onConnectionError.call(this, error, connection);
            var remote = connection.getRemoteAddress();
            if (remote) remote = remote.toString();
            console.info('connection error: ', error, remote);
        }
    });

    //-------- namespace --------
    ns.WSGate = WSGate;

    ns.registers('WSGate');

})(StarTrek, MONKEY);
