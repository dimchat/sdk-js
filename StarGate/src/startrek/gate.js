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

    var Class = sys.type.Class;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StarGate = ns.StarGate;

    var BaseGate = function (delegate) {
        StarGate.call(this, delegate);
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
            return StarGate.prototype.removeDocker.call(this, remote, null, docker);
        },
        // Override
        heartbeat: function (connection) {
            // let the client to do the job
            if (connection instanceof ActiveConnection) {
                StarGate.prototype.heartbeat.call(this, connection);
            }
        },
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

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var BaseGate = ns.BaseGate;

    var CommonGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__running = false;
    };
    Class(CommonGate, BaseGate, null, {
        isRunning: function () {
            return this.__running;
        },
        start: function () {
            this.__running = true;
        },
        stop: function () {
            this.__running = false;
        },

        getChannel: function (remote, local) {
            var hub = this.getHub();
            return hub.open(remote, local);
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
            var docker = this.fetchDocker(remote, local, null);
            if (!docker || !docker.isOpen()) {
                return false;
            }
            return docker.sendData(payload);
        }
    });

    //-------- namespace --------
    ns.CommonGate = CommonGate;

})(StarGate, MONKEY);

(function (ns, sys) {
    "use strict";

    var Class = sys.type.Class;
    var CommonGate = ns.CommonGate;
    var PlainDocker = ns.PlainDocker;

    var WSClientGate = function (delegate) {
        CommonGate.call(this, delegate);
    };
    Class(WSClientGate, CommonGate, null, {

        //
        //  Docker
        //

        // Override
        createDocker: function (connection, advanceParties) {
            // TODO: check data format before creating docker
            var docker = new PlainDocker(connection);
            docker.setDelegate(this.getDelegate());
            return docker;
        }
    });

    //-------- namespace --------
    ns.WSClientGate = WSClientGate;

})(StarGate, MONKEY);
