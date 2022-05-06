/**
 *  StarGate (v0.2.0)
 *  (Interfaces for network connection)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      May. 7, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof LocalNotificationService !== "object") {
    LocalNotificationService = new MONKEY.Namespace();
}
if (typeof FileSystem !== "object") {
    FileSystem = new MONKEY.Namespace();
}
if (typeof StarGate !== "object") {
    StarGate = new MONKEY.Namespace();
}
(function (ns, base, sys) {
    base.exports(ns);
    if (typeof ns.ws !== "object") {
        ns.ws = new MONKEY.Namespace();
    }
    ns.registers("ws");
})(StarGate, StarTrek, MONKEY);
(function (ns, sys) {
    var JsON = sys.format.JSON;
    var Base64 = sys.format.Base64;
    var Storage = function (storage, prefix) {
        Object.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix;
        } else {
            this.ROOT = "dim";
        }
    };
    sys.Class(Storage, Object, null, null);
    Storage.prototype.getItem = function (key) {
        return this.storage.getItem(key);
    };
    Storage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value);
    };
    Storage.prototype.removeItem = function (key) {
        this.storage.removeItem(key);
    };
    Storage.prototype.clear = function () {
        this.storage.clear();
    };
    Storage.prototype.getLength = function () {
        return this.storage.length;
    };
    Storage.prototype.key = function (index) {
        return this.storage.key(index);
    };
    Storage.prototype.exists = function (path) {
        return !!this.getItem(this.ROOT + "." + path);
    };
    Storage.prototype.loadText = function (path) {
        return this.getItem(this.ROOT + "." + path);
    };
    Storage.prototype.loadData = function (path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null;
        }
        return Base64.decode(base64);
    };
    Storage.prototype.loadJSON = function (path) {
        var json = this.loadText(path);
        if (!json) {
            return null;
        }
        return JsON.decode(json);
    };
    Storage.prototype.remove = function (path) {
        this.removeItem(this.ROOT + "." + path);
        return true;
    };
    Storage.prototype.saveText = function (text, path) {
        if (text) {
            this.setItem(this.ROOT + "." + path, text);
            return true;
        } else {
            this.removeItem(this.ROOT + "." + path);
            return false;
        }
    };
    Storage.prototype.saveData = function (data, path) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data);
        }
        return this.saveText(base64, path);
    };
    Storage.prototype.saveJSON = function (container, path) {
        var json = null;
        if (container) {
            json = JsON.encode(container);
        }
        return this.saveText(json, path);
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.registers("LocalStorage");
    ns.registers("SessionStorage");
})(FileSystem, MONKEY);
(function (ns, sys) {
    var Notification = function (name, sender, userInfo) {
        Object.call(this);
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo;
    };
    sys.Class(Notification, Object, null, null);
    ns.Notification = Notification;
    ns.registers("Notification");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var Observer = function () {};
    sys.Interface(Observer, null);
    Observer.prototype.onReceiveNotification = function (notification) {
        console.assert(false, "implement me!");
    };
    ns.Observer = Observer;
    ns.registers("Observer");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var Arrays = sys.type.Arrays;
    var Dictionary = sys.type.Dictionary;
    var Notification = ns.Notification;
    var Observer = ns.Observer;
    var Center = function () {
        Object.call(this);
        this.__observers = new Dictionary();
    };
    sys.Class(Center, Object, null, null);
    Center.prototype.addObserver = function (observer, name) {
        var list = this.__observers.getValue(name);
        if (list) {
            if (list.indexOf(observer) >= 0) {
                return;
            }
        } else {
            list = [];
            this.__observers.setValue(name, list);
        }
        list.push(observer);
    };
    Center.prototype.removeObserver = function (observer, name) {
        if (name) {
            var list = this.__observers.getValue(name);
            if (list) {
                Arrays.remove(list, observer);
            }
        } else {
            var names = this.__observers.allKeys();
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i]);
            }
        }
    };
    Center.prototype.postNotification = function (
        notification,
        sender,
        userInfo
    ) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo);
        }
        var observers = this.__observers.getValue(notification.name);
        if (!observers) {
            return;
        }
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (sys.Interface.conforms(obs, Observer)) {
                obs.onReceiveNotification(notification);
            } else {
                if (typeof obs === "function") {
                    obs.call(
                        notification,
                        notification.name,
                        notification.sender,
                        notification.userInfo
                    );
                }
            }
        }
    };
    var s_notification_center = null;
    Center.getInstance = function () {
        if (!s_notification_center) {
            s_notification_center = new Center();
        }
        return s_notification_center;
    };
    ns.NotificationCenter = Center;
    ns.registers("NotificationCenter");
})(LocalNotificationService, MONKEY);
(function (ns, sys) {
    var ConstantString = sys.type.ConstantString;
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        this.ip = ip;
        this.port = port;
        this.data = data;
    };
    sys.Class(Host, ConstantString, null, null);
    Host.prototype.toArray = function (default_port) {
        var data = this.data;
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index];
            }
            array[len] = port >> 8;
            array[len + 1] = port & 255;
        }
        return array;
    };
    ns.Host = Host;
    ns.registers("Host");
})(StarGate, MONKEY);
(function (ns, sys) {
    var Host = ns.Host;
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5];
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(4);
                var array = ip.split(".");
                for (var index = 0; index < 4; ++index) {
                    data[index] = parseInt(array[index], 10);
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port);
            }
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = ip + ":" + port;
        }
        Host.call(this, string, ip, port, data);
    };
    sys.Class(IPv4, Host, null);
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function (host) {
        if (!this.patten.test(host)) {
            return null;
        }
        var pair = host.split(":");
        var ip = pair[0],
            port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1]);
        }
        return new IPv4(ip, port);
    };
    ns.IPv4 = IPv4;
    ns.registers("IPv4");
})(StarGate, MONKEY);
(function (ns, sys) {
    var Host = ns.Host;
    var parse_v4 = function (data, array) {
        var item,
            index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item;
        }
        return data;
    };
    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf("::");
        if (pos < 0) {
            array = ip.split(":");
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255;
            }
        } else {
            var left = ip.substring(0, pos).split(":");
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255;
            }
            var right = ip.substring(pos + 2).split(":");
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 255;
                data[--index] = item >> 8;
            }
        }
        return data;
    };
    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16);
            }
            return Number(hi).toString(16) + "0" + Number(lo).toString(16);
        } else {
            return Number(lo).toString(16);
        }
    };
    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ":" + hex_encode(data[index], data[index + 1]);
                }
                ip = ip.replace(/:(0:){2,}/, "::");
                ip = ip.replace(/^(0::)/, "::");
                ip = ip.replace(/(::0)$/, "::");
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17];
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(16);
                var array = ip.split(".");
                if (array.length === 1) {
                    data = parse_v6(data, ip, 8);
                } else {
                    if (array.length === 4) {
                        var prefix = array[0];
                        var pos = prefix.lastIndexOf(":");
                        array[0] = prefix.substring(pos + 1);
                        prefix = prefix.substring(0, pos);
                        data = parse_v6(data, prefix, 6);
                        data = parse_v4(data, array);
                    } else {
                        throw new URIError("IPv6 format error: " + ip);
                    }
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port);
            }
        }
        var string;
        if (port === 0) {
            string = ip;
        } else {
            string = "[" + ip + "]:" + port;
        }
        Host.call(this, string, ip, port, data);
    };
    sys.Class(IPv6, Host, null);
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat =
        /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function (host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null;
        }
        var ip, port;
        if (host.charAt(0) === "[") {
            var pos = host.indexOf("]");
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2));
        } else {
            ip = host;
            port = 0;
        }
        return new IPv6(ip, port);
    };
    ns.IPv6 = IPv6;
    ns.registers("IPv6");
})(StarGate, MONKEY);
(function (ns, sys) {
    var ArrivalShip = ns.ArrivalShip;
    var PlainArrival = function (data, now) {
        ArrivalShip.call(this, now);
        this.__data = data;
    };
    sys.Class(PlainArrival, ArrivalShip, null, null);
    PlainArrival.prototype.getPackage = function () {
        return this.__data;
    };
    PlainArrival.prototype.getSN = function () {
        return null;
    };
    PlainArrival.prototype.assemble = function (arrival) {
        console.assert(arrival === this, "plain arrival error", arrival, this);
        return arrival;
    };
    ns.ws.PlainArrival = PlainArrival;
    ns.ws.registers("PlainArrival");
})(StarGate, MONKEY);
(function (ns, sys) {
    var DepartureShip = ns.DepartureShip;
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0;
        }
        DepartureShip.call(this, prior, DepartureShip.DISPOSABLE);
        this.__completed = data;
        this.__fragments = [data];
    };
    sys.Class(PlainDeparture, DepartureShip, null, null);
    PlainDeparture.prototype.getPackage = function () {
        return this.__completed;
    };
    PlainDeparture.prototype.getSN = function () {
        return null;
    };
    PlainDeparture.prototype.getFragments = function () {
        return this.__fragments;
    };
    PlainDeparture.prototype.checkResponse = function (arrival) {
        return false;
    };
    ns.ws.PlainDeparture = PlainDeparture;
    ns.ws.registers("PlainDeparture");
})(StarGate, MONKEY);
(function (ns, sys) {
    var UTF8 = sys.type.UTF8;
    var StarDocker = ns.StarDocker;
    var Departure = ns.port.Departure;
    var PlainArrival = ns.ws.PlainArrival;
    var PlainDeparture = ns.ws.PlainDeparture;
    var PlainDocker = function (connection) {
        StarDocker.call(this, connection);
    };
    sys.Class(PlainDocker, StarDocker, null, {
        send: function (payload, priority) {
            var ship = this.createDeparture(payload, priority);
            return this.sendShip(ship);
        },
        sendData: function (payload) {
            return this.send(payload, Departure.Priority.NORMAL.valueOf());
        },
        heartbeat: function () {
            init_bytes();
            this.send(PING, Departure.SLOWER.valueOf());
        },
        getArrival: function (data) {
            if (!data || data.length === 0) {
                return null;
            }
            return this.createArrival(data);
        },
        checkArrival: function (arrival) {
            var data = arrival.getPackage();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    this.send(PONG, Departure.Priority.SLOWER.valueOf());
                } else {
                    if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                        return null;
                    }
                }
            }
            return arrival;
        }
    });
    PlainDocker.prototype.createArrival = function (data) {
        return new PlainArrival(data, null);
    };
    PlainDocker.prototype.createDeparture = function (data, priority) {
        return new PlainDeparture(data, priority);
    };
    var bytes_equal = function (data1, data2) {
        if (data1.length !== data2.length) {
            return false;
        }
        for (var i = data1.length - 1; i >= 0; --i) {
            if (data1[i] !== data2[i]) {
                return false;
            }
        }
        return true;
    };
    var init_bytes = function () {
        if (typeof PING === "string") {
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP);
        }
    };
    var PING = "PING";
    var PONG = "PONG";
    var NOOP = "NOOP";
    ns.ws.PlainDocker = PlainDocker;
    ns.ws.registers("PlainDocker");
})(StarGate, MONKEY);
(function (ns, sys) {
    var SocketAddress = ns.type.SocketAddress;
    var connect = function (url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function (ev) {
            proxy.onConnected();
        };
        ws.onclose = function (ev) {
            proxy.onClosed();
        };
        ws.onerror = function (ev) {
            var error = new Error("WebSocket error: " + ev);
            proxy.onError(error);
        };
        ws.onmessage = function (ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return;
            } else {
                if (typeof data === "string") {
                    data = sys.format.UTF8.encode(data);
                } else {
                    if (data instanceof Uint8Array) {
                    } else {
                        data = new Uint8Array(data);
                    }
                }
            }
            proxy.onReceived(data);
        };
        return ws;
    };
    var build_url = function (host, port) {
        if ("https" === window.location.protocol.split(":")[0]) {
            return "wss://" + host + ":" + port;
        } else {
            return "ws://" + host + ":" + port;
        }
    };
    var Socket = function () {
        Object.call(this);
        this.__packages = [];
        this.__connected = false;
        this.__closed = false;
        this.__host = null;
        this.__port = null;
        this.__ws = null;
    };
    sys.Class(Socket, Object, null);
    Socket.prototype.getHost = function () {
        return this.__host;
    };
    Socket.prototype.getPort = function () {
        return this.__port;
    };
    Socket.prototype.onConnected = function () {
        this.__connected = true;
    };
    Socket.prototype.onClosed = function () {
        this.__closed = true;
    };
    Socket.prototype.onError = function (error) {};
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data);
    };
    Socket.prototype.configureBlocking = function () {};
    Socket.prototype.isBlocking = function () {
        return false;
    };
    Socket.prototype.isOpen = function () {
        return !this.__closed;
    };
    Socket.prototype.isConnected = function () {
        return this.__connected;
    };
    Socket.prototype.isBound = function () {
        return true;
    };
    Socket.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound());
    };
    Socket.prototype.bind = function (local) {};
    Socket.prototype.connect = function (remote) {
        this.close();
        this.__host = remote.getHost();
        this.__port = remote.getPort();
        var url = build_url(this.__host, this.__port);
        this.__ws = connect(url, this);
    };
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null;
        }
    };
    Socket.prototype.read = function (maxLen) {
        if (this.__packages.length > 0) {
            return this.__packages.shift();
        } else {
            return null;
        }
    };
    Socket.prototype.write = function (data) {
        this.__ws.send(data);
        return data.length;
    };
    Socket.prototype.receive = function (maxLen) {
        return this.read(maxLen);
    };
    Socket.prototype.send = function (data, remote) {
        return this.write(data);
    };
    ns.ws.Socket = Socket;
    ns.ws.registers("Socket");
})(StarGate, MONKEY);
(function (ns, sys) {
    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel);
    };
    sys.Class(StreamChannelReader, ChannelReader, null, {
        receive: function (maxLen) {
            return this.read(maxLen);
        }
    });
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel);
    };
    sys.Class(StreamChannelWriter, ChannelWriter, null, {
        send: function (data, target) {
            return this.write(data);
        }
    });
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;
    ns.ws.registers("StreamChannelReader");
    ns.ws.registers("StreamChannelWriter");
})(StarGate, MONKEY);
(function (ns, sys) {
    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = ns.ws.StreamChannelReader;
    var StreamChannelWriter = ns.ws.StreamChannelWriter;
    var StreamChannel = function (remote, local, sock) {
        BaseChannel.call(this, remote, local, sock);
    };
    sys.Class(StreamChannel, BaseChannel, null, {
        createReader: function () {
            return new StreamChannelReader(this);
        },
        createWriter: function () {
            return new StreamChannelWriter(this);
        }
    });
    ns.ws.StreamChannel = StreamChannel;
    ns.ws.registers("StreamChannel");
})(StarGate, MONKEY);
(function (ns, sys) {
    var AddressPairMap = ns.type.AddressPairMap;
    var ChannelPool = function () {
        AddressPairMap.call(this);
    };
    sys.Class(ChannelPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var old = this.get(remote, local);
            if (old && old !== value) {
                this.remove(remote, local, old);
            }
            AddressPairMap.prototype.set.call(this, remote, local, value);
        },
        remove: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(
                this,
                remote,
                local,
                value
            );
            if (cached && cached.isOpen()) {
                try {
                    cached.close();
                } catch (e) {
                    console.error(
                        "ChannelPool::remove()",
                        e,
                        remote,
                        local,
                        value,
                        cached
                    );
                }
            }
            return cached;
        }
    });
    ns.ws.ChannelPool = ChannelPool;
    ns.ws.registers("ChannelPool");
})(StarGate, MONKEY);
(function (ns, sys) {
    var BaseHub = ns.socket.BaseHub;
    var ChannelPool = ns.ws.ChannelPool;
    var StreamChannel = ns.ws.StreamChannel;
    var StreamHub = function (delegate) {
        BaseHub.call(this, delegate);
        this.__channelPool = this.createChannelPool();
    };
    sys.Class(StreamHub, BaseHub, null, null);
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool();
    };
    StreamHub.prototype.createChannel = function (remote, local, sock) {
        return new StreamChannel(remote, local, sock);
    };
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.allValues();
    };
    StreamHub.prototype.getChannel = function (remote, local) {
        return this.__channelPool.get(remote, local);
    };
    StreamHub.prototype.setChannel = function (remote, local, channel) {
        this.__channelPool.set(remote, local, channel);
    };
    StreamHub.prototype.removeChannel = function (remote, local, channel) {
        this.__channelPool.remove(remote, local, channel);
    };
    StreamHub.prototype.open = function (remote, local) {
        return this.getChannel(remote, local);
    };
    ns.ws.StreamHub = StreamHub;
    ns.ws.registers("StreamHub");
})(StarGate, MONKEY);
(function (ns, sys) {
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;
    var StreamClientHub = function (delegate) {
        StreamHub.call(this, delegate);
    };
    sys.Class(StreamClientHub, StreamHub, null, {
        createConnection: function (remote, local, channel) {
            var conn = new ActiveConnection(remote, local, channel, this);
            conn.setDelegate(this.getDelegate());
            conn.start();
            return conn;
        },
        open: function (remote, local) {
            var channel = StreamHub.prototype.open.call(this, remote, local);
            if (!channel) {
                channel = createSocketChannel.call(this, remote, local);
                if (channel) {
                    this.setChannel(
                        channel.getRemoteAddress(),
                        channel.getLocalAddress(),
                        channel
                    );
                }
            }
            return channel;
        }
    });
    var createSocketChannel = function (remote, local) {
        try {
            var sock = createWebSocketClient(remote, local);
            if (!local) {
                local = sock.getLocalAddress();
            }
            return this.createChannel(remote, local, sock);
        } catch (e) {
            console.error("StreamClientHub::createSocketChannel()", e, remote, local);
            return null;
        }
    };
    var createWebSocketClient = function (remote, local) {
        var sock = new Socket();
        sock.configureBlocking(true);
        if (local) {
            sock.bind(local);
        }
        sock.connect(remote);
        sock.configureBlocking(false);
        return sock;
    };
    ns.ws.StreamClientHub = StreamClientHub;
    ns.ws.registers("StreamClientHub");
})(StarGate, MONKEY);
