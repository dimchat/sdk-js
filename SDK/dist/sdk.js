/**
 *  DIM-SDK (v0.2.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Apr. 25, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof DIMSDK !== "object") {
    DIMSDK = new MingKeMing.Namespace();
}
(function (ns, base) {
    base.exports(ns);
    if (typeof ns.assert !== "function") {
        ns.assert = console.assert;
    }
    if (typeof ns.cpu !== "object") {
        ns.cpu = new ns.Namespace();
    }
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = new ns.Namespace();
    }
    ns.registers("cpu");
    ns.cpu.registers("group");
})(DIMSDK, DIMP);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function () {};
    ns.Interface(ReceiptCommand, [Command]);
    ReceiptCommand.prototype.getMessage = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReceiptCommand.prototype.setEnvelope = function (env) {
        ns.assert(false, "implement me!");
    };
    ReceiptCommand.prototype.getEnvelope = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ReceiptCommand.prototype.setSignature = function (signature) {
        ns.assert(false, "implement me!");
    };
    ReceiptCommand.prototype.getSignature = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.registers("ReceiptCommand");
})(DIMSDK);
(function (ns) {
    var Base64 = ns.format.Base64;
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseReceiptCommand = function () {
        if (arguments.length === 3) {
            BaseCommand.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1]);
            }
            this.setEnvelope(arguments[2]);
        } else {
            if (typeof arguments[0] === "string") {
                BaseCommand.call(this, Command.RECEIPT);
                this.setMessage(arguments[0]);
                this.__envelope = null;
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__envelope = null;
            }
        }
    };
    ns.Class(BaseReceiptCommand, BaseCommand, [ReceiptCommand], {
        setSerialNumber: function (sn) {
            this.setValue("sn", sn);
        },
        setMessage: function (message) {
            this.setValue("message", message);
        },
        getMessage: function () {
            return this.getValue("message");
        },
        getEnvelope: function () {
            if (!this.__envelope) {
                var env = this.getValue("envelope");
                if (!env) {
                    var sender = this.getValue("sender");
                    var receiver = this.getValue("receiver");
                    if (sender && receiver) {
                        env = this.toMap();
                    }
                }
                this.__envelope = Envelope.parse(env);
            }
            return this.__envelope;
        },
        setEnvelope: function (env) {
            this.setValue("envelope", null);
            if (env) {
                this.setValue("sender", env.getValue("sender"));
                this.setValue("receiver", env.getValue("receiver"));
                var time = env.getValue("time");
                if (time) {
                    this.setValue("time", time);
                }
                var group = env.getValue("group");
                if (group) {
                    this.setValue("group", group);
                }
            }
            this.__envelope = env;
        },
        setSignature: function (signature) {
            if (signature instanceof Uint8Array) {
                signature = Base64.encode(signature);
            }
            this.setValue("signature", signature);
        },
        getSignature: function () {
            var signature = this.getValue("signature");
            if (typeof signature === "string") {
                signature = Base64.decode(signature);
            }
            return signature;
        }
    });
    ns.dkd.BaseReceiptCommand = BaseReceiptCommand;
    ns.dkd.registers("BaseReceiptCommand");
})(DIMSDK);
(function (ns) {
    var HandshakeState = ns.type.Enum(null, {
        INIT: 0,
        START: 1,
        AGAIN: 2,
        RESTART: 3,
        SUCCESS: 4
    });
    var Command = ns.protocol.Command;
    var HandshakeCommand = function () {};
    ns.Interface(HandshakeCommand, [Command]);
    HandshakeCommand.prototype.getMessage = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    HandshakeCommand.prototype.getSessionKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    HandshakeCommand.prototype.getState = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
    ns.protocol.registers("HandshakeCommand");
    ns.protocol.registers("HandshakeState");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var HandshakeCommand = ns.protocol.HandshakeCommand;
    var HandshakeState = ns.protocol.HandshakeState;
    var BaseCommand = ns.dkd.BaseCommand;
    var START_MESSAGE = "Hello world!";
    var AGAIN_MESSAGE = "DIM?";
    var SUCCESS_MESSAGE = "DIM!";
    var get_state = function (text, session) {
        if (text === SUCCESS_MESSAGE || text === "OK!") {
            return HandshakeState.SUCCESS;
        } else {
            if (text === AGAIN_MESSAGE) {
                return HandshakeState.AGAIN;
            } else {
                if (text !== START_MESSAGE) {
                    return HandshakeState.INIT;
                } else {
                    if (session) {
                        return HandshakeState.RESTART;
                    } else {
                        return HandshakeState.START;
                    }
                }
            }
        }
    };
    var BaseHandshakeCommand = function () {
        if (arguments.length === 1) {
            BaseCommand.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseCommand.call(this, Command.HANDSHAKE);
                var text = arguments[0];
                if (text) {
                    this.setValue("message", text);
                } else {
                    this.setValue("message", START_MESSAGE);
                }
                var session = arguments[1];
                if (session) {
                    this.setValue("session", session);
                }
            }
        }
    };
    ns.Class(BaseHandshakeCommand, BaseCommand, [HandshakeCommand], {
        getMessage: function () {
            return this.getValue("message");
        },
        getSessionKey: function () {
            return this.getValue("session");
        },
        getState: function () {
            return get_state(this.getMessage(), this.getSessionKey());
        }
    });
    HandshakeCommand.start = function () {
        return new BaseHandshakeCommand(null, null);
    };
    HandshakeCommand.restart = function (session) {
        return new BaseHandshakeCommand(null, session);
    };
    HandshakeCommand.again = function (session) {
        return new BaseHandshakeCommand(AGAIN_MESSAGE, session);
    };
    HandshakeCommand.success = function () {
        return new BaseHandshakeCommand(SUCCESS_MESSAGE, null);
    };
    ns.dkd.BaseHandshakeCommand = BaseHandshakeCommand;
    ns.dkd.registers("BaseHandshakeCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = function (info) {};
    ns.Interface(LoginCommand, [Command]);
    LoginCommand.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.getDevice = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setDevice = function (device) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getAgent = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setAgent = function (UA) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getStation = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setStation = function (station) {
        ns.assert(false, "implement me!");
    };
    LoginCommand.prototype.getProvider = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    LoginCommand.prototype.setProvider = function (provider) {
        ns.assert(false, "implement me!");
    };
    ns.protocol.LoginCommand = LoginCommand;
    ns.protocol.registers("LoginCommand");
})(DIMSDK);
(function (ns) {
    var Wrapper = ns.type.Wrapper;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var LoginCommand = ns.protocol.LoginCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseLoginCommand = function (info) {
        if (ns.Interface.conforms(info, ID)) {
            BaseCommand.call(this, Command.LOGIN);
            this.setValue("ID", info.toString());
        } else {
            BaseCommand.call(this, info);
        }
    };
    ns.Class(BaseLoginCommand, BaseCommand, [LoginCommand], {
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        getDevice: function () {
            return this.getValue("device");
        },
        setDevice: function (device) {
            this.setValue("device", device);
        },
        getAgent: function () {
            return this.getValue("agent");
        },
        setAgent: function (UA) {
            this.setValue("agent", UA);
        },
        getStation: function () {
            return this.getValue("station");
        },
        setStation: function (station) {
            var info;
            if (station instanceof ns.Station) {
                info = {
                    host: station.getHost(),
                    port: station.getPort(),
                    ID: station.getIdentifier().toString()
                };
            } else {
                info = Wrapper.fetchMap(station);
            }
            this.setValue("station", info);
        },
        getProvider: function () {
            return this.getValue("provider");
        },
        setProvider: function (provider) {
            var info;
            if (provider instanceof ns.ServiceProvider) {
                info = { ID: provider.getIdentifier().toString() };
            } else {
                if (ns.Interface.conforms(provider, ID)) {
                    info = { ID: provider.toString() };
                } else {
                    info = Wrapper.fetchMap(provider);
                }
            }
            this.setValue("provider", info);
        }
    });
    ns.dkd.BaseLoginCommand = BaseLoginCommand;
    ns.dkd.registers("BaseLoginCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = function (info) {};
    ns.Interface(MuteCommand, [Command]);
    MuteCommand.MUTE = "mute";
    MuteCommand.prototype.setMuteCList = function (list) {
        ns.assert(false, "implement me!");
    };
    MuteCommand.prototype.getMuteCList = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    MuteCommand.setMuteList = function (list, cmd) {
        if (list) {
            cmd["list"] = ID.revert(list);
        } else {
            delete cmd["list"];
        }
    };
    MuteCommand.getMuteList = function (cmd) {
        var list = cmd["list"];
        if (list) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.registers("MuteCommand");
})(DIMSDK);
(function (ns) {
    var MuteCommand = ns.protocol.MuteCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseMuteCommand = function (info) {
        if (arguments.length === 0) {
            BaseCommand.call(this, MuteCommand.MUTE);
            this.__list = null;
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, MuteCommand.MUTE);
                this.setBlockCList(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__list = null;
            }
        }
    };
    ns.Class(BaseMuteCommand, BaseCommand, [MuteCommand], {
        getMuteCList: function () {
            if (!this.__list) {
                var dict = this.toMap();
                this.__list = MuteCommand.getMuteList(dict);
            }
            return this.__list;
        },
        setMuteCList: function (list) {
            var dict = this.toMap();
            MuteCommand.setMuteList(list, dict);
            this.__list = list;
        }
    });
    ns.dkd.BaseMuteCommand = BaseMuteCommand;
    ns.dkd.registers("BaseMuteCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = function () {};
    ns.Interface(BlockCommand, [Command]);
    BlockCommand.BLOCK = "block";
    BlockCommand.prototype.setBlockCList = function (list) {
        ns.assert(false, "implement me!");
    };
    BlockCommand.prototype.getBlockCList = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    BlockCommand.setBlockList = function (list, cmd) {
        if (list) {
            cmd["list"] = ID.revert(list);
        } else {
            delete cmd["list"];
        }
    };
    BlockCommand.getBlockList = function (cmd) {
        var list = cmd["list"];
        if (list) {
            return ID.convert(list);
        } else {
            return list;
        }
    };
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.registers("BlockCommand");
})(DIMSDK);
(function (ns) {
    var BlockCommand = ns.protocol.BlockCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseBlockCommand = function () {
        if (arguments.length === 0) {
            BaseCommand.call(this, BlockCommand.BLOCK);
            this.__list = null;
        } else {
            if (arguments[0] instanceof Array) {
                BaseCommand.call(this, BlockCommand.BLOCK);
                this.setBlockCList(arguments[0]);
            } else {
                BaseCommand.call(this, arguments[0]);
                this.__list = null;
            }
        }
    };
    ns.Class(BaseBlockCommand, BaseCommand, [BlockCommand], {
        getBlockCList: function () {
            if (!this.__list) {
                var dict = this.toMap();
                this.__list = BlockCommand.getBlockList(dict);
            }
            return this.__list;
        },
        setBlockCList: function (list) {
            var dict = this.toMap();
            BlockCommand.setBlockList(list, dict);
            this.__list = list;
        }
    });
    ns.dkd.BaseBlockCommand = BaseBlockCommand;
    ns.dkd.registers("BaseBlockCommand");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = function (info) {};
    ns.Interface(StorageCommand, [Command]);
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    StorageCommand.prototype.setTitle = function (title) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getTitle = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setIdentifier = function (identifier) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getIdentifier = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setData = function (data) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getData = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.setKey = function (data) {
        ns.assert(false, "implement me!");
    };
    StorageCommand.prototype.getKey = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.decryptData = function (key) {
        ns.assert(false, "implement me!");
        return null;
    };
    StorageCommand.prototype.decryptKey = function (privateKey) {
        ns.assert(false, "implement me!");
        return null;
    };
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.registers("StorageCommand");
})(DIMSDK);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Base64 = ns.format.Base64;
    var ID = ns.protocol.ID;
    var StorageCommand = ns.protocol.StorageCommand;
    var BaseCommand = ns.dkd.BaseCommand;
    var BaseStorageCommand = function (info) {
        if (typeof info === "string") {
            BaseCommand.call(this, StorageCommand.STORAGE);
            this.setTitle(info);
        } else {
            BaseCommand.call(this, info);
        }
        this.__data = null;
        this.__plaintext = null;
        this.__key = null;
        this.__password = null;
    };
    ns.Class(BaseStorageCommand, BaseCommand, [StorageCommand], {
        setTitle: function (title) {
            this.setValue("title", title);
        },
        getTitle: function () {
            var title = this.getValue("title");
            if (title && title.length > 0) {
                return title;
            } else {
                return this.getCommand();
            }
        },
        setIdentifier: function (identifier) {
            if (identifier && ns.Interface.conforms(identifier, ID)) {
                this.setValue("ID", identifier.toString());
            } else {
                this.setValue("ID", null);
            }
        },
        getIdentifier: function () {
            return ID.parse(this.getValue("ID"));
        },
        setData: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("data", base64);
            this.__data = data;
            this.__plaintext = null;
        },
        getData: function () {
            if (!this.__data) {
                var base64 = this.getValue("data");
                if (base64) {
                    this.__data = Base64.decode(base64);
                }
            }
            return this.__data;
        },
        setKey: function (data) {
            var base64 = null;
            if (data) {
                base64 = Base64.encode(data);
            }
            this.setValue("key", base64);
            this.__key = data;
            this.__password = null;
        },
        getKey: function () {
            if (!this.__key) {
                var base64 = this.getValue("key");
                if (base64) {
                    this.__key = Base64.decode(base64);
                }
            }
            return this.__key;
        },
        decryptData: function (key) {
            if (!this.__plaintext) {
                var pwd = null;
                if (ns.Interface.conforms(key, PrivateKey)) {
                    pwd = this.decryptKey(key);
                    if (!pwd) {
                        throw new Error("failed to decrypt key: " + key);
                    }
                } else {
                    if (ns.Interface.conforms(key, SymmetricKey)) {
                        pwd = key;
                    } else {
                        throw new TypeError("Decryption key error: " + key);
                    }
                }
                var data = this.getData();
                this.__plaintext = pwd.decrypt(data);
            }
            return this.__plaintext;
        },
        decryptKey: function (privateKey) {
            if (!this.__password) {
                var key = this.getKey();
                var data = privateKey.decrypt(key);
                var json = ns.format.UTF8.decode(data);
                var dict = ns.format.JSON.decode(json);
                this.__password = SymmetricKey.parse(dict);
            }
            return this.__password;
        }
    });
    ns.dkd.BaseStorageCommand = BaseStorageCommand;
    ns.dkd.registers("BaseStorageCommand");
})(DIMSDK);
(function (ns) {
    var BaseGroup = ns.mkm.BaseGroup;
    var Polylogue = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(Polylogue, BaseGroup, null, {
        getOwner: function () {
            var owner = BaseGroup.prototype.getOwner.call(this);
            if (owner) {
                return owner;
            }
            return this.getFounder();
        }
    });
    ns.mkm.Polylogue = Polylogue;
    ns.mkm.registers("Polylogue");
})(DIMSDK);
(function (ns) {
    var Group = ns.mkm.Group;
    var BaseGroup = ns.mkm.BaseGroup;
    var Chatroom = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(Chatroom, BaseGroup, null, {
        getAdmins: function () {
            var identifier = this.getIdentifier();
            var delegate = this.getDataSource();
            return delegate.getAdmins(identifier);
        }
    });
    var ChatroomDataSource = function () {};
    ns.Interface(ChatroomDataSource, [Group.DataSource]);
    ChatroomDataSource.prototype.getAdmins = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Chatroom.DataSource = ChatroomDataSource;
    ns.mkm.Chatroom = Chatroom;
    ns.mkm.registers("Chatroom");
})(DIMSDK);
(function (ns) {
    var BaseUser = ns.mkm.BaseUser;
    var Robot = function (identifier) {
        BaseUser.call(this, identifier);
    };
    ns.Class(Robot, BaseUser, null, null);
    ns.mkm.Robot = Robot;
    ns.mkm.registers("Robot");
})(DIMSDK);
(function (ns) {
    var BaseUser = ns.mkm.BaseUser;
    var Station = function (identifier, host, port) {
        BaseUser.call(this, identifier);
        this.host = host;
        this.port = port;
    };
    ns.Class(Station, BaseUser, null, {
        getHost: function () {
            if (!this.host) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.host = doc.getProperty("host");
                }
                if (!this.host) {
                    this.host = "0.0.0.0";
                }
            }
            return this.host;
        },
        getPort: function () {
            if (!this.port) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.port = doc.getProperty("port");
                }
                if (!this.port) {
                    this.port = 9394;
                }
            }
            return this.port;
        }
    });
    ns.mkm.Station = Station;
    ns.mkm.registers("Station");
})(DIMSDK);
(function (ns) {
    var BaseGroup = ns.mkm.BaseGroup;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    ns.Class(ServiceProvider, BaseGroup, null, {
        getStations: function () {
            return this.getMembers();
        }
    });
    ns.mkm.ServiceProvider = ServiceProvider;
    ns.mkm.registers("ServiceProvider");
})(DIMSDK);
(function (ns) {
    var KEYWORDS = [
        "all",
        "everyone",
        "anyone",
        "owner",
        "founder",
        "dkd",
        "mkm",
        "dimp",
        "dim",
        "dimt",
        "rsa",
        "ecc",
        "aes",
        "des",
        "btc",
        "eth",
        "crypto",
        "key",
        "symmetric",
        "asymmetric",
        "public",
        "private",
        "secret",
        "password",
        "id",
        "address",
        "meta",
        "profile",
        "entity",
        "user",
        "group",
        "contact",
        "member",
        "admin",
        "administrator",
        "assistant",
        "main",
        "polylogue",
        "chatroom",
        "social",
        "organization",
        "company",
        "school",
        "government",
        "department",
        "provider",
        "station",
        "thing",
        "robot",
        "message",
        "instant",
        "secure",
        "reliable",
        "envelope",
        "sender",
        "receiver",
        "time",
        "content",
        "forward",
        "command",
        "history",
        "keys",
        "data",
        "signature",
        "type",
        "serial",
        "sn",
        "text",
        "file",
        "image",
        "audio",
        "video",
        "page",
        "handshake",
        "receipt",
        "block",
        "mute",
        "register",
        "suicide",
        "found",
        "abdicate",
        "invite",
        "expel",
        "join",
        "quit",
        "reset",
        "query",
        "hire",
        "fire",
        "resign",
        "server",
        "client",
        "terminal",
        "local",
        "remote",
        "barrack",
        "cache",
        "transceiver",
        "ans",
        "facebook",
        "store",
        "messenger",
        "root",
        "supervisor"
    ];
    var AddressNameService = function () {};
    ns.Interface(AddressNameService, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.getIdentifier = function (name) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressNameService.prototype.getNames = function (identifier) {
        ns.assert(false, "implement me!");
        return null;
    };
    AddressNameService.prototype.save = function (name, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    ns.AddressNameService = AddressNameService;
    ns.registers("AddressNameService");
})(DIMSDK);
(function (ns) {
    var ID = ns.protocol.ID;
    var AddressNameService = ns.AddressNameService;
    var AddressNameServer = function () {
        Object.call(this);
        var caches = {
            all: ID.EVERYONE,
            everyone: ID.EVERYONE,
            anyone: ID.ANYONE,
            owner: ID.ANYONE,
            founder: ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true;
        }
        this.__reserved = reserved;
        this.__caches = caches;
        this.__tables = {};
    };
    ns.Class(AddressNameServer, Object, [AddressNameService], null);
    AddressNameServer.prototype.isReserved = function (name) {
        return this.__reserved[name] === true;
    };
    AddressNameServer.prototype.cache = function (name, identifier) {
        if (this.isReserved(name)) {
            return false;
        }
        if (identifier) {
            this.__caches[name] = identifier;
            delete this.__tables[identifier.toString()];
        } else {
            delete this.__caches[name];
            this.__tables = {};
        }
        return true;
    };
    AddressNameServer.prototype.getIdentifier = function (name) {
        return this.__caches[name];
    };
    AddressNameServer.prototype.getNames = function (identifier) {
        var array = this.__tables[identifier.toString()];
        if (array === null) {
            array = [];
            var keys = Object.keys(this.__caches);
            var name;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                if (this.__caches[name] === identifier) {
                    array.push(name);
                }
            }
            this.__tables[identifier.toString()] = array;
        }
        return array;
    };
    AddressNameServer.prototype.save = function (name, identifier) {
        return this.cache(name, identifier);
    };
    ns.AddressNameServer = AddressNameServer;
    ns.registers("AddressNameServer");
})(DIMSDK);
(function (ns) {
    var CipherKeyDelegate = function () {};
    ns.Interface(CipherKeyDelegate, null);
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        ns.assert(false, "implement me!");
        return null;
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        ns.assert(false, "implement me!");
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
    ns.registers("CipherKeyDelegate");
})(DIMSDK);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.protocol.ID;
    var BaseUser = ns.mkm.BaseUser;
    var Robot = ns.mkm.Robot;
    var Station = ns.mkm.Station;
    var BaseGroup = ns.mkm.BaseGroup;
    var Polylogue = ns.mkm.Polylogue;
    var Chatroom = ns.mkm.Chatroom;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.core.Barrack;
    var Facebook = function () {
        Barrack.call(this);
        this.__users = {};
        this.__groups = {};
    };
    ns.Class(Facebook, Barrack, null, {
        checkDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false;
            }
            var meta;
            if (identifier.isGroup()) {
                var owner = this.getOwner(identifier);
                if (!owner) {
                    if (NetworkType.POLYLOGUE.equals(identifier.getType())) {
                        meta = this.getMeta(identifier);
                    } else {
                        return false;
                    }
                } else {
                    meta = this.getMeta(owner);
                }
            } else {
                meta = this.getMeta(identifier);
            }
            return meta && doc.verify(meta.getKey());
        },
        isFounder: function (member, group) {
            var gMeta = this.getMeta(group);
            if (!gMeta) {
                return false;
            }
            var mMeta = this.getMeta(member);
            if (!mMeta) {
                return false;
            }
            return gMeta.matches(mMeta.key);
        },
        isOwner: function (member, group) {
            if (NetworkType.POLYLOGUE.equals(group.getType())) {
                return this.isFounder(member, group);
            }
            throw new Error("only Polylogue so far");
        },
        selectLocalUser: function (receiver) {
            var users = this.getLocalUsers();
            if (!users || users.length === 0) {
                throw new Error("local users should not be empty");
            } else {
                if (receiver.isBroadcast()) {
                    return users[0];
                }
            }
            var i, user, uid;
            if (receiver.isGroup()) {
                var members = this.getMembers(receiver);
                if (!members || members.length === 0) {
                    return null;
                }
                var j, member;
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    for (j = 0; j < members.length; ++j) {
                        member = members[j];
                        if (member.equals(uid)) {
                            return user;
                        }
                    }
                }
            } else {
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    if (receiver.equals(uid)) {
                        return user;
                    }
                }
            }
            return null;
        },
        getUser: function (identifier) {
            var user = this.__users[identifier.toString()];
            if (!user) {
                user = this.createUser(identifier);
                if (user) {
                    cacheUser.call(this, user);
                }
            }
            return user;
        },
        getGroup: function (identifier) {
            var group = this.__groups[identifier.toString()];
            if (!group) {
                group = this.createGroup(identifier);
                if (group) {
                    cacheGroup.call(this, group);
                }
            }
            return group;
        }
    });
    var thanos = function (map, finger) {
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; ++i) {
            var p = map[keys[i]];
            if (typeof p === "function") {
                continue;
            }
            if ((++finger & 1) === 1) {
                delete map[p];
            }
        }
        return finger;
    };
    Facebook.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__users, finger);
        finger = thanos(this.__groups, finger);
        return finger >> 1;
    };
    var cacheUser = function (user) {
        if (!user.getDataSource()) {
            user.setDataSource(this);
        }
        this.__users[user.getIdentifier().toString()] = user;
        return true;
    };
    var cacheGroup = function (group) {
        if (!group.getDataSource()) {
            group.setDataSource(this);
        }
        this.__groups[group.getIdentifier().toString()] = group;
        return true;
    };
    Facebook.prototype.saveMeta = function (meta, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.saveDocument = function (doc) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.saveMembers = function (members, identifier) {
        ns.assert(false, "implement me!");
        return false;
    };
    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseUser(identifier);
        }
        var type = identifier.getType();
        if (NetworkType.MAIN.equals(type) || NetworkType.BTC_MAIN.equals(type)) {
            return new BaseUser(identifier);
        }
        if (NetworkType.ROBOT.equals(type)) {
            return new Robot(identifier);
        }
        if (NetworkType.STATION.equals(type)) {
            return new Station(identifier);
        }
        throw new TypeError("Unsupported user type: " + type);
    };
    Facebook.prototype.createGroup = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseGroup(identifier);
        }
        var type = identifier.getType();
        if (NetworkType.POLYLOGUE.equals(type)) {
            return new Polylogue(identifier);
        }
        if (NetworkType.CHATROOM.equals(type)) {
            return new Chatroom(identifier);
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return new ServiceProvider(identifier);
        }
        throw new TypeError("Unsupported group type: " + type);
    };
    Facebook.prototype.getLocalUsers = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Facebook.prototype.getCurrentUser = function () {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null;
        }
        return users[0];
    };
    ns.Facebook = Facebook;
    ns.registers("Facebook");
})(DIMSDK);
(function (ns) {
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger;
    };
    ns.Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook;
    };
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger;
    };
    ns.TwinsHelper = TwinsHelper;
    ns.registers("TwinsHelper");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Packer = ns.core.Packer;
    var TwinsHelper = ns.TwinsHelper;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(MessagePacker, TwinsHelper, [Packer], {
        getOvertGroup: function (content) {
            var group = content.getGroup();
            if (!group) {
                return null;
            }
            if (group.isBroadcast()) {
                return group;
            }
            if (ns.Interface.conforms(content, Command)) {
                return null;
            }
            return group;
        },
        encryptMessage: function (iMsg) {
            var messenger = this.getMessenger();
            if (!iMsg.getDelegate()) {
                iMsg.setDelegate(messenger);
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var group = messenger.getOvertGroup(iMsg.getContent());
            var password;
            if (group) {
                password = messenger.getCipherKey(sender, group, true);
            } else {
                password = messenger.getCipherKey(sender, receiver, true);
            }
            var sMsg;
            if (receiver.isGroup()) {
                var facebook = this.getFacebook();
                var grp = facebook.getGroup(receiver);
                if (!grp) {
                    return null;
                }
                var members = grp.getMembers();
                if (!members || members.length === 0) {
                    return null;
                }
                sMsg = iMsg.encrypt(password, members);
            } else {
                sMsg = iMsg.encrypt(password, null);
            }
            if (!sMsg) {
                return null;
            }
            if (group && !receiver.equals(group)) {
                sMsg.getEnvelope().setGroup(group);
            }
            sMsg.getEnvelope().setType(iMsg.getContent().getType());
            return sMsg;
        },
        signMessage: function (sMsg) {
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            return sMsg.sign();
        },
        serializeMessage: function (rMsg) {
            var dict = rMsg.toMap();
            var json = ns.format.JSON.encode(dict);
            return ns.format.UTF8.encode(json);
        },
        deserializeMessage: function (data) {
            var json = ns.format.UTF8.decode(data);
            var dict = ns.format.JSON.decode(json);
            return ReliableMessage.parse(dict);
        },
        verifyMessage: function (rMsg) {
            var facebook = this.getFacebook();
            var sender = rMsg.getSender();
            var meta = rMsg.getMeta();
            if (meta) {
                facebook.saveMeta(meta, sender);
            }
            var visa = rMsg.getVisa();
            if (visa) {
                facebook.saveDocument(visa);
            }
            if (!rMsg.getDelegate()) {
                var messenger = this.getMessenger();
                rMsg.setDelegate(messenger);
            }
            return rMsg.verify();
        },
        decryptMessage: function (sMsg) {
            var facebook = this.getFacebook();
            var receiver = sMsg.getReceiver();
            var user = facebook.selectLocalUser(receiver);
            var trimmed;
            if (!user) {
                trimmed = null;
            } else {
                if (receiver.isGroup()) {
                    trimmed = sMsg.trim(user.getIdentifier());
                } else {
                    trimmed = sMsg;
                }
            }
            if (!trimmed) {
                throw new ReferenceError("receiver error: " + sMsg.toMap());
            }
            if (!sMsg.getDelegate()) {
                var messenger = this.getMessenger();
                sMsg.setDelegate(messenger);
            }
            return sMsg.decrypt();
        }
    });
    ns.MessagePacker = MessagePacker;
    ns.registers("MessagePacker");
})(DIMSDK);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Processor = ns.core.Processor;
    var TwinsHelper = ns.TwinsHelper;
    var MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory();
    };
    ns.Class(MessageProcessor, TwinsHelper, [Processor], {
        createFactory: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var creator = this.createCreator();
            return new ns.cpu.ContentProcessorFactory(facebook, messenger, creator);
        },
        createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ContentProcessorCreator(facebook, messenger);
        },
        processPackage: function (data) {
            var messenger = this.getMessenger();
            var rMsg = messenger.deserializeMessage(data);
            if (!rMsg) {
                return null;
            }
            var responses = messenger.processReliableMessage(rMsg);
            if (!responses) {
                return null;
            }
            var packages = [];
            var pack;
            for (var i = 0; i < responses.length; ++i) {
                pack = messenger.serializeMessage(responses[i]);
                if (!pack) {
                    continue;
                }
                packages.push(pack);
            }
            return packages;
        },
        processReliableMessage: function (rMsg) {
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                return null;
            }
            var responses = messenger.processSecureMessage(sMsg, rMsg);
            if (!responses) {
                return null;
            }
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.signMessage(responses[i]);
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processSecureMessage: function (sMsg, rMsg) {
            var messenger = this.getMessenger();
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return null;
            }
            var responses = messenger.processInstantMessage(iMsg, rMsg);
            if (!responses) {
                return null;
            }
            var messages = [];
            var msg;
            for (var i = 0; i < responses.length; ++i) {
                msg = messenger.encryptMessage(responses[i]);
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processInstantMessage: function (iMsg, rMsg) {
            var messenger = this.getMessenger();
            var responses = messenger.processContent(iMsg.getContent(), rMsg);
            if (!responses) {
                return null;
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            var uid = user.getIdentifier();
            var messages = [];
            var res, env, msg;
            for (var i = 0; i < responses.length; ++i) {
                res = responses[i];
                if (!res) {
                    continue;
                }
                env = Envelope.create(uid, sender, null);
                msg = InstantMessage.create(env, res);
                messages.push(msg);
            }
            return messages;
        },
        processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            return cpu.process(content, rMsg);
        }
    });
    MessageProcessor.prototype.getProcessor = function (content) {
        return this.__factory.getProcessor(content);
    };
    MessageProcessor.prototype.getContentProcessor = function (type) {
        return this.__factory.getContentProcessor(type);
    };
    MessageProcessor.prototype.getCommandProcessor = function (type, command) {
        return this.__factory.getCommandProcessor(type, command);
    };
    ns.MessageProcessor = MessageProcessor;
    ns.registers("MessageProcessor");
})(DIMSDK);
(function (ns) {
    var Transceiver = ns.core.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    ns.Class(Messenger, Transceiver, null, null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getPacker = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getProcessor = function () {
        ns.assert(false, "implement me!");
        return null;
    };
    Messenger.prototype.getCipherKey = function (from, to, generate) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(from, to, generate);
    };
    Messenger.prototype.cacheCipherKey = function (from, to, key) {
        var delegate = this.getCipherKeyDelegate();
        return delegate.cacheCipherKey(from, to, key);
    };
    Messenger.prototype.getOvertGroup = function (content) {
        var packer = this.getPacker();
        return packer.getOvertGroup(content);
    };
    Messenger.prototype.encryptMessage = function (iMsg) {
        var packer = this.getPacker();
        return packer.encryptMessage(iMsg);
    };
    Messenger.prototype.signMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.signMessage(sMsg);
    };
    Messenger.prototype.serializeMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.serializeMessage(rMsg);
    };
    Messenger.prototype.deserializeMessage = function (data) {
        var packer = this.getPacker();
        return packer.deserializeMessage(data);
    };
    Messenger.prototype.verifyMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.verifyMessage(rMsg);
    };
    Messenger.prototype.decryptMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.decryptMessage(sMsg);
    };
    Messenger.prototype.processPackage = function (data) {
        var processor = this.getProcessor();
        return processor.processPackage(data);
    };
    Messenger.prototype.processReliableMessage = function (rMsg) {
        var processor = this.getProcessor();
        return processor.processReliableMessage(rMsg);
    };
    Messenger.prototype.processSecureMessage = function (sMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processSecureMessage(sMsg, rMsg);
    };
    Messenger.prototype.processInstantMessage = function (iMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processInstantMessage(iMsg, rMsg);
    };
    Messenger.prototype.processContent = function (content, rMsg) {
        var processor = this.getProcessor();
        return processor.processContent(content, rMsg);
    };
    Messenger.prototype.deserializeKey = function (data, sender, receiver, sMsg) {
        if (!data) {
            return this.getCipherKey(sender, receiver, false);
        }
        return Transceiver.prototype.deserializeKey.call(
            this,
            data,
            sender,
            receiver,
            sMsg
        );
    };
    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(
            this,
            data,
            pwd,
            sMsg
        );
        if (!is_broadcast(sMsg)) {
            var group = this.getOvertGroup(content);
            if (group) {
                this.cacheCipherKey(sMsg.getSender(), group, pwd);
            } else {
                this.cacheCipherKey(sMsg.getSender(), sMsg.getReceiver(), pwd);
            }
        }
        return content;
    };
    var is_broadcast = function (msg) {
        var receiver = msg.getGroup();
        if (!receiver) {
            receiver = msg.getReceiver();
        }
        return receiver.isBroadcast();
    };
    ns.Messenger = Messenger;
    ns.registers("Messenger");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var MuteCommand = ns.protocol.MuteCommand;
    var BlockCommand = ns.protocol.BlockCommand;
    var StorageCommand = ns.protocol.StorageCommand;
    var CommandFactory = ns.core.CommandFactory;
    var registerAllFactories = function () {
        ns.core.registerContentFactories();
        ns.core.registerCommandFactories();
        registerCommandFactories();
    };
    var registerCommandFactories = function () {
        Command.setFactory(
            Command.RECEIPT,
            new CommandFactory(ns.dkd.BaseReceiptCommand)
        );
        Command.setFactory(
            Command.HANDSHAKE,
            new CommandFactory(ns.dkd.BaseHandshakeCommand)
        );
        Command.setFactory(
            Command.LOGIN,
            new CommandFactory(ns.dkd.BaseLoginCommand)
        );
        Command.setFactory(
            MuteCommand.MUTE,
            new CommandFactory(ns.dkd.BaseMuteCommand)
        );
        Command.setFactory(
            BlockCommand.BLOCK,
            new CommandFactory(ns.dkd.BaseBlockCommand)
        );
        var spu = new CommandFactory(ns.dkd.BaseStorageCommand);
        Command.setFactory(StorageCommand.STORAGE, spu);
        Command.setFactory(StorageCommand.CONTACTS, spu);
        Command.setFactory(StorageCommand.PRIVATE_KEY, spu);
    };
    ns.registerAllFactories = registerAllFactories;
    ns.registers("registerAllFactories");
})(DIMSDK);
(function (ns) {
    var ContentProcessor = function () {};
    ns.Interface(ContentProcessor, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        ns.assert(false, "implement me!");
        return null;
    };
    var Creator = function () {};
    ns.Interface(Creator, null);
    Creator.prototype.createContentProcessor = function (type) {
        ns.assert(false, "implement me!");
        return null;
    };
    Creator.prototype.createCommandProcessor = function (type, command) {
        ns.assert(false, "implement me!");
        return null;
    };
    var Factory = function () {};
    ns.Interface(Factory, null);
    Factory.prototype.getProcessor = function (content) {
        ns.assert(false, "implement me!");
        return null;
    };
    Factory.prototype.getContentProcessor = function (type) {
        ns.assert(false, "implement me!");
        return null;
    };
    Factory.prototype.getCommandProcessor = function (type, command) {
        ns.assert(false, "implement me!");
        return null;
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.registers("ContentProcessor");
})(DIMSDK);
(function (ns) {
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);
    BaseContentProcessor.prototype.process = function (content, rMsg) {
        var text = "Content (type: " + content.getType() + ") not support yet!";
        return this.respondText(text, content.getGroup());
    };
    BaseContentProcessor.prototype.respondText = function (text, group) {
        var res = new ns.dkd.BaseTextContent(text);
        if (group) {
            res.setGroup(group);
        }
        return [res];
    };
    BaseContentProcessor.prototype.respondReceipt = function (text) {
        var res = new ns.dkd.BaseReceiptCommand(text);
        return [res];
    };
    BaseContentProcessor.prototype.respondContent = function (res) {
        if (res) {
            return [res];
        } else {
            return [];
        }
    };
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.registers("BaseContentProcessor");
})(DIMSDK);
(function (ns) {
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    ns.Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (cmd, rMsg) {
            var text = "Command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor;
    ns.cpu.registers("BaseCommandProcessor");
})(DIMSDK);
(function (ns) {
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    ns.Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger);
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger);
            } else {
                if (ContentType.HISTORY.equals(type)) {
                    return new ns.cpu.HistoryCommandProcessor(facebook, messenger);
                }
            }
            if (0 === type) {
                return new ns.cpu.BaseContentProcessor(facebook, messenger);
            }
            return null;
        },
        createCommandProcessor: function (type, command) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (command === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger);
            } else {
                if (command === Command.DOCUMENT) {
                    return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
                }
            }
            if (command === "group") {
                return new ns.cpu.GroupCommandProcessor(facebook, messenger);
            } else {
                if (command === GroupCommand.INVITE) {
                    return new ns.cpu.InviteCommandProcessor(facebook, messenger);
                } else {
                    if (command === GroupCommand.EXPEL) {
                        return new ns.cpu.ExpelCommandProcessor(facebook, messenger);
                    } else {
                        if (command === GroupCommand.QUIT) {
                            return new ns.cpu.QuitCommandProcessor(facebook, messenger);
                        } else {
                            if (command === GroupCommand.QUERY) {
                                return new ns.cpu.QueryCommandProcessor(facebook, messenger);
                            } else {
                                if (command === GroupCommand.RESET) {
                                    return new ns.cpu.ResetCommandProcessor(facebook, messenger);
                                }
                            }
                        }
                    }
                }
            }
            return null;
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;
    ns.cpu.registers("ContentProcessorCreator");
})(DIMSDK);
(function (ns) {
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {};
        this.__command_processors = {};
    };
    ns.Class(
        ContentProcessorFactory,
        TwinsHelper,
        [ContentProcessor.Factory],
        null
    );
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (ns.Interface.conforms(content, Command)) {
            var name = content.getCommand();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else {
                if (ns.Interface.conforms(content, GroupCommand)) {
                    cpu = this.getCommandProcessor(type, "group");
                    if (cpu) {
                        return cpu;
                    }
                }
            }
        }
        cpu = this.getContentProcessor(type);
        if (!cpu) {
            cpu = this.getContentProcessor(0);
        }
        return cpu;
    };
    ContentProcessorFactory.prototype.getContentProcessor = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu;
            }
        }
        return cpu;
    };
    ContentProcessorFactory.prototype.getCommandProcessor = function (
        type,
        command
    ) {
        var cpu = this.__command_processors[command];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, command);
            if (cpu) {
                this.__command_processors[command] = cpu;
            }
        }
        return cpu;
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;
    ns.cpu.registers("ContentProcessorFactory");
})(DIMSDK);
(function (ns) {
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    ns.Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secret = content.getMessage();
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(secret);
            if (!sMsg) {
                return null;
            }
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return null;
            }
            return messenger.processContent(iMsg.getContent(), secret);
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.registers("ForwardContentProcessor");
})(DIMSDK);
(function (ns) {
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(MetaCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var identifier = cmd.getIdentifier();
            if (identifier) {
                var meta = cmd.getMeta();
                if (meta) {
                    return put_meta.call(this, identifier, meta);
                } else {
                    return get_meta.call(this, identifier);
                }
            }
            var text = "Meta command error.";
            return this.respondText(text, null);
        }
    });
    var get_meta = function (identifier) {
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(identifier);
        if (meta) {
            var res = MetaCommand.response(identifier, meta);
            return this.respondContent(res);
        } else {
            var text = "Sorry, meta not found for ID: " + identifier;
            return this.respondText(text, null);
        }
    };
    var put_meta = function (identifier, meta) {
        var text;
        var facebook = this.getFacebook();
        if (facebook.saveMeta(meta, identifier)) {
            text = "Meta received: " + identifier;
            return this.respondReceipt(text);
        } else {
            text = "Meta not accept: " + identifier;
            return this.respondText(text, null);
        }
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.registers("MetaCommandProcessor");
})(DIMSDK);
(function (ns) {
    var DocumentCommand = ns.protocol.DocumentCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var identifier = cmd.getIdentifier();
            if (identifier) {
                var doc = cmd.getDocument();
                if (!doc) {
                    var type = cmd.getValue("doc_type");
                    if (!type) {
                        type = "*";
                    }
                    return get_doc.call(this, identifier, type);
                }
                if (identifier.equals(doc.getIdentifier())) {
                    var meta = cmd.getMeta();
                    return put_doc.call(this, identifier, meta, doc);
                }
            }
            var text = "Document command error.";
            return this.respondText(text, null);
        }
    });
    var get_doc = function (identifier, type) {
        var facebook = this.getFacebook();
        var doc = facebook.getDocument(identifier, type);
        if (doc) {
            var meta = facebook.getMeta(identifier);
            var res = DocumentCommand.response(identifier, meta, doc);
            return this.respondContent(res);
        } else {
            var text = "Sorry, document not found for ID: " + identifier;
            return this.respondText(text, null);
        }
    };
    var put_doc = function (identifier, meta, doc) {
        var text;
        var facebook = this.getFacebook();
        if (meta) {
            if (!facebook.saveMeta(meta, identifier)) {
                text = "Meta not accept: " + identifier;
                return this.respondText(text, null);
            }
        }
        if (facebook.saveDocument(doc)) {
            text = "Document received: " + identifier;
            return this.respondReceipt(text);
        } else {
            text = "Document not accept: " + identifier;
            return this.respondText(text, null);
        }
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
    ns.cpu.registers("DocumentCommandProcessor");
})(DIMSDK);
(function (ns) {
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var HistoryCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(HistoryCommandProcessor, BaseCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text =
                "History command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.registers("HistoryCommandProcessor");
})(DIMSDK);
(function (ns) {
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function (facebook, messenger) {
        HistoryCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var text =
                "Group command (name: " + cmd.getCommand() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    GroupCommandProcessor.prototype.getMembers = function (cmd) {
        var members = cmd.getMembers();
        if (members) {
            return members;
        }
        var member = cmd.getMember();
        if (member) {
            return [member];
        } else {
            return [];
        }
    };
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.registers("GroupCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var QUERY_NOT_ALLOWED = "Sorry, you are not allowed to query this group.";
    var QueryCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(QUERY_NOT_ALLOWED, group);
                }
            }
            var res;
            var user = facebook.getCurrentUser();
            if (user.getIdentifier().equals(owner)) {
                res = GroupCommand.reset(group, members);
            } else {
                res = GroupCommand.invite(group, members);
            }
            return this.respondContent(res);
        }
    });
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.registers("QueryCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var RESET_CMD_ERROR = "Reset command error.";
    var RESET_NOT_ALLOWED = "Sorry, you are not allowed to reset this group.";
    var ResetCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(RESET_NOT_ALLOWED, group);
                }
            }
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            if (newMembers.indexOf(owner) < 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var removes = [];
            var item, i;
            for (i = 0; i < members.length; ++i) {
                item = members[i];
                if (newMembers.indexOf(item) < 0) {
                    removes.push(item.toString());
                }
            }
            var adds = [];
            for (i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (members.indexOf(item) < 0) {
                    adds.push(item.toString());
                }
            }
            if (adds.length > 0 || removes.length > 0) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (adds.length > 0) {
                        cmd.setValue("added", adds);
                    }
                    if (removes.length > 0) {
                        cmd.setValue("removed", removes);
                    }
                }
            }
            return null;
        },
        temporarySave: function (cmd, sender) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var newMembers = this.getMembers(cmd);
            if (newMembers.length === 0) {
                return this.respondText(RESET_CMD_ERROR, group);
            }
            var item;
            for (var i = 0; i < newMembers.length; ++i) {
                item = newMembers[i];
                if (!facebook.getMeta(item)) {
                    continue;
                } else {
                    if (!facebook.isOwner(item, group)) {
                        continue;
                    }
                }
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        this.queryOwner(item, group);
                    }
                }
                return null;
            }
            var res = GroupCommand.query(group);
            return this.respondContent(res);
        },
        queryOwner: function (owner, group) {}
    });
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.registers("ResetCommandProcessor");
})(DIMSDK);
(function (ns) {
    var ResetCommandProcessor = ns.cpu.ResetCommandProcessor;
    var INVITE_CMD_ERROR = "Invite command error.";
    var INVITE_NOT_ALLOWED =
        "Sorry, yo are not allowed to invite new members into this group.";
    var InviteCommandProcessor = function (facebook, messenger) {
        ResetCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(InviteCommandProcessor, ResetCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var sender = rMsg.getSender();
            if (members.indexOf(sender) < 0) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(INVITE_NOT_ALLOWED, group);
                }
            }
            var invites = this.getMembers(cmd);
            if (invites.length === 0) {
                return this.respondText(INVITE_CMD_ERROR, group);
            }
            if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
                return this.temporarySave(cmd, rMsg.getSender());
            }
            var adds = [];
            var item, pos;
            for (var i = 0; i < invites.length; ++i) {
                item = invites[i];
                pos = members.indexOf(item);
                if (pos >= 0) {
                    continue;
                }
                adds.push(item.toString());
                members.push(item);
            }
            if (adds.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("added", adds);
                }
            }
            return null;
        }
    });
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.registers("InviteCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var EXPEL_CMD_ERROR = "Expel command error.";
    var EXPEL_NOT_ALLOWED =
        "Sorry, you are not allowed to expel member from this group.";
    var CANNOT_EXPEL_OWNER = "Group owner cannot be expelled.";
    var ExpelCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (!owner.equals(sender)) {
                var assistants = facebook.getAssistants(group);
                if (!assistants || assistants.indexOf(sender) < 0) {
                    return this.respondText(EXPEL_NOT_ALLOWED, group);
                }
            }
            var expels = this.getMembers(cmd);
            if (expels.length === 0) {
                return this.respondText(EXPEL_CMD_ERROR, group);
            }
            if (expels.indexOf(owner) >= 0) {
                return this.respondText(CANNOT_EXPEL_OWNER, group);
            }
            var removes = [];
            var item, pos;
            for (var i = 0; i < expels.length; ++i) {
                item = expels[i];
                pos = members.indexOf(item);
                if (pos < 0) {
                    continue;
                }
                removes.push(item.toString());
                members.splice(pos, 1);
            }
            if (removes.length > 0) {
                if (facebook.saveMembers(members, group)) {
                    cmd.setValue("removed", removes);
                }
            }
            return null;
        }
    });
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.registers("ExpelCommandProcessor");
})(DIMSDK);
(function (ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var GROUP_EMPTY = "Group empty.";
    var OWNER_CANNOT_QUIT = "Sorry, owner cannot quit group.";
    var ASSISTANT_CANNOT_QUIT = "Sorry, assistant cannot quit group.";
    var QuitCommandProcessor = function (facebook, messenger) {
        GroupCommandProcessor.call(this, facebook, messenger);
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null, {
        process: function (cmd, rMsg) {
            var facebook = this.getFacebook();
            var group = cmd.getGroup();
            var owner = facebook.getOwner(group);
            var members = facebook.getMembers(group);
            if (!owner || !members || members.length === 0) {
                return this.respondText(GROUP_EMPTY, group);
            }
            var sender = rMsg.getSender();
            if (owner.equals(sender)) {
                return this.respondText(OWNER_CANNOT_QUIT, group);
            }
            var assistants = facebook.getAssistants(group);
            if (assistants && assistants.indexOf(sender) >= 0) {
                return this.removeAssistant(cmd, rMsg);
            }
            var pos = members.indexOf(sender);
            if (pos > 0) {
                members.splice(pos, 1);
                facebook.saveMembers(members, group);
            }
            return null;
        },
        removeAssistant: function (cmd, rMsg) {
            return this.respondText(ASSISTANT_CANNOT_QUIT, cmd.getGroup());
        }
    });
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.registers("QuitCommandProcessor");
})(DIMSDK);
