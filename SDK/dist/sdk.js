/**
 *  DIM-SDK (v2.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Aug. 23, 2025
 * @copyright (c) 2020-2025 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (sdk, dkd, mkm, mk) {
    if (typeof sdk.msg !== 'object') {
        sdk.msg = {}
    }
    if (typeof sdk.core !== 'object') {
        sdk.core = {}
    }
    if (typeof sdk.cpu !== 'object') {
        sdk.cpu = {}
    }
    var Interface = mk.type.Interface;
    var Class = mk.type.Class;
    var Converter = mk.type.Converter;
    var Wrapper = mk.type.Wrapper;
    var Mapper = mk.type.Mapper;
    var Stringer = mk.type.Stringer;
    var IObject = mk.type.Object;
    var BaseObject = mk.type.BaseObject;
    var ConstantString = mk.type.ConstantString;
    var Dictionary = mk.type.Dictionary;
    var Arrays = mk.type.Arrays;
    var StringCoder = mk.format.StringCoder;
    var UTF8 = mk.format.UTF8;
    var ObjectCoder = mk.format.ObjectCoder;
    var JSONMap = mk.format.JSONMap;
    var DataCoder = mk.format.DataCoder;
    var Base58 = mk.format.Base58;
    var Base64 = mk.format.Base64;
    var Hex = mk.format.Hex;
    var BaseDataWrapper = mk.format.BaseDataWrapper;
    var BaseFileWrapper = mk.format.BaseFileWrapper;
    var MessageDigester = mk.digest.MessageDigester;
    var SHA256 = mk.digest.SHA256;
    var RIPEMD160 = mk.digest.RIPEMD160;
    var KECCAK256 = mk.digest.KECCAK256;
    var EncodeAlgorithms = mk.protocol.EncodeAlgorithms;
    var TransportableData = mk.protocol.TransportableData;
    var PortableNetworkFile = mk.protocol.PortableNetworkFile;
    var SymmetricAlgorithms = mk.protocol.SymmetricAlgorithms;
    var AsymmetricAlgorithms = mk.protocol.AsymmetricAlgorithms;
    var EncryptKey = mk.protocol.EncryptKey;
    var DecryptKey = mk.protocol.DecryptKey;
    var VerifyKey = mk.protocol.VerifyKey;
    var SymmetricKey = mk.protocol.SymmetricKey;
    var SymmetricKeyFactory = mk.protocol.SymmetricKey.Factory;
    var AsymmetricKey = mk.protocol.AsymmetricKey;
    var PublicKey = mk.protocol.PublicKey;
    var PublicKeyFactory = mk.protocol.PublicKey.Factory;
    var PrivateKey = mk.protocol.PrivateKey;
    var PrivateKeyFactory = mk.protocol.PrivateKey.Factory;
    var BaseSymmetricKey = mk.crypto.BaseSymmetricKey;
    var BasePublicKey = mk.crypto.BasePublicKey;
    var BasePrivateKey = mk.crypto.BasePrivateKey;
    var GeneralCryptoHelper = mk.ext.GeneralCryptoHelper;
    var SymmetricKeyHelper = mk.ext.SymmetricKeyHelper;
    var PrivateKeyHelper = mk.ext.PrivateKeyHelper;
    var PublicKeyHelper = mk.ext.PublicKeyHelper;
    var GeneralFormatHelper = mk.ext.GeneralFormatHelper;
    var PortableNetworkFileHelper = mk.ext.PortableNetworkFileHelper;
    var TransportableDataHelper = mk.ext.TransportableDataHelper;
    var SharedCryptoExtensions = mk.ext.SharedCryptoExtensions;
    var SharedFormatExtensions = mk.ext.SharedFormatExtensions;
    var EntityType = mkm.protocol.EntityType;
    var Address = mkm.protocol.Address;
    var AddressFactory = mkm.protocol.Address.Factory;
    var ID = mkm.protocol.ID;
    var IDFactory = mkm.protocol.ID.Factory;
    var Meta = mkm.protocol.Meta;
    var MetaFactory = mkm.protocol.Meta.Factory;
    var Document = mkm.protocol.Document;
    var DocumentFactory = mkm.protocol.Document.Factory;
    var Visa = mkm.protocol.Visa;
    var Bulletin = mkm.protocol.Bulletin;
    var MetaType = mkm.protocol.MetaType;
    var DocumentType = mkm.protocol.DocumentType;
    var Identifier = mkm.mkm.Identifier;
    var BaseMeta = mkm.mkm.BaseMeta;
    var BaseDocument = mkm.mkm.BaseDocument;
    var BaseBulletin = mkm.mkm.BaseBulletin;
    var BaseVisa = mkm.mkm.BaseVisa;
    var GeneralAccountHelper = mkm.ext.GeneralAccountHelper;
    var AddressHelper = mkm.ext.AddressHelper;
    var IdentifierHelper = mkm.ext.IdentifierHelper;
    var MetaHelper = mkm.ext.MetaHelper;
    var DocumentHelper = mkm.ext.DocumentHelper;
    var SharedAccountExtensions = mkm.ext.SharedAccountExtensions;
    var InstantMessage = dkd.protocol.InstantMessage;
    var InstantMessageFactory = dkd.protocol.InstantMessage.Factory;
    var SecureMessage = dkd.protocol.SecureMessage;
    var SecureMessageFactory = dkd.protocol.SecureMessage.Factory;
    var ReliableMessage = dkd.protocol.ReliableMessage;
    var ReliableMessageFactory = dkd.protocol.ReliableMessage.Factory;
    var Envelope = dkd.protocol.Envelope;
    var EnvelopeFactory = dkd.protocol.Envelope.Factory;
    var Content = dkd.protocol.Content;
    var ContentFactory = dkd.protocol.Content.Factory;
    var Command = dkd.protocol.Command;
    var CommandFactory = dkd.protocol.Command.Factory;
    var ContentType = dkd.protocol.ContentType;
    var ForwardContent = dkd.protocol.ForwardContent;
    var ArrayContent = dkd.protocol.ArrayContent;
    var MetaCommand = dkd.protocol.MetaCommand;
    var DocumentCommand = dkd.protocol.DocumentCommand;
    var GroupCommand = dkd.protocol.GroupCommand;
    var ReceiptCommand = dkd.protocol.ReceiptCommand;
    var MessageEnvelope = dkd.msg.MessageEnvelope;
    var BaseMessage = dkd.msg.BaseMessage;
    var PlainMessage = dkd.msg.PlainMessage;
    var EncryptedMessage = dkd.msg.EncryptedMessage;
    var NetworkMessage = dkd.msg.NetworkMessage;
    var BaseContent = dkd.dkd.BaseContent;
    var BaseTextContent = dkd.dkd.BaseTextContent;
    var BaseFileContent = dkd.dkd.BaseFileContent;
    var ImageFileContent = dkd.dkd.ImageFileContent;
    var AudioFileContent = dkd.dkd.AudioFileContent;
    var VideoFileContent = dkd.dkd.VideoFileContent;
    var WebPageContent = dkd.dkd.WebPageContent;
    var NameCardContent = dkd.dkd.NameCardContent;
    var BaseQuoteContent = dkd.dkd.BaseQuoteContent;
    var BaseMoneyContent = dkd.dkd.BaseMoneyContent;
    var TransferMoneyContent = dkd.dkd.TransferMoneyContent;
    var ListContent = dkd.dkd.ListContent;
    var CombineForwardContent = dkd.dkd.CombineForwardContent;
    var SecretContent = dkd.dkd.SecretContent;
    var AppCustomizedContent = dkd.dkd.AppCustomizedContent;
    var BaseCommand = dkd.dkd.BaseCommand;
    var BaseMetaCommand = dkd.dkd.BaseMetaCommand;
    var BaseDocumentCommand = dkd.dkd.BaseDocumentCommand;
    var BaseReceiptCommand = dkd.dkd.BaseReceiptCommand;
    var BaseHistoryCommand = dkd.dkd.BaseHistoryCommand;
    var BaseGroupCommand = dkd.dkd.BaseGroupCommand;
    var InviteGroupCommand = dkd.dkd.InviteGroupCommand;
    var ExpelGroupCommand = dkd.dkd.ExpelGroupCommand;
    var JoinGroupCommand = dkd.dkd.JoinGroupCommand;
    var QuitGroupCommand = dkd.dkd.QuitGroupCommand;
    var ResetGroupCommand = dkd.dkd.ResetGroupCommand;
    var HireGroupCommand = dkd.dkd.HireGroupCommand;
    var FireGroupCommand = dkd.dkd.FireGroupCommand;
    var ResignGroupCommand = dkd.dkd.ResignGroupCommand;
    var GeneralMessageHelper = dkd.ext.GeneralMessageHelper;
    var ContentHelper = dkd.ext.ContentHelper;
    var EnvelopeHelper = dkd.ext.EnvelopeHelper;
    var InstantMessageHelper = dkd.ext.InstantMessageHelper;
    var SecureMessageHelper = dkd.ext.SecureMessageHelper;
    var ReliableMessageHelper = dkd.ext.ReliableMessageHelper;
    var GeneralCommandHelper = dkd.ext.GeneralCommandHelper;
    var CommandHelper = dkd.ext.CommandHelper;
    var SharedCommandExtensions = dkd.ext.SharedCommandExtensions;
    var SharedMessageExtensions = dkd.ext.SharedMessageExtensions;
    mkm.mkm.MetaUtils = {
        matchIdentifier: function (identifier, meta) {
            if (!meta.isValid()) {
                return false
            }
            var seed = meta.getSeed();
            var name = identifier.getName();
            if (seed !== name) {
                return false
            }
            var old = identifier.getAddress();
            var gen = Address.generate(meta, old.getType());
            return old.equals(gen)
        }, matchPublicKey: function (pKey, meta) {
            if (!meta.isValid()) {
                return false
            }
            if (meta.getPublicKey().equals(pKey)) {
                return true
            }
            var seed = meta.getSeed();
            if (!seed) {
                return false
            }
            var fingerprint = meta.getFingerprint();
            if (!fingerprint) {
                return false
            }
            var data = UTF8.encode(seed);
            return pKey.verify(data, fingerprint)
        }
    };
    var MetaUtils = mkm.mkm.MetaUtils;
    mkm.mkm.DocumentUtils = {
        getDocumentType: function (document) {
            var helper = SharedAccountExtensions.getHelper();
            return helper.getDocumentType(document.toMap(), null)
        }, isBefore: function (oldTime, thisTime) {
            if (!oldTime || !thisTime) {
                return false
            }
            return thisTime.getTime() < oldTime.getTime()
        }, isExpired: function (thisDoc, oldDoc) {
            var thisTime = thisDoc.getTime();
            var oldTime = oldDoc.getTime();
            return this.isBefore(oldTime, thisTime)
        }, lastDocument: function (documents, type) {
            if (!documents || documents.length === 0) {
                return null
            } else if (!type || type === '*') {
                type = ''
            }
            var checkType = type.length > 0;
            var last = null;
            var doc, docType, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                if (checkType) {
                    docType = this.getDocumentType(doc);
                    matched = !docType || docType.length === 0 || docType === type;
                    if (!matched) {
                        continue
                    }
                }
                if (last != null && this.isExpired(doc, last)) {
                    continue
                }
                last = doc
            }
            return last
        }, lastVisa: function (documents) {
            if (!documents || documents.length === 0) {
                return null
            }
            var last = null;
            var doc, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                matched = Interface.conforms(doc, Visa);
                if (!matched) {
                    continue
                }
                if (last != null && this.isExpired(doc, last)) {
                    continue
                }
                last = doc
            }
            return last
        }, lastBulletin: function (documents) {
            if (!documents || documents.length === 0) {
                return null
            }
            var last = null;
            var doc, matched;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                matched = Interface.conforms(doc, Bulletin);
                if (!matched) {
                    continue
                }
                if (last != null && this.isExpired(doc, last)) {
                    continue
                }
                last = doc
            }
            return last
        }
    };
    var DocumentUtils = mkm.mkm.DocumentUtils;
    mkm.mkm.Entity = Interface(null, [IObject]);
    var Entity = mkm.mkm.Entity;
    Entity.prototype.getIdentifier = function () {
    };
    Entity.prototype.getType = function () {
    };
    Entity.prototype.getMeta = function () {
    };
    Entity.prototype.getDocuments = function () {
    };
    Entity.prototype.setDataSource = function (barrack) {
    };
    Entity.prototype.getDataSource = function () {
    };
    Entity.DataSource = Interface(null, null);
    var EntityDataSource = Entity.DataSource;
    EntityDataSource.prototype.getMeta = function (identifier) {
    };
    EntityDataSource.prototype.getDocuments = function (identifier) {
    };
    Entity.Delegate = Interface(null, null);
    var EntityDelegate = Entity.Delegate;
    EntityDelegate.prototype.getUser = function (identifier) {
    };
    EntityDelegate.prototype.getGroup = function (identifier) {
    };
    mkm.mkm.BaseEntity = function (identifier) {
        BaseObject.call(this);
        this.__identifier = identifier;
        this.__facebook = null
    };
    var BaseEntity = mkm.mkm.BaseEntity;
    Class(BaseEntity, BaseObject, [Entity], null);
    BaseEntity.prototype.equals = function (other) {
        if (this === other) {
            return true
        } else if (!other) {
            return false
        } else if (Interface.conforms(other, Entity)) {
            other = other.getIdentifier()
        }
        return this.__identifier.equals(other)
    };
    BaseEntity.prototype.valueOf = function () {
        return this.toString()
    };
    BaseEntity.prototype.toString = function () {
        var clazz = this.getClassName();
        var id = this.__identifier;
        var network = id.getAddress().getType();
        return '<' + clazz + ' id="' + id.toString() + '" network="' + network + '" />'
    };
    BaseEntity.prototype.getClassName = function () {
        return Object.getPrototypeOf(this).constructor.name
    };
    BaseEntity.prototype.setDataSource = function (facebook) {
        this.__facebook = facebook
    };
    BaseEntity.prototype.getDataSource = function () {
        return this.__facebook
    };
    BaseEntity.prototype.getIdentifier = function () {
        return this.__identifier
    };
    BaseEntity.prototype.getType = function () {
        return this.__identifier.getType()
    };
    BaseEntity.prototype.getMeta = function () {
        var facebook = this.getDataSource();
        return facebook.getMeta(this.__identifier)
    };
    BaseEntity.prototype.getDocuments = function () {
        var facebook = this.getDataSource();
        return facebook.getDocuments(this.__identifier)
    };
    mkm.mkm.Group = Interface(null, [Entity]);
    var Group = mkm.mkm.Group;
    Group.prototype.getBulletin = function () {
    };
    Group.prototype.getFounder = function () {
    };
    Group.prototype.getOwner = function () {
    };
    Group.prototype.getMembers = function () {
    };
    Group.prototype.getAssistants = function () {
    };
    Group.DataSource = Interface(null, [EntityDataSource]);
    var GroupDataSource = Group.DataSource;
    GroupDataSource.prototype.getFounder = function (identifier) {
    };
    GroupDataSource.prototype.getOwner = function (identifier) {
    };
    GroupDataSource.prototype.getMembers = function (identifier) {
    };
    GroupDataSource.prototype.getAssistants = function (identifier) {
    };
    mkm.mkm.BaseGroup = function (identifier) {
        BaseEntity.call(this, identifier);
        this.__founder = null
    };
    var BaseGroup = mkm.mkm.BaseGroup;
    Class(BaseGroup, BaseEntity, [Group], {
        getBulletin: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastBulletin(docs)
        }, getFounder: function () {
            var founder = this.__founder;
            if (!founder) {
                var facebook = this.getDataSource();
                var group = this.getIdentifier();
                founder = facebook.getFounder(group);
                this.__founder = founder
            }
            return founder
        }, getOwner: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getOwner(group)
        }, getMembers: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getMembers(group)
        }, getAssistants: function () {
            var facebook = this.getDataSource();
            var group = this.getIdentifier();
            return facebook.getAssistants(group)
        }
    });
    mkm.mkm.User = Interface(null, [Entity]);
    var User = mkm.mkm.User;
    User.prototype.getVisa = function () {
    };
    User.prototype.getContacts = function () {
    };
    User.prototype.verify = function (data, signature) {
    };
    User.prototype.encrypt = function (plaintext) {
    };
    User.prototype.sign = function (data) {
    };
    User.prototype.decrypt = function (ciphertext) {
    };
    User.prototype.signVisa = function (doc) {
    };
    User.prototype.verifyVisa = function (doc) {
    };
    User.DataSource = Interface(null, [EntityDataSource]);
    var UserDataSource = User.DataSource;
    UserDataSource.prototype.getContacts = function (identifier) {
    };
    UserDataSource.prototype.getPublicKeyForEncryption = function (identifier) {
    };
    UserDataSource.prototype.getPublicKeysForVerification = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeysForDecryption = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeyForSignature = function (identifier) {
    };
    UserDataSource.prototype.getPrivateKeyForVisaSignature = function (identifier) {
    };
    mkm.mkm.BaseUser = function (identifier) {
        BaseEntity.call(this, identifier)
    };
    var BaseUser = mkm.mkm.BaseUser;
    Class(BaseUser, BaseEntity, [User], {
        getVisa: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastVisa(docs)
        }, getContacts: function () {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            return facebook.getContacts(user)
        }, verify: function (data, signature) {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var keys = facebook.getPublicKeysForVerification(user);
            for (var i = 0; i < keys.length; ++i) {
                if (keys[i].verify(data, signature)) {
                    return true
                }
            }
            return false
        }, encrypt: function (plaintext) {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var pKey = facebook.getPublicKeyForEncryption(user);
            return pKey.encrypt(plaintext, null)
        }, sign: function (data) {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var sKey = facebook.getPrivateKeyForSignature(user);
            return sKey.sign(data)
        }, decrypt: function (ciphertext) {
            var facebook = this.getDataSource();
            var user = this.getIdentifier();
            var keys = facebook.getPrivateKeysForDecryption(user);
            var plaintext;
            for (var i = 0; i < keys.length; ++i) {
                plaintext = keys[i].decrypt(ciphertext, null);
                if (plaintext && plaintext.length > 0) {
                    return plaintext
                }
            }
            return null
        }, signVisa: function (doc) {
            var did = doc.getIdentifier();
            var facebook = this.getDataSource();
            var sKey = facebook.getPrivateKeyForVisaSignature(did);
            var sig = doc.sign(sKey);
            if (!sig) {
                return null
            }
            return doc
        }, verifyVisa: function (doc) {
            var did = doc.getIdentifier();
            if (!this.getIdentifier().equals(did)) {
                return false
            }
            var meta = this.getMeta();
            var pKey = meta.getPublicKey();
            return doc.verify(pKey)
        }
    });
    mkm.mkm.Bot = function (identifier) {
        BaseUser.call(this, identifier)
    };
    var Bot = mkm.mkm.Bot;
    Class(Bot, BaseUser, null, {
        getProfile: function () {
            return this.getVisa()
        }, getProvider: function () {
            var doc = this.getProfile();
            if (doc) {
                var icp = doc.getProperty('provider');
                return ID.parse(icp)
            }
            return null
        }
    });
    mkm.mkm.Station = function () {
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
    var Station = mkm.mkm.Station;
    Class(Station, BaseObject, [User], {
        equals: function (other) {
            if (this === other) {
                return true
            } else if (!other) {
                return false
            } else if (other instanceof Station) {
                return ServiceProvider.sameStation(other, this)
            }
            return this.__user.equals(other)
        }, valueOf: function () {
            return this.getString()
        }, toString: function () {
            var clazz = this.getClassName();
            var id = this.getIdentifier();
            var network = id.getAddress().getType();
            return '<' + clazz + ' id="' + id.toString() + '" network="' + network + '" host="' + this.getHost() + '" port=' + this.getPort() + ' />'
        }, getClassName: function () {
            return Object.getPrototypeOf(this).constructor.name
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
            var facebook = this.getDataSource();
            var user = new BaseUser(identifier);
            user.setDataSource(facebook);
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
            return DocumentUtils.lastDocument(docs, '*')
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
                var isp = doc.getProperty('provider');
                isp = ID.parse(isp);
                if (isp) {
                    this.__isp = isp
                }
            }
        }
    });
    Station.ANY = Identifier.create('station', Address.ANYWHERE, null);
    Station.EVERY = Identifier.create('stations', Address.EVERYWHERE, null);
    mkm.mkm.ServiceProvider = function (identifier) {
        BaseGroup.call(this, identifier)
    };
    var ServiceProvider = mkm.mkm.ServiceProvider;
    Class(ServiceProvider, BaseGroup, null, {
        getProfile: function () {
            var docs = this.getDocuments();
            return DocumentUtils.lastDocument(docs, '*')
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
    sdk.msg.MessageUtils = {
        setMeta: function (meta, msg) {
            msg.setMap('meta', meta)
        }, getMeta: function (msg) {
            var meta = msg.getValue('meta');
            return Meta.parse(meta)
        }, setVisa: function (visa, msg) {
            msg.setMap('visa', visa)
        }, getVisa: function (msg) {
            var visa = msg.getValue('visa');
            var doc = Document.parse(visa);
            if (Interface.conforms(doc, Visa)) {
                return doc
            }
            return null
        }
    };
    var MessageUtils = sdk.msg.MessageUtils;
    InstantMessage.Delegate = Interface(null, null);
    var InstantMessageDelegate = InstantMessage.Delegate;
    InstantMessageDelegate.prototype.serializeContent = function (content, pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.encryptContent = function (data, pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.serializeKey = function (pwd, iMsg) {
    };
    InstantMessageDelegate.prototype.encryptKey = function (data, receiver, iMsg) {
    };
    SecureMessage.Delegate = Interface(null, null);
    var SecureMessageDelegate = SecureMessage.Delegate;
    SecureMessageDelegate.prototype.decryptKey = function (data, receiver, sMsg) {
    };
    SecureMessageDelegate.prototype.deserializeKey = function (data, sMsg) {
    };
    SecureMessageDelegate.prototype.decryptContent = function (data, pwd, sMsg) {
    };
    SecureMessageDelegate.prototype.deserializeContent = function (data, pwd, sMsg) {
    };
    SecureMessageDelegate.prototype.signData = function (data, sMsg) {
    };
    ReliableMessage.Delegate = Interface(null, null);
    var ReliableMessageDelegate = ReliableMessage.Delegate;
    ReliableMessageDelegate.prototype.verifyDataSignature = function (data, signature, rMsg) {
    };
    InstantMessage.Packer = function (messenger) {
        BaseObject.call(this);
        this.__messenger = messenger
    };
    var InstantMessagePacker = InstantMessage.Packer;
    Class(InstantMessagePacker, BaseObject, null, null);
    InstantMessagePacker.prototype.getDelegate = function () {
        return this.__messenger
    };
    InstantMessagePacker.prototype.encryptMessage = function (iMsg, password, members) {
        var transceiver = this.getDelegate();
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
                    continue
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
    SecureMessage.Packer = function (messenger) {
        BaseObject.call(this);
        this.__messenger = messenger
    };
    var SecureMessagePacker = SecureMessage.Packer;
    Class(SecureMessagePacker, BaseObject, null, null);
    SecureMessagePacker.prototype.getDelegate = function () {
        return this.__messenger
    };
    SecureMessagePacker.prototype.decryptMessage = function (sMsg, receiver) {
        var transceiver = this.getDelegate();
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
        var transceiver = this.getDelegate();
        var ciphertext = sMsg.getData();
        var signature = transceiver.signData(ciphertext, sMsg);
        var base64 = TransportableData.encode(signature);
        var info = sMsg.copyMap(false);
        info['signature'] = base64;
        return ReliableMessage.parse(info)
    };
    ReliableMessage.Packer = function (messenger) {
        BaseObject.call(this);
        this.__messenger = messenger
    };
    var ReliableMessagePacker = ReliableMessage.Packer;
    Class(ReliableMessagePacker, BaseObject, null, null);
    ReliableMessagePacker.prototype.getDelegate = function () {
        return this.__messenger
    };
    ReliableMessagePacker.prototype.verifyMessage = function (rMsg) {
        var transceiver = this.getDelegate();
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
    sdk.cpu.ContentProcessor = Interface(null, null);
    var ContentProcessor = sdk.cpu.ContentProcessor;
    ContentProcessor.prototype.processContent = function (content, rMsg) {
    };
    ContentProcessor.Creator = Interface(null, null);
    var ContentProcessorCreator = ContentProcessor.Creator;
    ContentProcessorCreator.prototype.createContentProcessor = function (type) {
    };
    ContentProcessorCreator.prototype.createCommandProcessor = function (type, cmd) {
    };
    ContentProcessor.Factory = Interface(null, null);
    var ContentProcessorFactory = ContentProcessor.Factory;
    ContentProcessorFactory.prototype.getContentProcessor = function (content) {
    };
    ContentProcessorFactory.prototype.getContentProcessorForType = function (type) {
    };
    sdk.cpu.GeneralContentProcessorFactory = function (creator) {
        BaseObject.call(this);
        this.__creator = creator;
        this.__content_processors = {}
        this.__command_processors = {}
    };
    var GeneralContentProcessorFactory = sdk.cpu.GeneralContentProcessorFactory;
    Class(GeneralContentProcessorFactory, BaseObject, [ContentProcessorFactory], null);
    GeneralContentProcessorFactory.prototype.getContentProcessor = function (content) {
        var cpu;
        var type = content.getType();
        if (Interface.conforms(content, Command)) {
            var cmd = content.getCmd();
            cpu = this.getCommandProcessor(type, cmd);
            if (cpu) {
                return cpu
            } else if (Interface.conforms(content, GroupCommand)) {
                cpu = this.getCommandProcessor(type, 'group');
                if (cpu) {
                    return cpu
                }
            }
        }
        return this.getContentProcessorForType(type)
    };
    GeneralContentProcessorFactory.prototype.getContentProcessorForType = function (type) {
        var cpu = this.__content_processors[type];
        if (!cpu) {
            cpu = this.__creator.createContentProcessor(type);
            if (cpu) {
                this.__content_processors[type] = cpu
            }
        }
        return cpu
    };
    GeneralContentProcessorFactory.prototype.getCommandProcessor = function (type, cmd) {
        var cpu = this.__command_processors[cmd];
        if (!cpu) {
            cpu = this.__creator.createCommandProcessor(type, cmd);
            if (cpu) {
                this.__command_processors[cmd] = cpu
            }
        }
        return cpu
    };
    sdk.core.Barrack = function () {
        BaseObject.call(this)
    };
    var Barrack = sdk.core.Barrack;
    Class(Barrack, BaseObject, null, null);
    Barrack.prototype.cacheUser = function (user) {
    };
    Barrack.prototype.cacheGroup = function (group) {
    };
    Barrack.prototype.getUser = function (identifier) {
    };
    Barrack.prototype.getGroup = function (identifier) {
    };
    Barrack.prototype.createUser = function (identifier) {
        var network = identifier.getType();
        if (EntityType.STATION.equals(network)) {
            return new Station(identifier)
        } else if (EntityType.BOT.equals(network)) {
            return new Bot(identifier)
        }
        return new BaseUser(identifier)
    };
    Barrack.prototype.createGroup = function (identifier) {
        var network = identifier.getType();
        if (EntityType.ISP.equals(network)) {
            return new ServiceProvider(identifier)
        }
        return new BaseGroup(identifier)
    };
    sdk.core.Archivist = Interface(null, null);
    var Archivist = sdk.core.Archivist;
    Archivist.prototype.saveMeta = function (meta, identifier) {
    };
    Archivist.prototype.saveDocument = function (doc) {
    };
    Archivist.prototype.getMetaKey = function (identifier) {
    };
    Archivist.prototype.getVisaKey = function (identifier) {
    };
    Archivist.prototype.getLocalUsers = function () {
    };
    sdk.core.Shortener = Interface(null, null);
    var Shortener = sdk.core.Shortener;
    Shortener.prototype.compressContent = function (content) {
    };
    Shortener.prototype.extractContent = function (content) {
    };
    Shortener.prototype.compressSymmetricKey = function (key) {
    };
    Shortener.prototype.extractSymmetricKey = function (key) {
    };
    Shortener.prototype.compressReliableMessage = function (msg) {
    };
    Shortener.prototype.extractReliableMessage = function (msg) {
    };
    sdk.core.MessageShortener = function () {
        BaseObject.call(this)
    };
    var MessageShortener = sdk.core.MessageShortener;
    Class(MessageShortener, BaseObject, [Shortener], null);
    MessageShortener.prototype.moveKey = function (from, to, info) {
        var value = info[from];
        if (value) {
            delete info[from];
            info[to] = value
        }
    };
    MessageShortener.prototype.shortenKeys = function (keys, info) {
        for (var i = 1; i < keys.length; i += 2) {
            this.moveKey(keys[i], keys[i - 1], info)
        }
    };
    MessageShortener.prototype.restoreKeys = function (keys, info) {
        for (var i = 1; i < keys.length; i += 2) {
            this.moveKey(keys[i - 1], keys[i], info)
        }
    };
    MessageShortener.prototype.contentShortKeys = ["T", "type", "N", "sn", "W", "time", "G", "group", "C", "command"];
    MessageShortener.prototype.compressContent = function (content) {
        this.shortenKeys(this.contentShortKeys, content);
        return content
    };
    MessageShortener.prototype.extractContent = function (content) {
        this.restoreKeys(this.contentShortKeys, content);
        return content
    };
    MessageShortener.prototype.cryptoShortKeys = ["A", "algorithm", "D", "data", "I", "iv"];
    MessageShortener.prototype.compressSymmetricKey = function (key) {
        this.shortenKeys(this.cryptoShortKeys, key);
        return key
    };
    MessageShortener.prototype.extractSymmetricKey = function (key) {
        this.restoreKeys(this.cryptoShortKeys, key);
        return key
    };
    MessageShortener.prototype.messageShortKeys = ["F", "sender", "R", "receiver", "W", "time", "T", "type", "G", "group", "K", "key", "D", "data", "V", "signature", "M", "meta", "P", "visa"];
    MessageShortener.prototype.compressReliableMessage = function (msg) {
        this.moveKey("keys", "K", msg);
        this.shortenKeys(this.messageShortKeys, msg);
        return msg
    };
    MessageShortener.prototype.extractReliableMessage = function (msg) {
        var keys = msg['K'];
        if (!keys) {
        } else if (IObject.isString(keys)) {
            delete msg['K'];
            msg['key'] = keys
        } else {
            delete msg['K'];
            msg['keys'] = keys
        }
        this.restoreKeys(this.messageShortKeys, msg);
        return msg
    };
    sdk.core.Compressor = Interface(null, null);
    var Compressor = sdk.core.Compressor;
    Compressor.prototype.compressContent = function (content, key) {
    };
    Compressor.prototype.extractContent = function (data, key) {
    };
    Compressor.prototype.compressSymmetricKey = function (key) {
    };
    Compressor.prototype.extractSymmetricKey = function (data) {
    };
    Compressor.prototype.compressReliableMessage = function (msg) {
    };
    Compressor.prototype.extractReliableMessage = function (data) {
    };
    sdk.core.MessageCompressor = function (shortener) {
        BaseObject.call(this);
        this.__shortener = shortener
    };
    var MessageCompressor = sdk.core.MessageCompressor;
    Class(MessageCompressor, BaseObject, [Compressor], null);
    MessageCompressor.prototype.getShortener = function () {
        return this.__shortener
    };
    MessageCompressor.prototype.compressContent = function (content, key) {
        var shortener = this.getShortener();
        content = shortener.compressContent(content);
        var text = JSONMap.encode(content);
        return UTF8.encode(text)
    };
    MessageCompressor.prototype.extractContent = function (data, key) {
        var text = UTF8.decode(data);
        if (!text) {
            return null
        }
        var info = JSONMap.decode(text);
        if (info) {
            var shortener = this.getShortener();
            info = shortener.extractContent(info)
        }
        return info
    };
    MessageCompressor.prototype.compressSymmetricKey = function (key) {
        var shortener = this.getShortener();
        key = shortener.compressSymmetricKey(key);
        var text = JSONMap.encode(key);
        return UTF8.encode(text)
    };
    MessageCompressor.prototype.extractSymmetricKey = function (data) {
        var text = UTF8.decode(data);
        if (!text) {
            return null
        }
        var key = JSONMap.decode(text);
        if (key) {
            var shortener = this.getShortener();
            key = shortener.extractSymmetricKey(key)
        }
        return key
    };
    MessageCompressor.prototype.compressReliableMessage = function (msg) {
        var shortener = this.getShortener();
        msg = shortener.compressReliableMessage(msg);
        var text = JSONMap.encode(msg);
        return UTF8.encode(text)
    };
    MessageCompressor.prototype.extractReliableMessage = function (data) {
        var text = UTF8.decode(data);
        if (!text) {
            return null
        }
        var msg = JSONMap.decode(text);
        if (msg) {
            var shortener = this.getShortener();
            msg = shortener.extractReliableMessage(msg)
        }
        return msg
    };
    sdk.core.CipherKeyDelegate = Interface(null, null);
    var CipherKeyDelegate = sdk.core.CipherKeyDelegate;
    CipherKeyDelegate.getDestinationForMessage = function (msg) {
        var receiver = msg.getReceiver();
        var group = ID.parse(msg.getValue('group'));
        return CipherKeyDelegate.getDestination(receiver, group)
    };
    CipherKeyDelegate.getDestination = function (receiver, group) {
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
    CipherKeyDelegate.prototype.getCipherKey = function (sender, receiver, generate) {
    };
    CipherKeyDelegate.prototype.cacheCipherKey = function (sender, receiver, key) {
    };
    sdk.core.Packer = Interface(null, null);
    var Packer = sdk.core.Packer;
    Packer.prototype.encryptMessage = function (iMsg) {
    };
    Packer.prototype.signMessage = function (sMsg) {
    };
    Packer.prototype.verifyMessage = function (rMsg) {
    };
    Packer.prototype.decryptMessage = function (sMsg) {
    };
    sdk.core.Processor = Interface(null, null);
    var Processor = sdk.core.Processor;
    Processor.prototype.processPackage = function (data) {
    };
    Processor.prototype.processReliableMessage = function (rMsg) {
    };
    Processor.prototype.processSecureMessage = function (sMsg, rMsg) {
    };
    Processor.prototype.processInstantMessage = function (iMsg, rMsg) {
    };
    Processor.prototype.processContent = function (content, rMsg) {
    };
    sdk.core.Transceiver = function () {
        BaseObject.call(this)
    };
    var Transceiver = sdk.core.Transceiver;
    Class(Transceiver, BaseObject, [InstantMessageDelegate, SecureMessageDelegate, ReliableMessageDelegate], null);
    Transceiver.prototype.getFacebook = function () {
    };
    Transceiver.prototype.getCompressor = function () {
    };
    Transceiver.prototype.serializeMessage = function (rMsg) {
        var info = rMsg.toMap();
        var compressor = this.getCompressor();
        return compressor.compressReliableMessage(info)
    };
    Transceiver.prototype.deserializeMessage = function (data) {
        var compressor = this.getCompressor();
        var info = compressor.extractReliableMessage(data);
        return ReliableMessage.parse(info)
    };
    Transceiver.prototype.serializeContent = function (content, pwd, iMsg) {
        var compressor = this.getCompressor();
        return compressor.compressContent(content.toMap(), pwd.toMap())
    };
    Transceiver.prototype.encryptContent = function (data, pwd, iMsg) {
        return pwd.encrypt(data, iMsg.toMap())
    };
    Transceiver.prototype.serializeKey = function (pwd, iMsg) {
        if (BaseMessage.isBroadcast(iMsg)) {
            return null
        }
        var compressor = this.getCompressor();
        return compressor.compressSymmetricKey(pwd.toMap())
    };
    Transceiver.prototype.encryptKey = function (keyData, receiver, iMsg) {
        var facebook = this.getEntityDelegate();
        var contact = facebook.getUser(receiver);
        if (!contact) {
            return null
        }
        return contact.encrypt(keyData)
    };
    Transceiver.prototype.decryptKey = function (keyData, receiver, sMsg) {
        var facebook = this.getEntityDelegate();
        var user = facebook.getUser(receiver);
        if (!user) {
            return null
        }
        return user.decrypt(keyData)
    };
    Transceiver.prototype.deserializeKey = function (keyData, sMsg) {
        if (!keyData) {
            return null
        }
        var compressor = this.getCompressor();
        var info = compressor.extractSymmetricKey(keyData);
        return SymmetricKey.parse(info)
    };
    Transceiver.prototype.decryptContent = function (data, pwd, sMsg) {
        return pwd.decrypt(data, sMsg.toMap())
    };
    Transceiver.prototype.deserializeContent = function (data, pwd, sMsg) {
        var compressor = this.getCompressor();
        var info = compressor.extractContent(data, pwd.toMap());
        return Content.parse(info)
    };
    Transceiver.prototype.signData = function (data, sMsg) {
        var facebook = this.getEntityDelegate();
        var sender = sMsg.getSender();
        var user = facebook.getUser(sender);
        return user.sign(data)
    };
    Transceiver.prototype.verifyDataSignature = function (data, signature, rMsg) {
        var facebook = this.getEntityDelegate();
        var sender = rMsg.getSender();
        var contact = facebook.getUser(sender);
        if (!contact) {
            return false
        }
        return contact.verify(data, signature)
    };
    sdk.TwinsHelper = function (facebook, messenger) {
        BaseObject.call(this);
        this.__facebook = facebook;
        this.__messenger = messenger
    };
    var TwinsHelper = sdk.TwinsHelper;
    Class(TwinsHelper, BaseObject, null, null);
    TwinsHelper.prototype.getFacebook = function () {
        return this.__facebook
    }
    TwinsHelper.prototype.getMessenger = function () {
        return this.__messenger
    }
    sdk.Facebook = function () {
        BaseObject.call(this)
    };
    var Facebook = sdk.Facebook;
    Class(Facebook, BaseObject, [EntityDelegate, UserDataSource, GroupDataSource], null);
    Facebook.prototype.getBarrack = function () {
    };
    Facebook.prototype.getArchivist = function () {
    };
    Facebook.prototype.selectLocalUser = function (receiver) {
        var archivist = this.getArchivist();
        var users = archivist.getLocalUsers();
        if (!users || users.length === 0) {
            return null
        } else if (receiver.isBroadcast()) {
            return users[0]
        }
        var i, uid;
        if (receiver.isUser()) {
            for (i = 0; i < users.length; ++i) {
                uid = users[i];
                if (!uid) {
                } else if (uid.equals(receiver)) {
                    return uid
                }
            }
        } else if (receiver.isGroup()) {
            var members = this.getMembers(receiver);
            if (!members || members.length === 0) {
                return null
            }
            var j, mid;
            for (i = 0; i < users.length; ++i) {
                uid = users[i];
                for (j = 0; j < members.length; ++j) {
                    mid = members[j];
                    if (!mid) {
                    } else if (mid.equals(uid)) {
                        return uid
                    }
                }
            }
        } else {
            throw new TypeError('receiver error: ' + receiver);
        }
        return null
    };
    Facebook.prototype.getUser = function (uid) {
        var barrack = this.getBarrack();
        var user = barrack.getUser(uid);
        if (user) {
            return user
        }
        if (uid.isBroadcast()) {
        } else {
            var visaKey = this.getPublicKeyForEncryption(uid);
            if (!visaKey) {
                return null
            }
        }
        user = barrack.createUser(uid);
        if (user) {
            barrack.cacheUser(user)
        }
        return user
    };
    Facebook.prototype.getGroup = function (gid) {
        var barrack = this.getBarrack();
        var group = barrack.getGroup(gid);
        if (group) {
            return group
        }
        if (gid.isBroadcast()) {
        } else {
            var members = this.getMembers(gid);
            if (!members || members.length === 0) {
                return null
            }
        }
        group = barrack.createGroup(gid);
        if (group) {
            barrack.cacheGroup(group)
        }
        return group
    };
    Facebook.prototype.getPublicKeyForEncryption = function (uid) {
        var archivist = this.getArchivist();
        var visaKey = archivist.getVisaKey(uid);
        if (visaKey) {
            return visaKey
        }
        var metaKey = archivist.getMetaKey(uid);
        if (Interface.conforms(metaKey, EncryptKey)) {
            return metaKey
        }
        return null
    };
    Facebook.prototype.getPublicKeysForVerification = function (uid) {
        var archivist = this.getArchivist();
        var verifyKeys = [];
        var visaKey = archivist.getVisaKey(uid);
        if (Interface.conforms(visaKey, VerifyKey)) {
            verifyKeys.push(visaKey)
        }
        var metaKey = archivist.getMetaKey(uid);
        if (metaKey) {
            verifyKeys.push(metaKey)
        }
        return verifyKeys
    };
    sdk.Messenger = function () {
        Transceiver.call(this)
    };
    var Messenger = sdk.Messenger;
    Class(Messenger, Transceiver, [Packer, Processor], null);
    Messenger.prototype.getCipherKeyDelegate = function () {
    };
    Messenger.prototype.getPacker = function () {
    };
    Messenger.prototype.getProcessor = function () {
    };
    Messenger.prototype.deserializeKey = function (keyData, sMsg) {
        if (!keyData) {
            return this.getDecryptKey(sMsg)
        }
        var password = Transceiver.prototype.deserializeKey.call(this, keyData, sMsg);
        if (password) {
            this.cacheDecryptKey(password, sMsg)
        }
        return password
    };
    Messenger.prototype.getEncryptKey = function (iMsg) {
        var sender = iMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(iMsg);
        var db = this.getCipherKeyDelegate();
        return db.getCipherKey(sender, target, true)
    };
    Messenger.prototype.getDecryptKey = function (sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var db = this.getCipherKeyDelegate();
        return db.getCipherKey(sender, target, false)
    };
    Messenger.prototype.cacheDecryptKey = function (key, sMsg) {
        var sender = sMsg.getSender();
        var target = CipherKeyDelegate.getDestinationForMessage(sMsg);
        var db = this.getCipherKeyDelegate();
        return db.cacheCipherKey(sender, target, key)
    };
    Messenger.prototype.encryptMessage = function (iMsg) {
        var packer = this.getPacker();
        return packer.encryptMessage(iMsg)
    };
    Messenger.prototype.signMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.signMessage(sMsg)
    };
    Messenger.prototype.verifyMessage = function (rMsg) {
        var packer = this.getPacker();
        return packer.verifyMessage(rMsg)
    };
    Messenger.prototype.decryptMessage = function (sMsg) {
        var packer = this.getPacker();
        return packer.decryptMessage(sMsg)
    };
    Messenger.prototype.processPackage = function (data) {
        var processor = this.getProcessor();
        return processor.processPackage(data)
    };
    Messenger.prototype.processReliableMessage = function (rMsg) {
        var processor = this.getProcessor();
        return processor.processReliableMessage(rMsg)
    };
    Messenger.prototype.processSecureMessage = function (sMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processSecureMessage(sMsg, rMsg)
    };
    Messenger.prototype.processInstantMessage = function (iMsg, rMsg) {
        var processor = this.getProcessor();
        return processor.processInstantMessage(iMsg, rMsg)
    };
    Messenger.prototype.processContent = function (content, rMsg) {
        var processor = this.getProcessor();
        return processor.processContent(content, rMsg)
    };
    sdk.MessagePacker = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__instantPacker = this.createInstantMessagePacker(messenger);
        this.__securePacker = this.createSecureMessagePacker(messenger);
        this.__reliablePacker = this.createReliableMessagePacker(messenger)
    };
    var MessagePacker = sdk.MessagePacker;
    Class(MessagePacker, TwinsHelper, [Packer], null);
    MessagePacker.prototype.createInstantMessagePacker = function (delegate) {
        return new InstantMessagePacker(delegate)
    };
    MessagePacker.prototype.createSecureMessagePacker = function (delegate) {
        return new SecureMessagePacker(delegate)
    };
    MessagePacker.prototype.createReliableMessagePacker = function (delegate) {
        return new ReliableMessagePacker(delegate)
    };
    MessagePacker.prototype.getInstantMessagePacker = function () {
        return this.__instantPacker
    };
    MessagePacker.prototype.getSecureMessagePacker = function () {
        return this.__securePacker
    };
    MessagePacker.prototype.getReliableMessagePacker = function () {
        return this.__reliablePacker
    };
    MessagePacker.prototype.getArchivist = function () {
        var facebook = this.getFacebook();
        if (facebook) {
            return facebook.getArchivist()
        } else {
            return null
        }
    };
    MessagePacker.prototype.encryptMessage = function (iMsg) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        var sMsg;
        var receiver = iMsg.getReceiver();
        var password = messenger.getEncryptKey(iMsg);
        if (!password) {
            return null
        }
        var instantPacker = this.getInstantMessagePacker();
        if (receiver.isGroup()) {
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                return null
            }
            sMsg = instantPacker.encryptMessage(iMsg, password, members)
        } else {
            sMsg = instantPacker.encryptMessage(iMsg, password, null)
        }
        if (sMsg == null) {
            return null
        }
        sMsg.getEnvelope().setType(iMsg.getContent().getType());
        return sMsg
    };
    MessagePacker.prototype.signMessage = function (sMsg) {
        var securePacker = this.getSecureMessagePacker();
        return securePacker.signMessage(sMsg)
    };
    MessagePacker.prototype.checkAttachments = function (rMsg) {
        var archivist = this.getArchivist();
        if (!archivist) {
            return false
        }
        var sender = rMsg.getSender();
        var meta = MessageUtils.getMeta(rMsg);
        if (meta) {
            archivist.saveMeta(meta, sender)
        }
        var visa = MessageUtils.getVisa(rMsg);
        if (visa) {
            archivist.saveDocument(visa)
        }
        return true
    };
    MessagePacker.prototype.verifyMessage = function (rMsg) {
        if (this.checkAttachments(rMsg)) {
        } else {
            return null
        }
        var reliablePacker = this.getReliableMessagePacker();
        return reliablePacker.verifyMessage(rMsg)
    };
    MessagePacker.prototype.decryptMessage = function (sMsg) {
        var receiver = sMsg.getReceiver();
        var facebook = this.getFacebook();
        var me = facebook.selectLocalUser(receiver);
        if (me == null) {
            throw new ReferenceError('receiver error: ' + receiver.toString() + ', from ' + sMsg.getSender().toString() + ', ' + sMsg.getGroup());
        }
        var securePacker = this.getSecureMessagePacker();
        return securePacker.decryptMessage(sMsg, me)
    };
    sdk.MessageProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger);
        this.__factory = this.createFactory(facebook, messenger)
    };
    var MessageProcessor = sdk.MessageProcessor;
    Class(MessageProcessor, TwinsHelper, [Processor], null);
    MessageProcessor.prototype.createFactory = function (facebook, messenger) {
    };
    MessageProcessor.prototype.getFactory = function () {
        return this.__factory
    };
    MessageProcessor.prototype.processPackage = function (data) {
        var messenger = this.getMessenger();
        var rMsg = messenger.deserializeMessage(data);
        if (!rMsg) {
            return []
        }
        var responses = messenger.processReliableMessage(rMsg);
        if (!responses || responses.length === 0) {
            return []
        }
        var packages = [];
        var res, pack;
        for (var i = 0; i < responses.length; ++i) {
            res = responses[i];
            if (!res) {
                continue
            }
            pack = messenger.serializeMessage(res);
            if (!pack) {
                continue
            }
            packages.push(pack)
        }
        return packages
    };
    MessageProcessor.prototype.processReliableMessage = function (rMsg) {
        var messenger = this.getMessenger();
        var sMsg = messenger.verifyMessage(rMsg);
        if (!sMsg) {
            return []
        }
        var responses = messenger.processSecureMessage(sMsg, rMsg);
        if (!responses || responses.length === 0) {
            return []
        }
        var messages = [];
        var res, msg;
        for (var i = 0; i < responses.length; ++i) {
            res = responses[i];
            if (!res) {
                continue
            }
            msg = messenger.signMessage(res);
            if (!msg) {
                continue
            }
            messages.push(msg)
        }
        return messages
    };
    MessageProcessor.prototype.processSecureMessage = function (sMsg, rMsg) {
        var messenger = this.getMessenger();
        var iMsg = messenger.decryptMessage(sMsg);
        if (!iMsg) {
            return []
        }
        var responses = messenger.processInstantMessage(iMsg, rMsg);
        if (!responses || responses.length === 0) {
            return []
        }
        var messages = [];
        var res, msg;
        for (var i = 0; i < responses.length; ++i) {
            res = responses[i];
            if (!res) {
                continue
            }
            msg = messenger.encryptMessage(res);
            if (!msg) {
                continue
            }
            messages.push(msg)
        }
        return messages
    };
    MessageProcessor.prototype.processInstantMessage = function (iMsg, rMsg) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        var responses = messenger.processContent(iMsg.getContent(), rMsg);
        if (!responses || responses.length === 0) {
            return []
        }
        var sender = iMsg.getSender();
        var receiver = iMsg.getReceiver();
        var me = facebook.selectLocalUser(receiver);
        if (!me) {
            return []
        }
        var messages = [];
        var res, env, msg;
        for (var i = 0; i < responses.length; ++i) {
            res = responses[i];
            if (!res) {
                continue
            }
            env = Envelope.create(me, sender, null);
            msg = InstantMessage.create(env, res);
            if (!msg) {
                continue
            }
            messages.push(msg)
        }
        return messages
    };
    MessageProcessor.prototype.processContent = function (content, rMsg) {
        var factory = this.getFactory();
        var cpu = factory.getContentProcessor(content);
        if (!cpu) {
            cpu = factory.getContentProcessorForType(ContentType.ANY)
        }
        return cpu.processContent(content, rMsg)
    };
    sdk.cpu.BaseContentProcessor = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    var BaseContentProcessor = sdk.cpu.BaseContentProcessor;
    Class(BaseContentProcessor, TwinsHelper, [ContentProcessor], null);
    BaseContentProcessor.prototype.processContent = function (content, rMsg) {
        var text = 'Content not support.';
        return this.respondReceipt(text, rMsg.getEnvelope(), content, {
            'template': 'Content (type: ${type}) not support yet!',
            'replacements': {'type': content.getType()}
        })
    };
    BaseContentProcessor.prototype.respondReceipt = function (text, envelope, content, extra) {
        return [BaseContentProcessor.createReceipt(text, envelope, content, extra)]
    };
    BaseContentProcessor.createReceipt = function (text, envelope, content, extra) {
        var res = ReceiptCommand.create(text, envelope, content);
        if (extra) {
            Mapper.addAll(res, extra)
        }
        return res
    };
    sdk.cpu.BaseCommandProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    var BaseCommandProcessor = sdk.cpu.BaseCommandProcessor;
    Class(BaseCommandProcessor, BaseContentProcessor, null, {
        processContent: function (content, rMsg) {
            var text = 'Command not support.';
            return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                'template': 'Command (name: ${command}) not support yet!',
                'replacements': {'command': content.getCmd()}
            })
        }
    });
    sdk.cpu.ForwardContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    var ForwardContentProcessor = sdk.cpu.ForwardContentProcessor;
    Class(ForwardContentProcessor, BaseContentProcessor, null, {
        processContent: function (content, rMsg) {
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
    sdk.cpu.ArrayContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger)
    };
    var ArrayContentProcessor = sdk.cpu.ArrayContentProcessor;
    Class(ArrayContentProcessor, BaseContentProcessor, null, {
        processContent: function (content, rMsg) {
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
    sdk.cpu.MetaCommandProcessor = function (facebook, messenger) {
        BaseCommandProcessor.call(this, facebook, messenger)
    };
    var MetaCommandProcessor = sdk.cpu.MetaCommandProcessor;
    Class(MetaCommandProcessor, BaseCommandProcessor, null, {
        processContent: function (content, rMsg) {
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
                return [MetaCommand.response(identifier, meta)]
            }
            var text = 'Meta not found.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta not found: ${did}.',
                'replacements': {'did': identifier.toString()}
            })
        }, updateMeta: function (meta, identifier, content, envelope) {
            var errors = this.saveMeta(meta, identifier, content, envelope);
            if (errors) {
                return errors
            }
            var text = 'Meta received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Meta received: ${did}.',
                'replacements': {'did': identifier.toString()}
            })
        }, saveMeta: function (meta, identifier, content, envelope) {
            var text;
            if (!this.checkMeta(meta, identifier)) {
                text = 'Meta not valid.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not valid: ${did}.',
                    'replacements': {'did': identifier.toString()}
                })
            } else if (!this.getArchivist().saveMeta(meta, identifier)) {
                text = 'Meta not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Meta not accepted: ${did}.',
                    'replacements': {'did': identifier.toString()}
                })
            }
            return null
        }, checkMeta: function (meta, identifier) {
            return meta.isValid() && MetaUtils.matchIdentifier(identifier, meta)
        }
    });
    sdk.cpu.DocumentCommandProcessor = function (facebook, messenger) {
        MetaCommandProcessor.call(this, facebook, messenger)
    };
    var DocumentCommandProcessor = sdk.cpu.DocumentCommandProcessor;
    Class(DocumentCommandProcessor, MetaCommandProcessor, null, {
        processContent: function (content, rMsg) {
            var text;
            var identifier = content.getIdentifier();
            if (!identifier) {
                text = 'Document command error.';
                return this.respondReceipt(text, rMsg.getEnvelope(), content)
            }
            var documents = content.getDocuments();
            if (!documents) {
                return this.queryDocument(identifier, content, rMsg.getEnvelope())
            }
            var doc;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                if (identifier.equals(doc.getIdentifier())) {
                } else {
                    text = 'Document ID not match.';
                    return this.respondReceipt(text, rMsg.getEnvelope(), content, {
                        'template': 'Document ID not match: ${did}.',
                        'replacements': {'did': identifier.toString()}
                    })
                }
            }
            return this.updateDocuments(documents, identifier, content, rMsg.getEnvelope())
        }, queryDocument: function (identifier, content, envelope) {
            var text;
            var documents = this.getFacebook().getDocuments(identifier);
            if (!documents || documents.length === 0) {
                text = 'Document not found.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not found: ${did}.',
                    'replacements': {'did': identifier.toString()}
                })
            }
            var queryTime = content.getLastTime();
            if (queryTime) {
                var last = DocumentUtils.lastDocument(documents);
                var lastTime = !last ? null : last.getTime();
                if (!lastTime) {
                } else if (lastTime.getTime() <= queryTime.getTime()) {
                    text = 'Document not updated.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Document not updated: ${did}, last time: ${time}.',
                        'replacements': {'did': identifier.toString(), 'time': lastTime.getTime()}
                    })
                }
            }
            var meta = this.getFacebook().getMeta(identifier);
            return [DocumentCommand.response(identifier, meta, documents)]
        }, updateDocuments: function (documents, identifier, content, envelope) {
            var errors;
            var meta = content.getMeta();
            var text;
            if (!meta) {
                meta = this.getFacebook().getMeta(identifier);
                if (!meta) {
                    text = 'Meta not found.';
                    return this.respondReceipt(text, envelope, content, {
                        'template': 'Meta not found: ${did}.',
                        'replacements': {'did': identifier.toString()}
                    })
                }
            } else {
                errors = this.saveMeta(meta, identifier, content, envelope);
                if (errors) {
                    return errors
                }
            }
            errors = [];
            var array;
            var doc;
            for (var i = 0; i < documents.length; ++i) {
                doc = documents[i];
                array = this.saveDocument(doc, meta, identifier, content, envelope);
                if (array) {
                    for (var j = 0; j < array.length; ++j) {
                        errors.push(array[j])
                    }
                }
            }
            if (array.length > 0) {
                return errors
            }
            text = 'Document received.';
            return this.respondReceipt(text, envelope, content, {
                'template': 'Document received: ${did}.',
                'replacements': {'did': identifier.toString()}
            })
        }, saveDocument: function (doc, meta, identifier, content, envelope) {
            var text;
            if (!this.checkDocument(doc, meta)) {
                text = 'Document not accepted.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not accepted: ${did}.',
                    'replacements': {'did': identifier.toString()}
                })
            } else if (!this.getArchivist().saveDocument(doc)) {
                text = 'Document not changed.';
                return this.respondReceipt(text, envelope, content, {
                    'template': 'Document not changed: ${did}.',
                    'replacements': {'did': identifier.toString()}
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
    sdk.cpu.CustomizedContentHandler = Interface(null, null);
    var CustomizedContentHandler = sdk.cpu.CustomizedContentHandler;
    CustomizedContentHandler.prototype.handleAction = function (act, sender, content, rMsg) {
    };
    sdk.cpu.BaseCustomizedHandler = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    var BaseCustomizedHandler = sdk.cpu.BaseCustomizedHandler;
    Class(BaseCustomizedHandler, TwinsHelper, [CustomizedContentHandler], null);
    BaseCustomizedHandler.prototype.handleAction = function (act, sender, content, rMsg) {
        var app = content.getApplication();
        var mod = content.getModule();
        var text = 'Content not support.';
        return this.respondReceipt(text, content, rMsg.getEnvelope(), {
            'template': 'Customized content (app: ${app}, mod: ${mod}, act: ${act}) not support yet!',
            'replacements': {'app': app, 'mod': mod, 'act': act}
        })
    };
    BaseCustomizedHandler.prototype.respondReceipt = function (text, envelope, content, extra) {
        return [BaseContentProcessor.createReceipt(text, envelope, content, extra)]
    };
    sdk.cpu.CustomizedContentProcessor = function (facebook, messenger) {
        BaseContentProcessor.call(this, facebook, messenger);
        this.__defaultHandler = this.createDefaultHandler(facebook, messenger)
    };
    var CustomizedContentProcessor = sdk.cpu.CustomizedContentProcessor;
    Class(CustomizedContentProcessor, BaseContentProcessor, [CustomizedContentHandler], null);
    CustomizedContentProcessor.prototype.createDefaultHandler = function (facebook, messenger) {
        return new BaseCustomizedHandler(facebook, messenger)
    };
    CustomizedContentProcessor.prototype.getDefaultHandler = function () {
        return this.__defaultHandler
    };
    CustomizedContentProcessor.prototype.processContent = function (content, rMsg) {
        var app = content.getApplication();
        var mod = content.getModule();
        var handler = this.filter(app, mod, content, rMsg);
        var act = content.getAction();
        var sender = rMsg.getSender();
        return handler.handleAction(act, sender, content, rMsg)
    };
    CustomizedContentProcessor.prototype.filter = function (app, mod, content, rMsg) {
        return this.getDefaultHandler()
    };
    sdk.cpu.BaseContentProcessorCreator = function (facebook, messenger) {
        TwinsHelper.call(this, facebook, messenger)
    };
    var BaseContentProcessorCreator = sdk.cpu.BaseContentProcessorCreator;
    Class(BaseContentProcessorCreator, TwinsHelper, [ContentProcessorCreator], {
        createContentProcessor: function (type) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (type) {
                case ContentType.FORWARD:
                case'forward':
                    return ForwardContentProcessor(facebook, messenger);
                case ContentType.ARRAY:
                case'array':
                    return ArrayContentProcessor(facebook, messenger);
                case ContentType.COMMAND:
                case'command':
                    return new BaseCommandProcessor(facebook, messenger);
                case ContentType.ANY:
                case'*':
                    return new BaseContentProcessor(facebook, messenger)
            }
            return null
        }, createCommandProcessor: function (type, cmd) {
            var facebook = this.getFacebook();
            var messenger = this.getMessenger();
            switch (cmd) {
                case Command.META:
                    return new MetaCommandProcessor(facebook, messenger);
                case Command.DOCUMENTS:
                    return new DocumentCommandProcessor(facebook, messenger)
            }
            return null
        }
    })
})(DIMP, DIMP, DIMP, DIMP);
