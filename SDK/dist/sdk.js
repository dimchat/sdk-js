/**
 *  DIM-SDK (v0.2.2)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 13, 2023
 * @copyright (c) 2023 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    if (typeof ns.cpu !== "object") {
        ns.cpu = {};
    }
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger;
    };
    Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook;
    };
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger;
    };
    ns.TwinsHelper = TwinsHelper;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseUser = ns.mkm.BaseUser;
    var Bot = function (identifier) {
        BaseUser.call(this, identifier);
    };
    Class(Bot, BaseUser, null, null);
    ns.mkm.Bot = Bot;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var User = ns.mkm.User;
    var BaseUser = ns.mkm.BaseUser;
    var Station = function () {
        BaseObject.call(this);
        var user;
        var host, port;
        if (arguments.length === 1) {
            user = new BaseUser(arguments[0]);
            host = null;
            port = 0;
        } else {
            if (arguments.length === 2) {
                user = new BaseUser(Station.ANY);
                host = arguments[0];
                port = arguments[1];
            } else {
                if (arguments.length === 3) {
                    user = new BaseUser(arguments[0]);
                    host = arguments[1];
                    port = arguments[2];
                }
            }
        }
        this.__user = user;
        this.__host = host;
        this.__port = port;
    };
    Class(Station, BaseUser, [User], {
        equals: function (other) {
            if (this === other) {
                return true;
            } else {
                if (!other) {
                    return false;
                }
            }
            return this.__user.equals(other);
        },
        valueOf: function () {
            return desc.call(this);
        },
        toString: function () {
            return desc.call(this);
        },
        setDataSource: function (delegate) {
            this.__user.setDataSource(delegate);
        },
        getDataSource: function () {
            return this.__user.getDataSource();
        },
        getIdentifier: function () {
            return this.__user.getIdentifier();
        },
        getType: function () {
            return this.__user.getType();
        },
        getMeta: function () {
            return this.__user.getMeta();
        },
        getDocument: function (type) {
            return this.__user.getDocument(type);
        },
        getVisa: function () {
            return this.__user.getVisa();
        },
        getContacts: function () {
            return this.__user.getContacts();
        },
        verify: function (data, signature) {
            return this.__user.verify(data, signature);
        },
        encrypt: function (plaintext) {
            return this.__user.encrypt(plaintext);
        },
        sign: function (data) {
            return this.__user.sign(data);
        },
        decrypt: function (ciphertext) {
            return this.__user.decrypt(ciphertext);
        },
        signVisa: function (doc) {
            return this.__user.signVisa(doc);
        },
        verifyVisa: function (doc) {
            return this.__user.verifyVisa(doc);
        },
        setIdentifier: function (identifier) {
            var delegate = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(delegate);
            this.__user = user;
        },
        getHost: function () {
            if (this.__host === null) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.__host = doc.getProperty("host");
                }
            }
            return this.__host;
        },
        getPort: function () {
            if (this.__port === 0) {
                var doc = this.getDocument("*");
                if (doc) {
                    this.__port = doc.getProperty("port");
                }
            }
            return this.__port;
        }
    });
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.getIdentifier();
        var network = id.getAddress().getType();
        return (
            "<" +
            clazz +
            ' id="' +
            id.toString() +
            '" network="' +
            network +
            '" host="' +
            this.getHost() +
            '" port=' +
            this.getPort() +
            " />"
        );
    };
    Station.ANY = ID.create("station", Address.ANYWHERE, null);
    Station.EVERY = ID.create("stations", Address.EVERYWHERE, null);
    ns.mkm.Station = Station;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var BaseGroup = ns.mkm.BaseGroup;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier);
    };
    Class(ServiceProvider, BaseGroup, null, {
        getStations: function () {
            return this.getMembers();
        }
    });
    ns.mkm.ServiceProvider = ServiceProvider;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var ContentProcessor = Interface(null, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        throw new Error("NotImplemented");
    };
    var Creator = Interface(null, null);
    Creator.prototype.createContentProcessor = function (type) {
        throw new Error("NotImplemented");
    };
    Creator.prototype.createCommandProcessor = function (type, cmd) {
        throw new Error("NotImplemented");
    };
    var Factory = Interface(null, null);
    Factory.prototype.getProcessor = function (content) {
        throw new Error("NotImplemented");
    };
    Factory.prototype.getContentProcessor = function (type) {
        throw new Error("NotImplemented");
    };
    Factory.prototype.getCommandProcessor = function (type, cmd) {
        throw new Error("NotImplemented");
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);
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
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (cmd, rMsg) {
            var text = "Command (name: " + cmd.getCmd() + ") not support yet!";
            return this.respondText(text, cmd.getGroup());
        }
    });
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger);
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger);
            }
            return null;
        },
        createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (cmd === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger);
            } else {
                if (cmd === Command.DOCUMENT) {
                    return new ns.cpu.DocumentCommandProcessor(facebook, messenger);
                }
            }
            return null;
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
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
    Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory], null);
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var name = content.getCmd();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu;
            } else {
                if (Interface.conforms(content, GroupCommand)) {
                    cpu = this.getCommandProcessor(type, "group");
                    if (cpu) {
                        return cpu;
                    }
                }
            }
        }
        return this.getContentProcessor(type);
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
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu;
            }
        }
        return cpu;
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var MetaCommand = ns.protocol.MetaCommand;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {
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
            return [res];
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
        } else {
            text = "Meta not accepted: " + identifier;
        }
        return this.respondText(text, null);
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger);
    };
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (content, rMsg) {
            var identifier = content.getIdentifier();
            if (identifier) {
                var doc = content.getDocument();
                if (!doc) {
                    var type = content.getString("doc_type");
                    if (!type) {
                        type = "*";
                    }
                    return get_doc.call(this, identifier, type);
                } else {
                    if (identifier.equals(doc.getIdentifier())) {
                        var meta = content.getMeta();
                        return put_doc.call(this, identifier, meta, doc);
                    }
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
            return [res];
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
        } else {
            text = "Document not accept: " + identifier;
        }
        return this.respondText(text, null);
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ForwardContent = ns.protocol.ForwardContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secrets = content.getSecrets();
            if (!secrets) {
                return null;
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < secrets.length; ++i) {
                results = messenger.processReliableMessage(secrets[i]);
                if (!results) {
                    res = ForwardContent.create([]);
                } else {
                    if (results.length === 1) {
                        res = ForwardContent.create(results[0]);
                    } else {
                        res = ForwardContent.create(results);
                    }
                }
                responses.push(res);
            }
            return responses;
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var ArrayContent = ns.protocol.ArrayContent;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var ArrayContentProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger);
    };
    Class(ArrayContentProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var array = content.getContents();
            if (!array) {
                return null;
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < array.length; ++i) {
                results = messenger.processContent(array[i], rMsg);
                if (!results) {
                    res = ArrayContent.create([]);
                } else {
                    if (results.length === 1) {
                        res = results[0];
                    } else {
                        res = ArrayContent.create(results);
                    }
                }
                responses.push(res);
            }
            return responses;
        }
    });
    ns.cpu.ArrayContentProcessor = ArrayContentProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var CustomizedContentHandler = Interface(null, null);
    CustomizedContentHandler.prototype.handleAction = function (
        act,
        sender,
        content,
        rMsg
    ) {
        throw new Error("NotImplemented");
    };
    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
    };
    Class(
        CustomizedContentProcessor,
        BaseContentProcessor,
        [CustomizedContentHandler],
        {
            process: function (content, rMsg) {
                var app = content.getApplication();
                var res = this.filterApplication(app, content, rMsg);
                if (res) {
                    return res;
                }
                var mod = content.getModule();
                var handler = this.fetchHandler(mod, content, rMsg);
                if (!handler) {
                    return null;
                }
                var act = rMsg.getAction();
                var sender = rMsg.getSender();
                return handler.handleAction(act, sender, content, rMsg);
            },
            filterApplication: function (app, content, rMsg) {
                var text = "Customized Content (app: " + app + ") not support yet!";
                return this.respondText(text, content.getGroup());
            },
            fetchHandler: function (mod, content, rMsg) {
                return this;
            },
            handleAction: function (act, sender, content, rMsg) {
                var app = content.getApplication();
                var mod = content.getModule();
                var text =
                    "Customized Content (app: " +
                    app +
                    ", mod: " +
                    mod +
                    ", act: " +
                    act +
                    ") not support yet!";
                return this.respondText(text, content.getGroup());
            }
        }
    );
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
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
        "document",
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
        "bot",
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
    var AddressNameService = Interface(null, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function (name) {
        throw new Error("NotImplemented");
    };
    AddressNameService.prototype.getIdentifier = function (name) {
        throw new Error("NotImplemented");
    };
    AddressNameService.prototype.getNames = function (identifier) {
        throw new Error("NotImplemented");
    };
    ns.AddressNameService = AddressNameService;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var BaseUser = ns.mkm.BaseUser;
    var BaseGroup = ns.mkm.BaseGroup;
    var Bot = ns.mkm.Bot;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.Barrack;
    var Facebook = function () {
        Barrack.call(this);
        this.__users = {};
        this.__groups = {};
    };
    Class(Facebook, Barrack, null, {
        checkDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false;
            }
            var meta;
            if (identifier.isGroup()) {
                var owner = this.getOwner(identifier);
                if (!owner) {
                    if (EntityType.GROUP.equals(identifier.getType())) {
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
            var mMeta = this.getMeta(member);
            return Meta.matchKey(mMeta.getKey(), gMeta);
        },
        isOwner: function (member, group) {
            if (EntityType.GROUP.equals(group.getType())) {
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
    Facebook.prototype.reduceMemory = function () {
        var finger = 0;
        finger = ns.mkm.thanos(this.__users, finger);
        finger = ns.mkm.thanos(this.__groups, finger);
        return finger >> 1;
    };
    Facebook.prototype.saveMeta = function (meta, identifier) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.saveDocument = function (doc) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.saveMembers = function (members, identifier) {
        throw new Error("NotImplemented");
    };
    Facebook.prototype.createUser = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseUser(identifier);
        }
        var type = identifier.getType();
        if (EntityType.STATION.equals(type)) {
            return new Station(identifier);
        } else {
            if (EntityType.BOT.equals(type)) {
                return new Bot(identifier);
            }
        }
        return new BaseUser(identifier);
    };
    Facebook.prototype.createGroup = function (identifier) {
        if (identifier.isBroadcast()) {
            return new BaseGroup(identifier);
        }
        var type = identifier.getType();
        if (EntityType.ISP.equals(type)) {
            return new ServiceProvider(identifier);
        }
        return new BaseGroup(identifier);
    };
    Facebook.prototype.getLocalUsers = function () {
        throw new Error("NotImplemented");
    };
    ns.Facebook = Facebook;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var Packer = ns.Packer;
    var TwinsHelper = ns.TwinsHelper;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
    };
    Class(MessagePacker, TwinsHelper, [Packer], {
        getOvertGroup: function (content) {
            var group = content.getGroup();
            if (!group) {
                return null;
            }
            if (group.isBroadcast()) {
                return group;
            }
            if (Interface.conforms(content, Command)) {
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
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var Processor = ns.Processor;
    var TwinsHelper = ns.TwinsHelper;
    var MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory();
    };
    Class(MessageProcessor, TwinsHelper, [Processor], {
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
                if (!msg) {
                    continue;
                }
                messages.push(msg);
            }
            return messages;
        },
        processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            if (!cpu) {
                cpu = this.getContentProcessor(0);
            }
            return cpu.process(content, rMsg);
        }
    });
    MessageProcessor.prototype.getProcessor = function (content) {
        return this.__factory.getProcessor(content);
    };
    MessageProcessor.prototype.getContentProcessor = function (type) {
        return this.__factory.getContentProcessor(type);
    };
    MessageProcessor.prototype.getCommandProcessor = function (type, cmd) {
        return this.__factory.getCommandProcessor(type, cmd);
    };
    ns.MessageProcessor = MessageProcessor;
})(DIMP);
(function (ns) {
    var Interface = ns.type.Interface;
    var CipherKeyDelegate = Interface(null, null);
    CipherKeyDelegate.prototype.getCipherKey = function (from, to, generate) {
        throw new Error("NotImplemented");
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (from, to, key) {
        throw new Error("NotImplemented");
    };
    ns.CipherKeyDelegate = CipherKeyDelegate;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Transceiver = ns.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    Class(Messenger, Transceiver, null, null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        throw new Error("NotImplemented");
    };
    Messenger.prototype.getPacker = function () {
        throw new Error("NotImplemented");
    };
    Messenger.prototype.getProcessor = function () {
        throw new Error("NotImplemented");
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
        return Transceiver.prototype.isBroadcast(msg);
    };
    ns.Messenger = Messenger;
})(DIMP);
(function (ns) {
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
    var ContentFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentFactory, Object, [Content.Factory], null);
    ContentFactory.prototype.parseContent = function (content) {
        return new this.__class(content);
    };
    var CommandFactory = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandFactory, Object, [Command.Factory], null);
    CommandFactory.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    Class(
        GeneralCommandFactory,
        Object,
        [Content.Factory, Command.Factory],
        null
    );
    var general_factory = function () {
        var man = ns.dkd.cmd.FactoryManager;
        return man.generalFactory;
    };
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content);
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            if (content["group"]) {
                factory = gf.getCommandFactory("group");
            }
            if (!factory) {
                factory = this;
            }
        }
        return factory.parseCommand(content);
    };
    GeneralCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseCommand(cmd);
    };
    var HistoryCommandFactory = function () {
        GeneralCommandFactory.call(this);
    };
    Class(HistoryCommandFactory, GeneralCommandFactory, null, null);
    HistoryCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseHistoryCommand(cmd);
    };
    var GroupCommandFactory = function () {
        HistoryCommandFactory.call(this);
    };
    Class(GroupCommandFactory, HistoryCommandFactory, null, null);
    GroupCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content);
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseGroupCommand(cmd);
    };
    ns.ContentFactory = ContentFactory;
    ns.CommandFactory = CommandFactory;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;
})(DIMP);
(function (ns) {
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var EnvelopeFactory = ns.dkd.EnvelopeFactory;
    var InstantMessageFactory = ns.dkd.InstantMessageFactory;
    var SecureMessageFactory = ns.dkd.SecureMessageFactory;
    var ReliableMessageFactory = ns.dkd.ReliableMessageFactory;
    var ContentFactory = ns.ContentFactory;
    var CommandFactory = ns.CommandFactory;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory = ns.GroupCommandFactory;
    var registerMessageFactories = function () {
        Envelope.setFactory(new EnvelopeFactory());
        InstantMessage.setFactory(new InstantMessageFactory());
        SecureMessage.setFactory(new SecureMessageFactory());
        ReliableMessage.setFactory(new ReliableMessageFactory());
    };
    var registerContentFactories = function () {
        Content.setFactory(
            ContentType.TEXT,
            new ContentFactory(ns.dkd.BaseTextContent)
        );
        Content.setFactory(
            ContentType.FILE,
            new ContentFactory(ns.dkd.BaseFileContent)
        );
        Content.setFactory(
            ContentType.IMAGE,
            new ContentFactory(ns.dkd.ImageFileContent)
        );
        Content.setFactory(
            ContentType.AUDIO,
            new ContentFactory(ns.dkd.AudioFileContent)
        );
        Content.setFactory(
            ContentType.VIDEO,
            new ContentFactory(ns.dkd.VideoFileContent)
        );
        Content.setFactory(
            ContentType.PAGE,
            new ContentFactory(ns.dkd.WebPageContent)
        );
        Content.setFactory(
            ContentType.MONEY,
            new ContentFactory(ns.dkd.BaseMoneyContent)
        );
        Content.setFactory(
            ContentType.TRANSFER,
            new ContentFactory(ns.dkd.TransferMoneyContent)
        );
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());
        Content.setFactory(
            ContentType.ARRAY,
            new ContentFactory(ns.dkd.ListContent)
        );
        Content.setFactory(
            ContentType.FORWARD,
            new ContentFactory(ns.dkd.SecretContent)
        );
        Content.setFactory(0, new ContentFactory(ns.dkd.BaseContent));
    };
    var registerCommandFactories = function () {
        Command.setFactory(
            Command.META,
            new CommandFactory(ns.dkd.cmd.BaseMetaCommand)
        );
        Command.setFactory(
            Command.DOCUMENT,
            new CommandFactory(ns.dkd.cmd.BaseDocumentCommand)
        );
        Command.setFactory("group", new GroupCommandFactory());
        Command.setFactory(
            GroupCommand.INVITE,
            new CommandFactory(ns.dkd.cmd.InviteGroupCommand)
        );
        Command.setFactory(
            GroupCommand.EXPEL,
            new CommandFactory(ns.dkd.cmd.ExpelGroupCommand)
        );
        Command.setFactory(
            GroupCommand.JOIN,
            new CommandFactory(ns.dkd.cmd.JoinGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUIT,
            new CommandFactory(ns.dkd.cmd.QuitGroupCommand)
        );
        Command.setFactory(
            GroupCommand.QUERY,
            new CommandFactory(ns.dkd.cmd.QueryGroupCommand)
        );
        Command.setFactory(
            GroupCommand.RESET,
            new CommandFactory(ns.dkd.cmd.ResetGroupCommand)
        );
    };
    var registerAllFactories = function () {
        registerMessageFactories();
        registerContentFactories();
        registerCommandFactories();
        Content.setFactory(
            ContentType.CUSTOMIZED,
            new ContentFactory(ns.dkd.AppCustomizedContent)
        );
        Content.setFactory(
            ContentType.APPLICATION,
            new ContentFactory(ns.dkd.AppCustomizedContent)
        );
    };
    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;
    ns.registerAllFactories = registerAllFactories;
})(DIMP);
