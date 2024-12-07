/**
 *  DIM-SDK (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 19, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    'use strict';
    if (typeof ns.cpu !== 'object') {
        ns.cpu = {}
    }
    if (typeof ns.utils !== 'object') {
        ns.utils = {}
    }
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var TwinsHelper = function (facebook, messenger) {
        Object.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger
    };
    Class(TwinsHelper, Object, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook
    }
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger
    }
    TwinsHelper.prototype.respondReceipt = function (text, envelope, content, extra) {
        var res = TwinsHelper.createReceipt(text, envelope, content, extra);
        return [res]
    }
    TwinsHelper.createReceipt = function (text, envelope, content, extra) {
        var res = ReceiptCommand.create(text, envelope, content);
        if (extra) {
            var keys = Object.keys(extra);
            var name, value;
            for (var i = 0; i < keys.length; ++i) {
                name = keys[i];
                value = extra[name];
                res.setValue(name, value)
            }
        }
        return res
    };
    ns.TwinsHelper = TwinsHelper
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var FrequencyChecker = function (lifeSpan) {
        this.__expires = lifeSpan;
        this.__records = {}
    };
    Class(FrequencyChecker, null, null, null);
    FrequencyChecker.prototype.forceExpired = function (key, now) {
        this.__records[key] = now + this.__expires;
        return true
    };
    FrequencyChecker.prototype.checkExpired = function (key, now) {
        var expired = this.__records[key];
        if (expired && expired > now) {
            return false
        }
        this.__records[key] = now + this.__expires;
        return true
    };
    FrequencyChecker.prototype.isExpired = function (key, now, force) {
        if (!now) {
            now = new Date();
            now = now.getTime()
        } else if (now instanceof Date) {
            now = now.getTime()
        }
        if (force) {
            return this.forceExpired(key, now)
        } else {
            return this.checkExpired(key, now)
        }
    };
    var RecentTimeChecker = function () {
        this.__times = {}
    };
    Class(RecentTimeChecker, null, null, null);
    RecentTimeChecker.prototype.setLastTime = function (key, when) {
        if (!when) {
            return false
        } else if (when instanceof Date) {
            when = when.getTime()
        }
        var last = this.__times[key];
        if (!last || last < when) {
            this.__times[key] = when;
            return true
        } else {
            return false
        }
    };
    RecentTimeChecker.prototype.isExpired = function (key, now) {
        if (!now) {
            return true
        } else if (now instanceof Date) {
            now = now.getTime()
        }
        var last = this.__times[key];
        return last && last > now
    };
    ns.utils.FrequencyChecker = FrequencyChecker;
    ns.utils.RecentTimeChecker = RecentTimeChecker
})(DIMP);
(function (ns) {
    'use strict';
    var kFounder = (0x20);
    var kOwner = (0x3F);
    var kAdmin = (0x0F);
    var kMember = (0x07);
    var kOther = (0x00);
    var kFreezing = (0x80);
    var kWaiting = (0x40);
    var kOwnerWaiting = (kOwner | kWaiting);
    var kOwnerFreezing = (kOwner | kFreezing);
    var kAdminWaiting = (kAdmin | kWaiting);
    var kAdminFreezing = (kAdmin | kFreezing);
    var kMemberWaiting = (kMember | kWaiting);
    var kMemberFreezing = (kMember | kFreezing);
    ns.mkm.MemberType = ns.type.Enum(null, {
        FOUNDER: kFounder,
        OWNER: kOwner,
        ADMIN: kAdmin,
        MEMBER: kMember,
        OTHER: kOther,
        FREEZING: kFreezing,
        WAITING: kWaiting,
        OWNER_WAITING: kOwnerWaiting,
        OWNER_FREEZING: kOwnerFreezing,
        ADMIN_WAITING: kAdminWaiting,
        ADMIN_FREEZING: kAdminFreezing,
        MEMBER_WAITING: kMemberWaiting,
        MEMBER_FREEZING: kMemberFreezing
    })
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var BaseUser = ns.mkm.BaseUser;
    var Bot = function (identifier) {
        BaseUser.call(this, identifier)
    };
    Class(Bot, BaseUser, null, {
        getProfile: function () {
            return this.getVisa()
        }, getProvider: function () {
            var doc = this.getProfile();
            if (doc) {
                var icp = doc.getProperty('ICP');
                return ID.parse(icp)
            }
            return null
        }
    });
    ns.mkm.Bot = Bot
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseObject = ns.type.BaseObject;
    var Converter = ns.type.Converter;
    var ID = ns.protocol.ID;
    var Address = ns.protocol.Address;
    var Identifier = ns.mkm.Identifier;
    var User = ns.mkm.User;
    var BaseUser = ns.mkm.BaseUser;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var Station = function () {
        BaseObject.call(this);
        var user;
        var host, port;
        if (arguments.length === 1) {
            user = new BaseUser(arguments[0]);
            host = null;
            port = 0
        } else if (arguments.length === 2) {
            user = new BaseUser(Station.ANY);
            host = arguments[0];
            port = arguments[1]
        } else if (arguments.length === 3) {
            user = new BaseUser(arguments[0]);
            host = arguments[1];
            port = arguments[2]
        }
        this.__user = user;
        this.__host = host;
        this.__port = port;
        this.__isp = null
    };
    Class(Station, BaseObject, [User], {
        equals: function (other) {
            if (this === other) {
                return true
            } else if (!other) {
                return false
            } else if (other instanceof Station) {
                return ns.mkm.ServiceProvider.sameStation(other, this)
            }
            return this.__user.equals(other)
        }, valueOf: function () {
            return desc.call(this)
        }, toString: function () {
            return desc.call(this)
        }, setDataSource: function (delegate) {
            this.__user.setDataSource(delegate)
        }, getDataSource: function () {
            return this.__user.getDataSource()
        }, getIdentifier: function () {
            return this.__user.getIdentifier()
        }, getType: function () {
            return this.__user.getType()
        }, getMeta: function () {
            return this.__user.getMeta()
        }, getDocuments: function () {
            return this.__user.getDocuments()
        }, getVisa: function () {
            return this.__user.getVisa()
        }, getContacts: function () {
            return this.__user.getContacts()
        }, verify: function (data, signature) {
            return this.__user.verify(data, signature)
        }, encrypt: function (plaintext) {
            return this.__user.encrypt(plaintext)
        }, sign: function (data) {
            return this.__user.sign(data)
        }, decrypt: function (ciphertext) {
            return this.__user.decrypt(ciphertext)
        }, signVisa: function (doc) {
            return this.__user.signVisa(doc)
        }, verifyVisa: function (doc) {
            return this.__user.verifyVisa(doc)
        }, setIdentifier: function (identifier) {
            var delegate = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(delegate);
            this.__user = user
        }, getHost: function () {
            if (!this.__host) {
                this.reload()
            }
            return this.__host
        }, getPort: function () {
            if (!this.__port) {
                this.reload()
            }
            return this.__port
        }, getProvider: function () {
            if (!this.__isp) {
                this.reload()
            }
            return this.__isp
        }, getProfile: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastDocument(docs)
        }, reload: function () {
            var doc = this.getProfile();
            if (doc) {
                var host = doc.getProperty('host');
                host = Converter.getString(host, null);
                if (host) {
                    this.__host = host
                }
                var port = doc.getProperty('port');
                port = Converter.getInt(port, 0);
                if (port > 0) {
                    this.__port = port
                }
                var isp = doc.getProperty('ISP');
                isp = ID.parse(isp);
                if (isp) {
                    this.__isp = isp
                }
            }
        }
    });
    var desc = function () {
        var clazz = Object.getPrototypeOf(this).constructor.name;
        var id = this.getIdentifier();
        var network = id.getAddress().getType();
        return '<' + clazz + ' id="' + id.toString() + '" network="' + network + '" host="' + this.getHost() + '" port=' + this.getPort() + ' />'
    };
    Station.ANY = Identifier.create('station', Address.ANYWHERE, null);
    Station.EVERY = Identifier.create('stations', Address.EVERYWHERE, null);
    ns.mkm.Station = Station
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseGroup = ns.mkm.BaseGroup;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier)
    };
    Class(ServiceProvider, BaseGroup, null, {
        getProfile: function () {
            var docs = this.getDocuments();
            return DocumentHelper.lastDocument(docs)
        }, getStations: function () {
            var doc = this.getProfile();
            if (doc) {
                var stations = doc.getProperty('stations');
                if (stations instanceof Array) {
                    return stations
                }
            }
            return []
        }
    });
    ServiceProvider.sameStation = function (a, b) {
        if (a === b) {
            return true
        }
        return checkIdentifiers(a.getIdentifier(), b.getIdentifier()) && checkHosts(a.getHost(), b.getHost()) && checkPorts(a.getPort(), b.getPort())
    };
    var checkIdentifiers = function (a, b) {
        if (a === b) {
            return true
        } else if (a.isBroadcast() || b.isBroadcast()) {
            return true
        }
        return a.equals(b)
    };
    var checkHosts = function (a, b) {
        if (!a || !b) {
            return true
        }
        return a === b
    };
    var checkPorts = function (a, b) {
        if (!a || !b) {
            return true
        }
        return a === b
    };
    ns.mkm.ServiceProvider = ServiceProvider
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var SecureMessage = ns.protocol.SecureMessage;
    var BaseMessage = ns.msg.BaseMessage;
    var InstantMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(InstantMessagePacker, null, null, null);
    InstantMessagePacker.prototype.getInstantMessageDelegate = function () {
        return this.__transceiver
    };
    InstantMessagePacker.prototype.encryptMessage = function (iMsg, password, members) {
        var transceiver = this.getInstantMessageDelegate();
        var body = transceiver.serializeContent(iMsg.getContent(), password, iMsg);
        var ciphertext = transceiver.encryptContent(body, password, iMsg);
        var encodedData;
        if (BaseMessage.isBroadcast(iMsg)) {
            encodedData = UTF8.decode(ciphertext)
        } else {
            encodedData = TransportableData.encode(ciphertext)
        }
        var info = iMsg.copyMap(false);
        delete info['content'];
        info['data'] = encodedData;
        var pwd = transceiver.serializeKey(password, iMsg);
        if (!pwd) {
            return SecureMessage.parse(info)
        }
        var receiver;
        var encryptedKey;
        var encodedKey;
        if (!members) {
            receiver = iMsg.getReceiver();
            encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
            if (!encryptedKey) {
                return null
            }
            encodedKey = TransportableData.encode(encryptedKey);
            info['key'] = encodedKey
        } else {
            var keys = {};
            for (var i = 0; i < members.length; ++i) {
                receiver = members[i];
                encryptedKey = transceiver.encryptKey(pwd, receiver, iMsg);
                if (!encryptedKey) {
                    return null
                }
                encodedKey = TransportableData.encode(encryptedKey);
                keys[receiver.toString()] = encodedKey
            }
            if (Object.keys(keys).length === 0) {
                return null
            }
            info['keys'] = keys
        }
        return SecureMessage.parse(info)
    };
    ns.msg.InstantMessagePacker = InstantMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var InstantMessage = ns.protocol.InstantMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var SecureMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(SecureMessagePacker, null, null, null);
    SecureMessagePacker.prototype.getSecureMessageDelegate = function () {
        return this.__transceiver
    };
    SecureMessagePacker.prototype.decryptMessage = function (sMsg, receiver) {
        var transceiver = this.getSecureMessageDelegate();
        var encryptedKey = sMsg.getEncryptedKey();
        var keyData;
        if (encryptedKey) {
            keyData = transceiver.decryptKey(encryptedKey, receiver, sMsg);
            if (!keyData) {
                throw new ReferenceError('failed to decrypt message key: ' + encryptedKey.length + ' byte(s) ' + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
            }
        }
        var password = transceiver.deserializeKey(keyData, sMsg);
        if (!password) {
            throw new ReferenceError('failed to get message key: ' + keyData.length + ' byte(s) ' + sMsg.getSender() + ' => ' + receiver + ', ' + sMsg.getGroup());
        }
        var ciphertext = sMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            return null
        }
        var body = transceiver.decryptContent(ciphertext, password, sMsg);
        if (!body) {
            throw new ReferenceError('failed to decrypt message data with key: ' + password + ', data length: ' + ciphertext.length + ' byte(s)');
        }
        var content = transceiver.deserializeContent(body, password, sMsg);
        if (!content) {
            return null
        }
        var info = sMsg.copyMap(false);
        delete info['key'];
        delete info['keys'];
        delete info['data'];
        info['content'] = content.toMap();
        return InstantMessage.parse(info)
    };
    SecureMessagePacker.prototype.signMessage = function (sMsg) {
        var transceiver = this.getSecureMessageDelegate();
        var ciphertext = sMsg.getData();
        var signature = transceiver.signData(ciphertext, sMsg);
        var base64 = TransportableData.encode(signature);
        var info = sMsg.copyMap(false);
        info['signature'] = base64;
        return ReliableMessage.parse(info)
    };
    ns.msg.SecureMessagePacker = SecureMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessagePacker = function (messenger) {
        this.__transceiver = messenger
    };
    Class(ReliableMessagePacker, null, null, null);
    ReliableMessagePacker.prototype.getReliableMessageDelegate = function () {
        return this.__transceiver
    };
    ReliableMessagePacker.prototype.verifyMessage = function (rMsg) {
        var transceiver = this.getReliableMessageDelegate();
        var ciphertext = rMsg.getData();
        if (!ciphertext || ciphertext.length === 0) {
            return null
        }
        var signature = rMsg.getSignature();
        if (!signature || signature.length === 0) {
            return null
        }
        var ok = transceiver.verifyDataSignature(ciphertext, signature, rMsg);
        if (!ok) {
            return null
        }
        var info = rMsg.copyMap(false);
        delete info['signature'];
        return SecureMessage.parse(info)
    };
    ns.msg.ReliableMessagePacker = ReliableMessagePacker
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var Visa = ns.protocol.Visa;
    var setMeta = function (meta, msg) {
        msg.setMap('meta', meta)
    };
    var getMeta = function (msg) {
        var meta = msg.getValue('meta');
        return Meta.parse(meta)
    };
    var setVisa = function (visa, msg) {
        msg.setMap('visa', visa)
    };
    var getVisa = function (msg) {
        var visa = msg.getValue('visa');
        var doc = Document.parse(visa);
        if (Interface.conforms(doc, Visa)) {
            return doc
        }
        return null
    };
    ns.msg.MessageHelper = {getMeta: getMeta, setMeta: setMeta, getVisa: getVisa, setVisa: setVisa}
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var MessageEnvelope = ns.msg.MessageEnvelope;
    var PlainMessage = ns.msg.PlainMessage;
    var EncryptedMessage = ns.msg.EncryptedMessage;
    var NetworkMessage = ns.msg.NetworkMessage;
    var random_int = function (max) {
        return Math.floor(Math.random() * max)
    };
    var MessageFactory = function () {
        Object.call(this);
        this.__sn = random_int(0x7fffffff)
    };
    Class(MessageFactory, Object, [Envelope.Factory, InstantMessage.Factory, SecureMessage.Factory, ReliableMessage.Factory], null);
    MessageFactory.prototype.next = function () {
        var sn = this.__sn;
        if (sn < 0x7fffffff) {
            sn += 1
        } else {
            sn = 1
        }
        this.__sn = sn;
        return sn
    };
    MessageFactory.prototype.createEnvelope = function (from, to, when) {
        return new MessageEnvelope(from, to, when)
    };
    MessageFactory.prototype.parseEnvelope = function (env) {
        if (!env['sender']) {
            return null
        }
        return new MessageEnvelope(env)
    };
    MessageFactory.prototype.generateSerialNumber = function (msgType, now) {
        return this.next()
    };
    MessageFactory.prototype.createInstantMessage = function (head, body) {
        return new PlainMessage(head, body)
    };
    MessageFactory.prototype.parseInstantMessage = function (msg) {
        if (!msg["sender"] || !msg["content"]) {
            return null
        }
        return new PlainMessage(msg)
    };
    MessageFactory.prototype.parseSecureMessage = function (msg) {
        if (!msg["sender"] || !msg["data"]) {
            return null
        }
        if (msg['signature']) {
            return new NetworkMessage(msg)
        }
        return new EncryptedMessage(msg)
    };
    MessageFactory.prototype.parseReliableMessage = function (msg) {
        if (!msg['sender'] || !msg['data'] || !msg['signature']) {
            return null
        }
        return new NetworkMessage(msg)
    };
    ns.msg.MessageFactory = MessageFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ContentProcessor = Interface(null, null);
    ContentProcessor.prototype.process = function (content, rMsg) {
        throw new Error('ContentProcessor::process');
    };
    var Creator = Interface(null, null);
    Creator.prototype.createContentProcessor = function (type) {
        throw new Error('Creator::createContentProcessor');
    };
    Creator.prototype.createCommandProcessor = function (type, cmd) {
        throw new Error('Creator::createCommandProcessor');
    };
    var Factory = Interface(null, null);
    Factory.prototype.getProcessor = function (content) {
        throw new Error('Factory::getProcessor');
    };
    Factory.prototype.getContentProcessor = function (type) {
        throw new Error('Factory::getContentProcessor');
    };
    Factory.prototype.getCommandProcessor = function (type, cmd) {
        throw new Error('Factory::getCommandProcessor');
    };
    ContentProcessor.Creator = Creator;
    ContentProcessor.Factory = Factory;
    ns.cpu.ContentProcessor = ContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorFactory = function (facebook, messenger, creator) {
        TwinsHelper.call(this, facebook, messenger);
        this.__creator = creator;
        this.__content_processors = {}
        this.__command_processors = {}
    };
    Class(ContentProcessorFactory, TwinsHelper, [ContentProcessor.Factory], null);
    ContentProcessorFactory.prototype.getProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var name = content.getCmd();
            cpu = this.getCommandProcessor(type, name);
            if (cpu) {
                return cpu
            } else if (Interface.conforms(content, GroupCommand)) {
                cpu = this.getCommandProcessor(type, 'group');
                if (cpu) {
                    return cpu
                }
            }
        }
        return this.getContentProcessor(type)
    };
    ContentProcessorFactory.prototype.getContentProcessor = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu
            }
        }
        return cpu
    };
    ContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu
            }
        }
        return cpu
    };
    ns.cpu.ContentProcessorFactory = ContentProcessorFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], {
        process: function (content, rMsg) {
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Content (type: ${type}) not support yet!',
                'replacements': {'type': content.getType()}
            })
        }
    });
    var BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }
    });
    ns.cpu.BaseContentProcessor = BaseContentProcessor;
    ns.cpu.BaseCommandProcessor = BaseCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ForwardContent = ns.protocol.ForwardContent;
    var ArrayContent = ns.protocol.ArrayContent;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(ForwardContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var secrets = content.getSecrets();
            if (!secrets) {
                return null
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < secrets.length; ++i) {
                results = messenger.processReliableMessage(secrets[i]);
                if (!results) {
                    res = ForwardContent.create([])
                } else if (results.length === 1) {
                    res = ForwardContent.create(results[0])
                } else {
                    res = ForwardContent.create(results)
                }
                responses.push(res)
            }
            return responses
        }
    });
    var ArrayContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(ArrayContentProcessor, BaseContentProcessor, null, {
        process: function (content, rMsg) {
            var array = content.getContents();
            if (!array) {
                return null
            }
            var messenger = this.getMessenger();
            var responses = [];
            var res;
            var results;
            for (var i = 0; i < array.length; ++i) {
                results = messenger.processContent(array[i], rMsg);
                if (!results) {
                    res = ArrayContent.create([])
                } else if (results.length === 1) {
                    res = results[0]
                } else {
                    res = ArrayContent.create(results)
                }
                responses.push(res)
            }
            return responses
        }
    });
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.ArrayContentProcessor = ArrayContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var MetaCommand = ns.protocol.MetaCommand;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseCommandProcessor = ns.cpu.BaseCommandProcessor;
    var MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {
        process: function (content, rMsg) {
            var identifier = content.getIdentifier();
            if (!identifier) {
                var text = 'Meta command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content)
            }
            var meta = content.getMeta();
            if (meta) {
                return this.updateMeta(meta, identifier, content, rMsg.getEnvelope())
            } else {
                return this.queryMeta(identifier, content, rMsg.getEnvelope())
            }
        }, queryMeta: function (identifier, content, envelope) {
            var facebook = this.getFacebook();
            var meta = facebook.getMeta(identifier);
            if (meta) {
                var res = MetaCommand.response(identifier, meta);
                return [res]
            }
            var text = 'Meta not found.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta not found: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, updateMeta: function (meta, identifier, content, envelope) {
            var errors = this.saveMeta(meta, identifier, content, envelope);
            if (errors) {
                return errors
            }
            var text = 'Meta received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta received: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, saveMeta: function (meta, identifier, content, envelope) {
            var text;
            if (!this.checkMeta(meta, identifier)) {
                text = 'Meta not valid.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not valid: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            } else if (!this.getFacebook().saveMeta(meta, identifier)) {
                text = 'Meta not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not accepted: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            return null
        }, checkMeta: function (meta, identifier) {
            return meta.isValid() && meta.matchIdentifier(identifier)
        }
    });
    var DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger)
    };
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        process: function (content, rMsg) {
            var text;
            var identifier = content.getIdentifier();
            if (!identifier) {
                text = 'Document command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content)
            }
            var doc = content.getDocument();
            if (!doc) {
                return this.queryDocument(identifier, content, rMsg.getEnvelope())
            } else if (identifier.equals(doc.getIdentifier())) {
                return this.updateDocument(doc, identifier, content, rMsg.getEnvelope())
            }
            text = 'Document ID not match.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Document ID not match: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, queryDocument: function (identifier, content, envelope) {
            var text;
            var docs = this.getFacebook().getDocuments(identifier);
            if (!docs || docs.length === 0) {
                text = 'Document not found.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not found: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            var queryTime = content.getLastTime();
            if (queryTime) {
                var last = DocumentHelper.lastDocument(docs);
                var lastTime = !last ? null : last.getTime();
                if (!lastTime) {
                } else if (lastTime.getTime() > queryTime.getTime()) {
                    text = 'Document not updated.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Document not updated: ${ID}, last time: ${time}.',
                        'replacements': {'ID': identifier.toString(), 'time': lastTime.getTime()}
                    })
                }
            }
            var meta = this.getFacebook().getMeta(identifier);
            var command = DocumentCommand.response(identifier, meta, docs[0]);
            var responses = [command];
            for (var i = 1; i < docs.length; ++i) {
                command = DocumentCommand.response(identifier, null, docs[i]);
                responses.push(command)
            }
            return responses
        }, updateDocument: function (doc, identifier, content, envelope) {
            var errors;
            var meta = content.getMeta();
            var text;
            if (!meta) {
                meta = this.getFacebook().getMeta(identifier);
                if (!meta) {
                    text = 'Meta not found.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Meta not found: ${ID}.',
                        'replacements': {'ID': identifier.toString()}
                    })
                }
            } else {
                errors = this.saveMeta(meta, identifier, content, envelope);
                if (errors) {
                    return errors
                }
            }
            errors = this.saveDocument(doc, meta, identifier, content, envelope);
            if (errors) {
                return errors
            }
            text = 'Document received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Document received: ${ID}.',
                'replacements': {'ID': identifier.toString()}
            })
        }, saveDocument: function (doc, meta, identifier, content, envelope) {
            var text;
            if (!this.checkDocument(doc, meta)) {
                text = 'Document not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not accepted: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            } else if (!this.getFacebook().saveDocument(doc)) {
                text = 'Document not changed.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not changed: ${ID}.',
                    'replacements': {'ID': identifier.toString()}
                })
            }
            return null
        }, checkDocument: function (doc, meta) {
            if (doc.isValid()) {
                return true
            }
            return doc.verify(meta.getPublicKey())
        }
    });
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var Class = ns.type.Class;
    var BaseContentProcessor = ns.cpu.BaseContentProcessor;
    var CustomizedContentHandler = Interface(null, null);
    CustomizedContentHandler.prototype.handleAction = function (act, sender, content, rMsg) {
    };
    var CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    Class(CustomizedContentProcessor, BaseContentProcessor, [CustomizedContentHandler], {
        process: function (content, rMsg) {
            var app = content.getApplication();
            var res = this.filterApplication(app, content, rMsg);
            if (res) {
                return res
            }
            var mod = content.getModule();
            var handler = this.fetchHandler(mod, content, rMsg);
            if (!handler) {
                return null
            }
            var act = rMsg.getAction();
            var sender = rMsg.getSender();
            return handler.handleAction(act, sender, content, rMsg)
        }, filterApplication: function (app, content, rMsg) {
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Customized content (app: ${app}) not support yet!',
                'replacements': {'app': app}
            })
        }, fetchHandler: function (mod, content, rMsg) {
            return this
        }, handleAction: function (act, sender, content, rMsg) {
            var app = content.getApplication();
            var mod = content.getModule();
            var text = 'Content not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Customized content (app: ${app}, mod: ${mod}, act: ${act}) not support yet!',
                'replacements': {'app': app, 'mod': mod, 'act': act}
            })
        }
    });
    ns.cpu.CustomizedContentHandler = CustomizedContentHandler;
    ns.cpu.CustomizedContentProcessor = CustomizedContentProcessor
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ContentType = ns.protocol.ContentType;
    var Command = ns.protocol.Command;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var TwinsHelper = ns.TwinsHelper;
    var ContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    Class(ContentProcessorCreator, TwinsHelper, [ContentProcessor.Creator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (ContentType.FORWARD.equals(type)) {
                return new ns.cpu.ForwardContentProcessor(facebook, messenger)
            }
            if (ContentType.ARRAY.equals(type)) {
                return new ns.cpu.ArrayContentProcessor(facebook, messenger)
            }
            if (ContentType.COMMAND.equals(type)) {
                return new ns.cpu.BaseCommandProcessor(facebook, messenger)
            }
            return null
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            if (cmd === Command.META) {
                return new ns.cpu.MetaCommandProcessor(facebook, messenger)
            } else if (cmd === Command.DOCUMENT) {
                return new ns.cpu.DocumentCommandProcessor(facebook, messenger)
            }
            return null
        }
    });
    ns.cpu.ContentProcessorCreator = ContentProcessorCreator
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "document", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "bot", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    var AddressNameService = Interface(null, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function (name) {
        throw new Error('AddressNameService::isReserved: ' + name);
    };
    AddressNameService.prototype.getIdentifier = function (name) {
        throw new Error('AddressNameService::getIdentifier: ' + name);
    };
    AddressNameService.prototype.getNames = function (identifier) {
        throw new Error('AddressNameService::getNames: ' + identifier);
    };
    ns.AddressNameService = AddressNameService
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Entity = ns.mkm.Entity;
    var FrequencyChecker = ns.utils.FrequencyChecker;
    var RecentTimeChecker = ns.utils.RecentTimeChecker;
    var Archivist = function (lifeSpan) {
        Object.call(this);
        this.__metaQueries = new FrequencyChecker(lifeSpan);
        this.__docsQueries = new FrequencyChecker(lifeSpan);
        this.__membersQueries = new FrequencyChecker(lifeSpan);
        this.__lastDocumentTimes = new RecentTimeChecker();
        this.__lastHistoryTimes = new RecentTimeChecker()
    };
    Class(Archivist, Object, [Entity.DataSource], null);
    Archivist.kQueryExpires = 600.0;
    Archivist.prototype.isMetaQueryExpired = function (identifier) {
        return this.__metaQueries.isExpired(identifier)
    };
    Archivist.prototype.isDocumentQueryExpired = function (identifier) {
        return this.__docsQueries.isExpired(identifier)
    };
    Archivist.prototype.isMembersQueryExpired = function (identifier) {
        return this.__membersQueries.isExpired(identifier)
    };
    Archivist.prototype.needsQueryMeta = function (identifier, meta) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!meta) {
            return true
        }
        return false
    };
    Archivist.prototype.setLastDocumentTime = function (identifier, lastTime) {
        return this.__lastDocumentTimes.setLastTime(identifier, lastTime)
    };
    Archivist.prototype.needsQueryDocuments = function (identifier, docs) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!docs || docs.length === 0) {
            return true
        }
        var currentTime = this.getLastDocumentTime(identifier, docs);
        return this.__lastDocumentTimes.isExpired(identifier, currentTime)
    };
    Archivist.prototype.getLastDocumentTime = function (identifier, docs) {
        if (!docs || docs.length === 0) {
            return null
        }
        var docTime, lastTime = null;
        for (var i = 0; i < docs.length; ++i) {
            docTime = docs[i].getTime();
            if (!docTime) {
            } else if (!lastTime || lastTime.getTime() < docTime.getTime()) {
                lastTime = docTime
            }
        }
        return lastTime
    };
    Archivist.prototype.setLastGroupHistoryTime = function (identifier, lastTime) {
        return this.__lastHistoryTimes.setLastTime(identifier, lastTime)
    };
    Archivist.prototype.needsQueryMembers = function (identifier, members) {
        if (identifier.isBroadcast()) {
            return false
        } else if (!members || members.length === 0) {
            return true
        }
        var currentTime = this.getLastGroupHistoryTime(identifier);
        return this.__lastHistoryTimes.isExpired(identifier, currentTime)
    };
    Archivist.prototype.getLastGroupHistoryTime = function (identifier) {
        throw new Error('Archivist::getLastGroupHistoryTime: ' + identifier);
    };
    Archivist.prototype.checkMeta = function (identifier, meta) {
        if (this.needsQueryMeta(identifier, meta)) {
            return this.queryMeta(identifier)
        } else {
            return false
        }
    };
    Archivist.prototype.checkDocuments = function (identifier, docs) {
        if (this.needsQueryDocuments(identifier, docs)) {
            return this.queryDocuments(identifier, docs)
        } else {
            return false
        }
    };
    Archivist.prototype.checkMembers = function (identifier, members) {
        if (this.needsQueryMembers(identifier, members)) {
            if (!this.isMembersQueryExpired(identifier)) {
                return false
            }
            return this.queryMembers(identifier, members)
        } else {
            return false
        }
    };
    Archivist.prototype.queryMeta = function (identifier) {
        throw new Error('Archivist::queryMeta: ' + identifier);
    };
    Archivist.prototype.queryDocuments = function (identifier, docs) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + docs);
    };
    Archivist.prototype.queryMembers = function (identifier, members) {
        throw new Error('Archivist::queryMeta: ' + identifier + ', ' + members);
    };
    Archivist.prototype.saveMeta = function (meta, identifier) {
        throw new Error('Archivist::saveMeta: ' + identifier + ', ' + meta);
    };
    Archivist.prototype.saveDocument = function (doc) {
        throw new Error('Archivist::saveDocument: ' + doc);
    };
    ns.Archivist = Archivist
})(DIMP);
(function (ns) {
    'use strict';
    var Interface = ns.type.Interface;
    var ID = ns.protocol.ID;
    var getDestination = function (receiver, group) {
        if (!group && receiver.isGroup()) {
            group = receiver
        }
        if (!group) {
            return receiver
        }
        if (group.isBroadcast()) {
            return group
        } else if (receiver.isBroadcast()) {
            return receiver
        } else {
            return group
        }
    };
    var CipherKeyDelegate = Interface(null, null);
    CipherKeyDelegate.getDestinationForMessage = function (msg) {
        var group = ID.parse(msg.getValue('group'));
        return getDestination(msg.getReceiver(), group)
    };
    CipherKeyDelegate.getDestination = getDestination;
    CipherKeyDelegate.prototype.getCipherKey = function (sender, receiver, generate) {
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (sender, receiver, key) {
    };
    ns.CipherKeyDelegate = CipherKeyDelegate
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var EntityType = ns.protocol.EntityType;
    var DocumentHelper = ns.mkm.DocumentHelper;
    var BaseUser = ns.mkm.BaseUser;
    var BaseGroup = ns.mkm.BaseGroup;
    var Bot = ns.mkm.Bot;
    var Station = ns.mkm.Station;
    var ServiceProvider = ns.mkm.ServiceProvider;
    var Barrack = ns.Barrack;
    var Facebook = function () {
        Barrack.call(this)
    };
    Class(Facebook, Barrack, null, {
        getArchivist: function () {
            throw new Error('Facebook::getArchivist');
        }, createUser: function (identifier) {
            if (!identifier.isBroadcast()) {
                var pKey = this.getPublicKeyForEncryption(identifier);
                if (!pKey) {
                    return null
                }
            }
            var network = identifier.getType();
            if (EntityType.STATION.equals(network)) {
                return new Station(identifier)
            } else if (EntityType.BOT.equals(network)) {
                return new Bot(identifier)
            }
            return new BaseUser(identifier)
        }, createGroup: function (identifier) {
            if (!identifier.isBroadcast()) {
                var members = this.getMembers(identifier);
                if (!members || members.length === 0) {
                    return null
                }
            }
            var network = identifier.getType();
            if (EntityType.ISP.equals(network)) {
                return new ServiceProvider(identifier)
            }
            return new BaseGroup(identifier)
        }, getLocalUsers: function () {
            throw new Error('Facebook::getLocalUsers');
        }, selectLocalUser: function (receiver) {
            var users = this.getLocalUsers();
            if (!users || users.length === 0) {
                throw new Error("local users should not be empty");
            } else if (receiver.isBroadcast()) {
                return users[0]
            }
            var i, user, uid;
            if (receiver.isGroup()) {
                var members = this.getMembers(receiver);
                if (!members || members.length === 0) {
                    return null
                }
                var j, member;
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    for (j = 0; j < members.length; ++j) {
                        member = members[j];
                        if (member.equals(uid)) {
                            return user
                        }
                    }
                }
            } else {
                for (i = 0; i < users.length; ++i) {
                    user = users[i];
                    uid = user.getIdentifier();
                    if (receiver.equals(uid)) {
                        return user
                    }
                }
            }
            return null
        }, saveMeta: function (meta, identifier) {
            if (meta.isValid() && meta.matchIdentifier(identifier)) {
            } else {
                return false
            }
            var old = this.getMeta(identifier);
            if (old) {
                return true
            }
            var archivist = this.getArchivist();
            return archivist.saveMeta(meta, identifier)
        }, saveDocument: function (doc) {
            var identifier = doc.getIdentifier();
            if (!identifier) {
                return false
            }
            if (!doc.isValid()) {
                var meta = this.getMeta(identifier);
                if (!meta) {
                    return false
                } else if (doc.verify(meta.getPublicKey())) {
                } else {
                    return false
                }
            }
            var type = doc.getType();
            if (!type) {
                type = '*'
            }
            var documents = this.getDocuments(identifier);
            var old = DocumentHelper.lastDocument(documents, type);
            if (old && DocumentHelper.isExpired(doc, old)) {
                return false
            }
            var archivist = this.getArchivist();
            return archivist.saveDocument(doc)
        }, getMeta: function (identifier) {
            var archivist = this.getArchivist();
            var meta = archivist.getMeta(identifier);
            archivist.checkMeta(identifier, meta);
            return meta
        }, getDocuments: function (identifier) {
            var archivist = this.getArchivist();
            var docs = archivist.getDocuments(identifier);
            archivist.checkDocuments(identifier, docs);
            return docs
        }
    });
    ns.Facebook = Facebook
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var InstantMessagePacker = ns.msg.InstantMessagePacker;
    var SecureMessagePacker = ns.msg.SecureMessagePacker;
    var ReliableMessagePacker = ns.msg.ReliableMessagePacker
    var MessageHelper = ns.msg.MessageHelper;
    var TwinsHelper = ns.TwinsHelper;
    var Packer = ns.Packer;
    var MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.instantPacker = new InstantMessagePacker(messenger);
        this.securePacker = new SecureMessagePacker(messenger);
        this.reliablePacker = new ReliableMessagePacker(messenger)
    };
    Class(MessagePacker, TwinsHelper, [Packer], {
        encryptMessage: function (iMsg) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            var sMsg;
            var receiver = iMsg.getReceiver();
            var password = messenger.getEncryptKey(iMsg);
            if (receiver.isGroup()) {
                var members = facebook.getMembers(receiver);
                sMsg = this.instantPacker.encryptMessage(iMsg, password, members)
            } else {
                sMsg = this.instantPacker.encryptMessage(iMsg, password, null)
            }
            if (sMsg == null) {
                return null
            }
            sMsg.getEnvelope().setType(iMsg.getContent().getType());
            return sMsg
        }, signMessage: function (sMsg) {
            return this.securePacker.signMessage(sMsg)
        }, serializeMessage: function (rMsg) {
            var dict = rMsg.toMap();
            var json = ns.format.JSON.encode(dict);
            return ns.format.UTF8.encode(json)
        }, deserializeMessage: function (data) {
            var json = ns.format.UTF8.decode(data);
            if (!json) {
                return null
            }
            var dict = ns.format.JSON.decode(json);
            return ReliableMessage.parse(dict)
        }, checkAttachments: function (rMsg) {
            var sender = rMsg.getSender();
            var facebook = this.getFacebook();
            var meta = MessageHelper.getMeta(rMsg);
            if (meta) {
                facebook.saveMeta(meta, sender)
            }
            var visa = MessageHelper.getVisa(rMsg);
            if (visa) {
                facebook.saveDocument(visa)
            }
            return true
        }, verifyMessage: function (rMsg) {
            if (this.checkAttachments(rMsg)) {
            } else {
                return null
            }
            return this.reliablePacker.verifyMessage(rMsg)
        }, decryptMessage: function (sMsg) {
            var receiver = sMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            if (user == null) {
                throw new ReferenceError('receiver error: $receiver, from ${sMsg.sender}, ${sMsg.group}');
            }
            return this.securePacker.decryptMessage(sMsg, user.getIdentifier());
        }
    });
    ns.MessagePacker = MessagePacker;
})(DIMP);
;(function (ns) {
    'use strict';
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
        }, createCreator: function () {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            return new ns.cpu.ContentProcessorCreator(facebook, messenger);
        }, getProcessor: function (content) {
            return this.__factory.getProcessor(content);
        }, getContentProcessor: function (type) {
            return this.__factory.getContentProcessor(type);
        }, getCommandProcessor: function (type, cmd) {
            return this.__factory.getCommandProcessor(type, cmd);
        }, processPackage: function (data) {
            var messenger = this.getMessenger();
            var rMsg = messenger.deserializeMessage(data);
            if (!rMsg) {
                return [];
            }
            var responses = messenger.processReliableMessage(rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processReliableMessage: function (rMsg) {
            var messenger = this.getMessenger();
            var sMsg = messenger.verifyMessage(rMsg);
            if (!sMsg) {
                return [];
            }
            var responses = messenger.processSecureMessage(sMsg, rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processSecureMessage: function (sMsg, rMsg) {
            var messenger = this.getMessenger();
            var iMsg = messenger.decryptMessage(sMsg);
            if (!iMsg) {
                return [];
            }
            var responses = messenger.processInstantMessage(iMsg, rMsg);
            if (!responses || responses.length === 0) {
                return [];
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
        }, processInstantMessage: function (iMsg, rMsg) {
            var messenger = this.getMessenger();
            var responses = messenger.processContent(iMsg.getContent(), rMsg);
            if (!responses || responses.length === 0) {
                return [];
            }
            var sender = iMsg.getSender();
            var receiver = iMsg.getReceiver();
            var facebook = this.getFacebook();
            var user = facebook.selectLocalUser(receiver);
            if (!user) {
                return [];
            }
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
        }, processContent: function (content, rMsg) {
            var cpu = this.getProcessor(content);
            if (!cpu) {
                cpu = this.getContentProcessor(0);
            }
            return cpu.process(content, rMsg);
        }
    });
    ns.MessageProcessor = MessageProcessor;
})(DIMP);
;(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Packer = ns.Packer;
    var Processor = ns.Processor;
    var CipherKeyDelegate = ns.CipherKeyDelegate;
    var Transceiver = ns.Transceiver;
    var Messenger = function () {
        Transceiver.call(this);
    };
    Class(Messenger, Transceiver, [Packer, Processor], null);
    Messenger.prototype.getCipherKeyDelegate = function () {
        throw new Error('Messenger::getCipherKeyDelegate');
    };
    Messenger.prototype.getPacker = function () {
        throw new Error('Messenger::getPacker');
    };
    Messenger.prototype.getProcessor = function () {
        throw new Error('Messenger::getProcessor');
    };
    Messenger.prototype.getEncryptKey = function (iMsg) {
        var sender = iMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(iMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(sender, target, true);
    };
    Messenger.prototype.getDecryptKey = function (sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.getCipherKey(sender, target, false);
    };
    Messenger.prototype.cacheDecryptKey = function (key, sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var delegate = this.getCipherKeyDelegate();
        return delegate.cacheCipherKey(sender, target, key);
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
    Messenger.prototype.deserializeKey = function (data, sMsg) {
        if (!data) {
            return this.getDecryptKey(sMsg);
        }
        return Transceiver.prototype.deserializeKey.call(this, data, sMsg);
    };
    Messenger.prototype.deserializeContent = function (data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
        } else {
            this.cacheDecryptKey(pwd, sMsg);
        }
        return content;
    };
    ns.Messenger = Messenger;
})(DIMP);
;(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var BaseCommand = ns.dkd.cmd.BaseCommand;
    var BaseHistoryCommand = ns.dkd.cmd.BaseHistoryCommand;
    var BaseGroupCommand = ns.dkd.cmd.BaseGroupCommand;
    var ContentParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(ContentParser, Object, [Content.Factory], null);
    ContentParser.prototype.parseContent = function (content) {
        return new this.__class(content);
    };
    var CommandParser = function (clazz) {
        Object.call(this);
        this.__class = clazz;
    };
    Class(CommandParser, Object, [Command.Factory], null);
    CommandParser.prototype.parseCommand = function (content) {
        return new this.__class(content);
    };
    var GeneralCommandFactory = function () {
        Object.call(this);
    };
    Class(GeneralCommandFactory, Object, [Content.Factory, Command.Factory], null);
    var general_factory = function () {
        var man = ns.dkd.cmd.CommandFactoryManager;
        return man.generalFactory;
    };
    GeneralCommandFactory.prototype.parseContent = function (content) {
        var gf = general_factory();
        var cmd = gf.getCmd(content, '*');
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            if (content['group']) {
                factory = gf.getCommandFactory('group');
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
        var cmd = gf.getCmd(content, '*');
        var factory = gf.getCommandFactory(cmd);
        if (!factory) {
            factory = this;
        }
        return factory.parseCommand(content);
    };
    GroupCommandFactory.prototype.parseCommand = function (cmd) {
        return new BaseGroupCommand(cmd);
    };
    ns.ContentParser = ContentParser;
    ns.CommandParser = CommandParser;
    ns.GeneralCommandFactory = GeneralCommandFactory;
    ns.HistoryCommandFactory = HistoryCommandFactory;
    ns.GroupCommandFactory = GroupCommandFactory;
})(DIMP);
(function (ns) {
    'use strict';
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var SecureMessage = ns.protocol.SecureMessage;
    var ReliableMessage = ns.protocol.ReliableMessage;
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var MessageFactory = ns.msg.MessageFactory;
    var ContentParser = ns.ContentParser;
    var CommandParser = ns.CommandParser;
    var GeneralCommandFactory = ns.GeneralCommandFactory;
    var HistoryCommandFactory = ns.HistoryCommandFactory;
    var GroupCommandFactory = ns.GroupCommandFactory;
    var registerMessageFactories = function () {
        var factory = new MessageFactory();
        Envelope.setFactory(factory);
        InstantMessage.setFactory(factory);
        SecureMessage.setFactory(factory);
        ReliableMessage.setFactory(factory);
    };
    var registerContentFactories = function () {
        Content.setFactory(ContentType.TEXT, new ContentParser(ns.dkd.BaseTextContent));
        Content.setFactory(ContentType.FILE, new ContentParser(ns.dkd.BaseFileContent));
        Content.setFactory(ContentType.IMAGE, new ContentParser(ns.dkd.ImageFileContent));
        Content.setFactory(ContentType.AUDIO, new ContentParser(ns.dkd.AudioFileContent));
        Content.setFactory(ContentType.VIDEO, new ContentParser(ns.dkd.VideoFileContent));
        Content.setFactory(ContentType.PAGE, new ContentParser(ns.dkd.WebPageContent));
        Content.setFactory(ContentType.NAME_CARD, new ContentParser(ns.dkd.NameCardContent));
        Content.setFactory(ContentType.MONEY, new ContentParser(ns.dkd.BaseMoneyContent));
        Content.setFactory(ContentType.TRANSFER, new ContentParser(ns.dkd.TransferMoneyContent));
        Content.setFactory(ContentType.COMMAND, new GeneralCommandFactory());
        Content.setFactory(ContentType.HISTORY, new HistoryCommandFactory());
        Content.setFactory(ContentType.ARRAY, new ContentParser(ns.dkd.ListContent));
        Content.setFactory(ContentType.FORWARD, new ContentParser(ns.dkd.SecretContent));
        Content.setFactory(0, new ContentParser(ns.dkd.BaseContent));
    };
    var registerCommandFactories = function () {
        Command.setFactory(Command.META, new CommandParser(ns.dkd.cmd.BaseMetaCommand));
        Command.setFactory(Command.DOCUMENT, new CommandParser(ns.dkd.cmd.BaseDocumentCommand));
        Command.setFactory(Command.RECEIPT, new CommandParser(ns.dkd.cmd.BaseReceiptCommand));
        Command.setFactory('group', new GroupCommandFactory());
        Command.setFactory(GroupCommand.INVITE, new CommandParser(ns.dkd.cmd.InviteGroupCommand));
        Command.setFactory(GroupCommand.EXPEL, new CommandParser(ns.dkd.cmd.ExpelGroupCommand));
        Command.setFactory(GroupCommand.JOIN, new CommandParser(ns.dkd.cmd.JoinGroupCommand));
        Command.setFactory(GroupCommand.QUIT, new CommandParser(ns.dkd.cmd.QuitGroupCommand));
        Command.setFactory(GroupCommand.QUERY, new CommandParser(ns.dkd.cmd.QueryGroupCommand));
        Command.setFactory(GroupCommand.RESET, new CommandParser(ns.dkd.cmd.ResetGroupCommand));
        Command.setFactory(GroupCommand.HIRE, new CommandParser(ns.dkd.cmd.HireGroupCommand));
        Command.setFactory(GroupCommand.FIRE, new CommandParser(ns.dkd.cmd.FireGroupCommand));
        Command.setFactory(GroupCommand.RESIGN, new CommandParser(ns.dkd.cmd.ResignGroupCommand))
    };
    var registerAllFactories = function () {
        registerMessageFactories();
        registerContentFactories();
        registerCommandFactories();
        Content.setFactory(ContentType.CUSTOMIZED, new ContentParser(ns.dkd.AppCustomizedContent));
        Content.setFactory(ContentType.APPLICATION, new ContentParser(ns.dkd.AppCustomizedContent))
    };
    ns.registerMessageFactories = registerMessageFactories;
    ns.registerContentFactories = registerContentFactories;
    ns.registerCommandFactories = registerCommandFactories;
    ns.registerAllFactories = registerAllFactories
})(DIMP);
