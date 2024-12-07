/**
 *  StarGate (v1.0.0)
 *  (Interfaces for network connection)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 22, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof StarGate !== 'object') {
    StarGate = StarTrek
}
(function (ns) {
    "use strict";
    if (typeof ns.fsm !== 'object') {
        ns.fsm = FiniteStateMachine
    }
    if (typeof ns.dos !== 'object') {
        ns.dos = {}
    }
    if (typeof ns.lnc !== 'object') {
        ns.lnc = {}
    }
    if (typeof ns.network !== 'object') {
        ns.network = {}
    }
    if (typeof ns.ws !== 'object') {
        ns.ws = {}
    }
})(StarGate);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var JsON = sys.format.JSON;
    var Base64 = sys.format.Base64;
    var Storage = function (storage, prefix) {
        Object.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = 'dim'
        }
    };
    Class(Storage, Object, null, null);
    Storage.prototype.getItem = function (key) {
        return this.storage.getItem(key)
    };
    Storage.prototype.setItem = function (key, value) {
        this.storage.setItem(key, value)
    };
    Storage.prototype.removeItem = function (key) {
        this.storage.removeItem(key)
    };
    Storage.prototype.clear = function () {
        this.storage.clear()
    };
    Storage.prototype.getLength = function () {
        return this.storage.length
    };
    Storage.prototype.key = function (index) {
        return this.storage.key(index)
    };
    Storage.prototype.exists = function (path) {
        return !!this.getItem(this.ROOT + '.' + path)
    };
    Storage.prototype.loadText = function (path) {
        return this.getItem(this.ROOT + '.' + path)
    };
    Storage.prototype.loadData = function (path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null
        }
        return Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function (path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return JsON.decode(json)
    };
    Storage.prototype.remove = function (path) {
        this.removeItem(this.ROOT + '.' + path);
        return true
    };
    Storage.prototype.saveText = function (text, path) {
        if (text) {
            this.setItem(this.ROOT + '.' + path, text);
            return true
        } else {
            this.removeItem(this.ROOT + '.' + path);
            return false
        }
    };
    Storage.prototype.saveData = function (data, path) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function (container, path) {
        var json = null;
        if (container) {
            json = JsON.encode(container)
        }
        return this.saveText(json, path)
    };
    ns.dos.LocalStorage = new Storage(window.localStorage, 'dim.fs');
    ns.dos.SessionStorage = new Storage(window.sessionStorage, 'dim.mem')
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var Enum = sys.type.Enum;
    var debugFlag = 1 << 0;
    var infoFlag = 1 << 1;
    var warningFlag = 1 << 2;
    var errorFlag = 1 << 3;
    var LogLevel = Enum('LogLevel', {
        DEBUG: debugFlag | infoFlag | warningFlag | errorFlag,
        DEVELOP: infoFlag | warningFlag | errorFlag,
        RELEASE: warningFlag | errorFlag
    });
    var check_level = function (flag) {
        return shared.level & flag
    };
    var Log = {
        debug: function (...data) {
            if (check_level(debugFlag)) {
                shared.logger.debug.apply(shared.logger, arguments)
            }
        }, info: function (...data) {
            if (check_level(infoFlag)) {
                shared.logger.info.apply(shared.logger, arguments)
            }
        }, warning: function (...data) {
            if (check_level(warningFlag)) {
                shared.logger.warning.apply(shared.logger, arguments)
            }
        }, error: function (...data) {
            if (check_level(errorFlag)) {
                shared.logger.error.apply(shared.logger, arguments)
            }
        }, showTime: false
    };
    Log.setLevel = function (level) {
        if (Enum.isEnum(level)) {
            level = level.getValue()
        }
        shared.level = level
    };
    Log.setLogger = function (logger) {
        shared.logger = logger
    };
    var Logger = Interface(null, null);
    Logger.prototype.debug = function (...data) {
    };
    Logger.prototype.info = function (...data) {
    };
    Logger.prototype.warning = function (...data) {
    };
    Logger.prototype.error = function (...data) {
    };
    var DefaultLogger = function () {
        Object.call(this)
    };
    Class(DefaultLogger, Object, [Logger], {
        debug: function () {
            console.debug.apply(console, _args(arguments))
        }, info: function () {
            console.info.apply(console, _args(arguments))
        }, warning: function () {
            console.warn.apply(console, _args(arguments))
        }, error: function () {
            console.error.apply(console, _args(arguments))
        }
    });
    var _args = function (args) {
        if (Log.showTime === false) {
            return args
        }
        var array = ['[' + current_time() + ']'];
        for (var i = 0; i < args.length; ++i) {
            array.push(args[i])
        }
        return array
    };
    var current_time = function () {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var date = now.getDate();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();
        return year + '-' + _pad(month + 1) + '-' + _pad(date) + ' ' + _pad(hours) + ':' + _pad(minutes) + ':' + _pad(seconds)
    };
    var _pad = function (value) {
        if (value < 10) {
            return '0' + value
        } else {
            return '' + value
        }
    };
    var shared = {logger: new DefaultLogger(), level: LogLevel.RELEASE.getValue()};
    ns.lnc.LogLevel = LogLevel;
    ns.lnc.Logger = Logger;
    ns.lnc.Log = Log
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Notification = function (name, sender, userInfo) {
        Object.call(this);
        this.__name = name;
        this.__sender = sender;
        this.__info = userInfo
    };
    Class(Notification, Object, null, {
        toString: function () {
            var clazz = this.getClassName();
            return '<' + clazz + ' name="' + this.getName() + '>\n' + '\t<sender>' + this.getSender() + '</sender>\n' + '\t<info>' + this.getUserInfo() + '</info>\n' + '</' + clazz + '>'
        }
    });
    Notification.prototype.getName = function () {
        return this.__name
    };
    Notification.prototype.getSender = function () {
        return this.__sender
    };
    Notification.prototype.getUserInfo = function () {
        return this.__info
    };
    ns.lnc.Notification = Notification
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Observer = Interface(null, null);
    Observer.prototype.onReceiveNotification = function (notification) {
    };
    ns.lnc.Observer = Observer
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Interface = sys.type.Interface;
    var Class = sys.type.Class;
    var HashSet = sys.type.HashSet;
    var Log = ns.lnc.Log;
    var Observer = ns.lnc.Observer;
    var BaseCenter = function () {
        Object.call(this);
        this.__observers = {}
    };
    Class(BaseCenter, Object, null, null);
    BaseCenter.prototype.addObserver = function (observer, name) {
        var set = this.__observers[name];
        if (!set) {
            set = new HashSet();
            this.__observers[name] = set
        } else if (set.contains(observer)) {
            return false
        }
        return set.add(observer)
    };
    BaseCenter.prototype.removeObserver = function (observer, name) {
        if (name) {
            remove.call(this, observer, name)
        } else {
            var names = Object.keys(this.__observers);
            for (var i = names.length - 1; i >= 0; --i) {
                remove.call(this, observer, names[i])
            }
        }
    };
    var remove = function (observer, name) {
        var set = this.__observers[name];
        if (set) {
            set.remove(observer);
            if (set.isEmpty()) {
                delete this.__observers[name]
            }
        }
    };
    BaseCenter.prototype.postNotification = function (notification) {
        var set = this.__observers[notification.getName()];
        if (!set || set.isEmpty()) {
            return
        }
        var observers = set.toArray();
        var obs;
        for (var i = observers.length - 1; i >= 0; --i) {
            obs = observers[i];
            try {
                if (Interface.conforms(obs, Observer)) {
                    obs.onReceiveNotification(notification)
                } else if (typeof obs === 'function') {
                    obs.call(notification)
                } else {
                    Log.error('Notification observer error', obs, notification)
                }
            } catch (e) {
                Log.error('DefaultCenter::post() error', notification, obs, e)
            }
        }
    };
    ns.lnc.BaseCenter = BaseCenter
})(StarGate, MONKEY);
(function (ns) {
    "use strict";
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var NotificationCenter = {
        addObserver: function (observer, name) {
            this.defaultCenter.addObserver(observer, name)
        }, removeObserver: function (observer, name) {
            this.defaultCenter.removeObserver(observer, name)
        }, postNotification: function (notification, sender, userInfo) {
            if (notification instanceof Notification) {
                this.defaultCenter.postNotification(notification)
            } else {
                notification = new Notification(notification, sender, userInfo);
                this.defaultCenter.postNotification(notification)
            }
        }, defaultCenter: new BaseCenter()
    };
    NotificationCenter.getInstance = function () {
        return this
    };
    ns.lnc.NotificationCenter = NotificationCenter
})(StarGate);
(function (ns, fsm, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseCenter = ns.lnc.BaseCenter;
    var Notification = ns.lnc.Notification;
    var AsyncCenter = function () {
        BaseCenter.call(this);
        this.__notifications = [];
        this.__running = false;
        this.__thread = null
    };
    Class(AsyncCenter, BaseCenter, [Runnable], {
        postNotification: function (notification, sender, userInfo) {
            if (typeof notification === 'string') {
                notification = new Notification(notification, sender, userInfo)
            }
            this.__notifications.push(notification)
        }, run: function () {
            while (this.isRunning()) {
                if (!this.process()) {
                    return true
                }
            }
            return false
        }, process: function () {
            var notification = this.__notifications.shift();
            if (notification) {
                this.postNotification(notification);
                return true
            } else {
                return false
            }
        }
    });
    AsyncCenter.prototype.start = function () {
        force_stop.call(this);
        this.__running = true;
        var thread = new Thread(this);
        thread.start();
        this.__thread = thread
    };
    AsyncCenter.prototype.stop = function () {
        force_stop.call(this)
    };
    var force_stop = function () {
        var thread = this.__thread;
        if (thread) {
            this.__thread = null;
            thread.stop()
        }
    };
    AsyncCenter.prototype.isRunning = function () {
        return this.__running
    };
    ns.lnc.AsyncCenter = AsyncCenter
})(StarGate, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ConstantString = sys.type.ConstantString;
    var Host = function (string, ip, port, data) {
        ConstantString.call(this, string);
        this.ip = ip;
        this.port = port;
        this.data = data
    };
    Class(Host, ConstantString, null, null);
    Host.prototype.toArray = function (default_port) {
        var data = this.data;
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
            array[len] = port >> 8;
            array[len + 1] = port & 0xFF
        }
        return array
    };
    ns.network.Host = Host
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Host = ns.network.Host;
    var IPv4 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + '.' + data[1] + '.' + data[2] + '.' + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5]
                }
            }
        } else if (ip) {
            data = new Uint8Array(4);
            var array = ip.split('.');
            for (var index = 0; index < 4; ++index) {
                data[index] = parseInt(array[index], 10)
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip
        } else {
            string = ip + ':' + port
        }
        Host.call(this, string, ip, port, data)
    };
    Class(IPv4, Host, null);
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function (host) {
        if (!this.patten.test(host)) {
            return null
        }
        var pair = host.split(':');
        var ip = pair[0], port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1])
        }
        return new IPv4(ip, port)
    };
    ns.network.IPv4 = IPv4
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Host = ns.network.Host;
    var parse_v4 = function (data, array) {
        var item, index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item
        }
        return data
    };
    var parse_v6 = function (data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf('::');
        if (pos < 0) {
            array = ip.split(':');
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF
            }
        } else {
            var left = ip.substring(0, pos).split(':');
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 0xFF
            }
            var right = ip.substring(pos + 2).split(':');
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 0xFF;
                data[--index] = item >> 8
            }
        }
        return data
    };
    var hex_encode = function (hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16)
            }
            return Number(hi).toString(16) + '0' + Number(lo).toString(16)
        } else {
            return Number(lo).toString(16)
        }
    };
    var IPv6 = function (ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ':' + hex_encode(data[index], data[index + 1])
                }
                ip = ip.replace(/:(0:){2,}/, '::');
                ip = ip.replace(/^(0::)/, '::');
                ip = ip.replace(/(::0)$/, '::');
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17]
                }
            }
        } else if (ip) {
            data = new Uint8Array(16);
            var array = ip.split('.');
            if (array.length === 1) {
                data = parse_v6(data, ip, 8)
            } else if (array.length === 4) {
                var prefix = array[0];
                var pos = prefix.lastIndexOf(':');
                array[0] = prefix.substring(pos + 1);
                prefix = prefix.substring(0, pos);
                data = parse_v6(data, prefix, 6);
                data = parse_v4(data, array)
            } else {
                throw new URIError('IPv6 format error: ' + ip);
            }
        } else {
            throw new URIError('IP data empty: ' + data + ', ' + ip + ', ' + port);
        }
        var string;
        if (port === 0) {
            string = ip
        } else {
            string = '[' + ip + ']:' + port
        }
        Host.call(this, string, ip, port, data)
    };
    Class(IPv6, Host, null);
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function (host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null
        }
        var ip, port;
        if (host.charAt(0) === '[') {
            var pos = host.indexOf(']');
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2))
        } else {
            ip = host;
            port = 0
        }
        return new IPv6(ip, port)
    };
    ns.network.IPv6 = IPv6
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var connect = function (url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function (ev) {
            proxy.onConnected()
        };
        ws.onclose = function (ev) {
            proxy.onClosed()
        };
        ws.onerror = function (ev) {
            var error = new Error('WebSocket error: ' + ev);
            proxy.onError(error)
        };
        ws.onmessage = function (ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return
            } else if (typeof data === 'string') {
                data = sys.format.UTF8.encode(data)
            } else if (data instanceof Uint8Array) {
            } else {
                data = new Uint8Array(data)
            }
            proxy.onReceived(data)
        };
        return ws
    };
    var build_url = function (host, port) {
        if ('https' === window.location.protocol.split(':')[0]) {
            return 'wss://' + host + ':' + port
        } else {
            return 'ws://' + host + ':' + port
        }
    };
    var Socket = function () {
        Object.call(this);
        this.__packages = [];
        this.__connected = -1;
        this.__closed = -1;
        this.__host = null;
        this.__port = null;
        this.__ws = null;
        this.__remote = null;
        this.__local = null
    };
    Class(Socket, Object, null);
    Socket.prototype.getHost = function () {
        return this.__host
    };
    Socket.prototype.getPort = function () {
        return this.__port
    };
    Socket.prototype.onConnected = function () {
        this.__connected = true
    };
    Socket.prototype.onClosed = function () {
        this.__closed = true
    };
    Socket.prototype.onError = function (error) {
        this.__connected = false
    };
    Socket.prototype.onReceived = function (data) {
        this.__packages.push(data)
    };
    Socket.prototype.configureBlocking = function () {
    };
    Socket.prototype.isBlocking = function () {
        return false
    };
    Socket.prototype.isOpen = function () {
        return this.__closed === false
    };
    Socket.prototype.isConnected = function () {
        return this.__connected === true
    };
    Socket.prototype.isBound = function () {
        return this.__connected === true
    };
    Socket.prototype.isAlive = function () {
        return this.isOpen() && (this.isConnected() || this.isBound())
    };
    Socket.prototype.getRemoteAddress = function () {
        return this.__remote
    };
    Socket.prototype.getLocalAddress = function () {
        return this.__local
    };
    Socket.prototype.bind = function (local) {
        this.__local = local
    };
    Socket.prototype.connect = function (remote) {
        this.close();
        this.__closed = false;
        this.__connected = false;
        this.__remote = remote;
        this.__host = remote.getHost();
        this.__port = remote.getPort();
        var url = build_url(this.__host, this.__port);
        this.__ws = connect(url, this)
    };
    Socket.prototype.close = function () {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null
        }
    };
    Socket.prototype.read = function (maxLen) {
        if (this.__packages.length > 0) {
            return this.__packages.shift()
        } else {
            return null
        }
    };
    Socket.prototype.write = function (data) {
        this.__ws.send(data);
        return data.length
    };
    Socket.prototype.receive = function (maxLen) {
        return this.read(maxLen)
    };
    Socket.prototype.send = function (data, remote) {
        return this.write(data)
    };
    ns.ws.Socket = Socket
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ChannelReader = ns.socket.ChannelReader;
    var ChannelWriter = ns.socket.ChannelWriter;
    var BaseChannel = ns.socket.BaseChannel;
    var StreamChannelReader = function (channel) {
        ChannelReader.call(this, channel)
    };
    Class(StreamChannelReader, ChannelReader, null, {
        receive: function (maxLen) {
            return this.read(maxLen)
        }
    });
    var StreamChannelWriter = function (channel) {
        ChannelWriter.call(this, channel)
    };
    Class(StreamChannelWriter, ChannelWriter, null, {
        send: function (data, target) {
            return this.write(data)
        }
    });
    var StreamChannel = function (remote, local) {
        BaseChannel.call(this, remote, local)
    };
    Class(StreamChannel, BaseChannel, null, {
        createReader: function () {
            return new StreamChannelReader(this)
        }, createWriter: function () {
            return new StreamChannelWriter(this)
        }
    });
    ns.ws.StreamChannelReader = StreamChannelReader;
    ns.ws.StreamChannelWriter = StreamChannelWriter;
    ns.ws.StreamChannel = StreamChannel
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var AddressPairMap = ns.type.AddressPairMap;
    var BaseHub = ns.socket.BaseHub;
    var StreamChannel = ns.ws.StreamChannel;
    var ChannelPool = function () {
        AddressPairMap.call(this)
    };
    Class(ChannelPool, AddressPairMap, null, {
        set: function (remote, local, value) {
            var cached = AddressPairMap.prototype.remove.call(this, remote, local, value);
            AddressPairMap.prototype.set.call(this, remote, local, value);
            return cached
        }
    })
    var StreamHub = function (gate) {
        BaseHub.call(this, gate);
        this.__channelPool = this.createChannelPool()
    };
    Class(StreamHub, BaseHub, null, null);
    StreamHub.prototype.createChannelPool = function () {
        return new ChannelPool()
    };
    StreamHub.prototype.createChannel = function (remote, local) {
        return new StreamChannel(remote, local)
    };
    StreamHub.prototype.allChannels = function () {
        return this.__channelPool.items()
    };
    StreamHub.prototype.removeChannel = function (remote, local, channel) {
        this.__channelPool.remove(remote, null, channel)
    };
    StreamHub.prototype.getChannel = function (remote, local) {
        return this.__channelPool.get(remote, null)
    };
    StreamHub.prototype.setChannel = function (remote, local, channel) {
        this.__channelPool.set(remote, null, channel)
    };
    StreamHub.prototype.removeConnection = function (remote, local, connection) {
        return BaseHub.prototype.removeConnection.call(this, remote, null, connection)
    };
    StreamHub.prototype.getConnection = function (remote, local) {
        return BaseHub.prototype.getConnection.call(this, remote, null)
    };
    StreamHub.prototype.setConnection = function (remote, local, connection) {
        return BaseHub.prototype.setConnection.call(this, remote, null, connection)
    };
    ns.ws.ChannelPool = ChannelPool;
    ns.ws.StreamHub = StreamHub
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var BaseChannel = ns.socket.BaseChannel;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StreamHub = ns.ws.StreamHub;
    var Socket = ns.ws.Socket;
    var ClientHub = function (delegate) {
        StreamHub.call(this, delegate)
    };
    Class(ClientHub, StreamHub, null, {
        createConnection: function (remote, local) {
            var conn = new ActiveConnection(remote, local);
            conn.setDelegate(this.getDelegate());
            return conn
        }, open: function (remote, local) {
            if (!remote) {
                throw new ReferenceError('remote address empty')
            }
            var channel;
            var old = this.getChannel(remote, local);
            if (!old) {
                channel = this.createChannel(remote, local);
                var cached = this.setChannel(remote, local, channel);
                if (cached && cached !== channel) {
                    cached.close()
                }
            } else {
                channel = old
            }
            if (!old && channel instanceof BaseChannel) {
                var sock = createWebSocketClient.call(this, remote, local);
                if (sock) {
                    channel.setSocket(sock)
                } else {
                    Log.error('[WS] failed to prepare socket', remote, local);
                    this.removeChannel(remote, local, channel)
                }
            }
            return channel
        }
    });
    var createWebSocketClient = function (remote, local) {
        var sock = new Socket();
        sock.configureBlocking(true);
        if (local) {
            sock.bind(local)
        }
        sock.connect(remote);
        sock.configureBlocking(false);
        return sock
    };
    ns.ws.ClientHub = ClientHub
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var ArrivalShip = ns.ArrivalShip;
    var PlainArrival = function (data, now) {
        ArrivalShip.call(this, now);
        this.__data = data
    };
    Class(PlainArrival, ArrivalShip, null, null);
    PlainArrival.prototype.getPayload = function () {
        return this.__data
    };
    PlainArrival.prototype.getSN = function () {
        return null
    };
    PlainArrival.prototype.assemble = function (arrival) {
        return arrival
    };
    ns.PlainArrival = PlainArrival
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var DepartureShip = ns.DepartureShip;
    var PlainDeparture = function (data, prior) {
        if (!prior) {
            prior = 0
        }
        DepartureShip.call(this, prior, 1);
        this.__completed = data;
        this.__fragments = [data]
    };
    Class(PlainDeparture, DepartureShip, null, null);
    PlainDeparture.prototype.getPayload = function () {
        return this.__completed
    };
    PlainDeparture.prototype.getSN = function () {
        return null
    };
    PlainDeparture.prototype.getFragments = function () {
        return this.__fragments
    };
    PlainDeparture.prototype.checkResponse = function (arrival) {
        return false
    };
    PlainDeparture.prototype.isImportant = function (arrival) {
        return false
    };
    ns.PlainDeparture = PlainDeparture
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var UTF8 = sys.format.UTF8;
    var Departure = ns.port.Departure;
    var StarPorter = ns.StarPorter;
    var PlainArrival = ns.PlainArrival;
    var PlainDeparture = ns.PlainDeparture;
    var PlainPorter = function (remote, local) {
        StarPorter.call(this, remote, local)
    };
    Class(PlainPorter, StarPorter, null, {
        createArrival: function (data) {
            return new PlainArrival(data, null)
        }, createDeparture: function (data, priority) {
            return new PlainDeparture(data, priority)
        }, getArrivals: function (data) {
            if (!data || data.length === 0) {
                return []
            }
            return [this.createArrival(data)]
        }, checkArrival: function (income) {
            var data = income.getPayload();
            if (data.length === 4) {
                init_bytes();
                if (bytes_equal(data, PING)) {
                    this.send(PONG, Departure.Priority.SLOWER.getValue());
                    return null
                } else if (bytes_equal(data, PONG) || bytes_equal(data, NOOP)) {
                    return null
                }
            }
            return income
        }, send: function (payload, priority) {
            var ship = this.createDeparture(payload, priority);
            return this.sendShip(ship)
        }, sendData: function (payload) {
            var priority = Departure.Priority.NORMAL.getValue();
            return this.send(payload, priority)
        }, heartbeat: function () {
            init_bytes();
            var priority = Departure.Priority.SLOWER.getValue();
            this.send(PING, priority)
        }
    });
    var bytes_equal = function (data1, data2) {
        if (data1.length !== data2.length) {
            return false
        }
        for (var i = data1.length - 1; i >= 0; --i) {
            if (data1[i] !== data2[i]) {
                return false
            }
        }
        return true
    };
    var init_bytes = function () {
        if (typeof PING === 'string') {
            PING = UTF8.encode(PING);
            PONG = UTF8.encode(PONG);
            NOOP = UTF8.encode(NOOP)
        }
    }
    var PING = 'PING';
    var PONG = 'PONG';
    var NOOP = 'NOOP';
    ns.PlainPorter = PlainPorter
})(StarGate, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var ActiveConnection = ns.socket.ActiveConnection;
    var StarGate = ns.StarGate;
    var BaseGate = function (keeper) {
        StarGate.call(this, keeper);
        this.__hub = null
    };
    Class(BaseGate, StarGate, null, {
        setHub: function (hub) {
            this.__hub = hub
        }, getHub: function () {
            return this.__hub
        }, removePorter: function (remote, local, porter) {
            return StarGate.prototype.removePorter.call(this, remote, null, porter)
        }, getPorter: function (remote, local) {
            return StarGate.prototype.getPorter.call(this, remote, null)
        }, setPorter: function (remote, local, porter) {
            return StarGate.prototype.setPorter.call(this, remote, null, porter)
        }, fetchPorter: function (remote, local) {
            var hub = this.getHub();
            if (!hub) {
                throw new ReferenceError('Gate hub not found');
            }
            var conn = hub.connect(remote, local);
            if (!conn) {
                return null
            }
            return this.dock(conn, true)
        }, sendResponse: function (payload, ship, remote, local) {
            var docker = this.getPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false
            }
            return docker.sendData(payload)
        }, heartbeat: function (connection) {
            if (connection instanceof ActiveConnection) {
                StarGate.prototype.heartbeat.call(this, connection)
            }
        }
    });
    ns.BaseGate = BaseGate
})(StarGate, MONKEY);
(function (ns, fsm, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var Runnable = fsm.skywalker.Runnable;
    var Thread = fsm.threading.Thread;
    var BaseGate = ns.BaseGate;
    var AutoGate = function (delegate) {
        BaseGate.call(this, delegate);
        this.__running = false;
        this.__thread = new Thread(this)
    };
    Class(AutoGate, BaseGate, [Runnable], {
        isRunning: function () {
            return this.__running
        }, start: function () {
            this.__running = true;
            this.__thread.start()
        }, stop: function () {
            this.__running = false
        }, run: function () {
            if (!this.isRunning()) {
                return false
            }
            var busy = this.process();
            if (busy) {
                Log.debug('client busy', busy)
            }
            return true
        }, process: function () {
            var hub = this.getHub();
            try {
                var incoming = hub.process();
                var outgoing = BaseGate.prototype.process.call(this);
                return incoming || outgoing
            } catch (e) {
                Log.error('client process error', e)
            }
        }, getChannel: function (remote, local) {
            var hub = this.getHub();
            return hub.open(remote, local)
        }
    });
    ns.AutoGate = AutoGate
})(StarGate, FiniteStateMachine, MONKEY);
(function (ns, sys) {
    "use strict";
    var Class = sys.type.Class;
    var Log = ns.lnc.Log;
    var AutoGate = ns.AutoGate;
    var PlainPorter = ns.PlainPorter;
    var WSClientGate = function (delegate) {
        AutoGate.call(this, delegate)
    };
    Class(WSClientGate, AutoGate, null, {
        createPorter: function (remote, local) {
            var docker = new PlainPorter(remote, local);
            docker.setDelegate(this.getDelegate());
            return docker
        }, sendMessage: function (payload, remote, local) {
            var docker = this.fetchPorter(remote, local);
            if (!docker) {
                Log.error('docker not found', remote, local);
                return false
            } else if (!docker.isAlive()) {
                Log.error('docker not alive', remote, local);
                return false
            }
            return docker.sendData(payload)
        }
    });
    ns.WSClientGate = WSClientGate
})(StarGate, MONKEY);
