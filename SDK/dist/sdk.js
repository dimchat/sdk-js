/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 1, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = function(messenger) {
        this.messenger = messenger;
        this.contentProcessors = {}
    };
    ns.type.Class(ContentProcessor);
    ContentProcessor.prototype.getContext = function(key) {
        return this.messenger.getContext(key)
    };
    ContentProcessor.prototype.setContext = function(key, value) {
        this.messenger.setContext(key, value)
    };
    ContentProcessor.prototype.getFacebook = function() {
        return this.messenger.getFacebook()
    };
    ContentProcessor.prototype.process = function(content, sender, msg) {
        var cpu = this.getCPU(content.type);
        return cpu.process(content, sender, msg)
    };
    ContentProcessor.prototype.getCPU = function(type) {
        var cpu = this.contentProcessors[type];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[type];
        if (!clazz) {
            clazz = cpu_classes[ContentType.UNKNOWN]
        }
        cpu = new clazz(this.messenger);
        this.contentProcessors[type] = cpu;
        return cpu
    };
    var cpu_classes = {};
    ContentProcessor.register = function(type, clazz) {
        if (clazz) {
            cpu_classes[type] = clazz
        } else {
            delete cpu_classes[type]
        }
    };
    if (typeof ns.cpu !== "object") {
        ns.cpu = {}
    }
    ns.cpu.ContentProcessor = ContentProcessor
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var Polylogue = function(identifier) {
        Group.call(this, identifier)
    };
    ns.type.Class(Polylogue, Group);
    Polylogue.prototype.getOwner = function() {
        var owner = Group.prototype.getOwner.call(this);
        if (owner) {
            return owner
        }
        return this.getFounder()
    };
    ns.Polylogue = Polylogue
}(DIMP);
! function(ns) {
    var GroupDataSource = ns.GroupDataSource;
    var ChatroomDataSource = function() {};
    ns.type.Interface(ChatroomDataSource, GroupDataSource);
    ChatroomDataSource.prototype.getAdmins = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.ChatroomDataSource = ChatroomDataSource
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var Chatroom = function(identifier) {
        Group.call(this, identifier)
    };
    ns.type.Class(Chatroom, Group);
    Chatroom.prototype.getAdmins = function() {
        return this.delegate.getAdmins(this.identifier)
    };
    ns.Chatroom = Chatroom
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Robot = function(identifier) {
        User.call(this, identifier)
    };
    ns.type.Class(Robot, User);
    ns.Robot = Robot
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Station = function(identifier, host, port) {
        User.call(this, identifier);
        this.host = host;
        this.port = port
    };
    ns.type.Class(Station, User);
    ns.Station = Station
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var ServiceProvider = function(identifier) {
        Group.call(this, identifier)
    };
    ns.type.Class(ServiceProvider, Group);
    ServiceProvider.prototype.getStations = function() {
        return this.delegate.getMembers(this.identifier)
    };
    ns.ServiceProvider = ServiceProvider
}(DIMP);
! function(ns) {
    var Command = ns.protocol.Command;
    var BlockCommand = function(info) {
        var list = null;
        if (!info) {
            info = BlockCommand.BLOCK
        } else {
            if (info instanceof Array) {
                list = info;
                info = BlockCommand.BLOCK
            }
        }
        Command.call(this, info);
        if (list) {
            this.setBlockCList(list)
        }
    };
    ns.type.Class(BlockCommand, Command);
    BlockCommand.BLOCK = "block";
    BlockCommand.prototype.getBlockCList = function() {
        return this.getValue("list")
    };
    BlockCommand.prototype.setBlockCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(BlockCommand.BLOCK, BlockCommand);
    ns.protocol.BlockCommand = BlockCommand
}(DIMP);
! function(ns) {
    var Command = ns.protocol.Command;
    var MuteCommand = function(info) {
        var list = null;
        if (!info) {
            info = MuteCommand.MUTE
        } else {
            if (info instanceof Array) {
                list = info;
                info = MuteCommand.MUTE
            }
        }
        Command.call(this, info);
        if (list) {
            this.setMuteCList(list)
        }
    };
    ns.type.Class(MuteCommand, Command);
    MuteCommand.MUTE = "mute";
    MuteCommand.prototype.getMuteCList = function() {
        return this.getValue("list")
    };
    MuteCommand.prototype.setMuteCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(MuteCommand.MUTE, MuteCommand);
    ns.protocol.MuteCommand = MuteCommand
}(DIMP);
! function(ns) {
    var Envelope = ns.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function(info) {
        var sn = null;
        var message = null;
        var envelope = null;
        if (!info) {
            info = Command.RECEIPT
        } else {
            if (typeof info === "number") {
                sn = info;
                info = Command.RECEIPT
            } else {
                if (typeof info === "string") {
                    message = info;
                    info = Command.RECEIPT
                } else {
                    if (info instanceof Envelope) {
                        envelope = info;
                        info = Command.RECEIPT
                    }
                }
            }
        }
        Command.call(this, info);
        if (sn) {
            this.setSerialNumber(sn)
        }
        if (message) {
            this.setMessage(message)
        }
        if (envelope) {
            this.setEnvelope(envelope)
        } else {
            this.envelope = null
        }
    };
    ns.type.Class(ReceiptCommand, Command);
    ReceiptCommand.prototype.setSerialNumber = function(sn) {
        this.setValue("sn", sn);
        this.sn = sn
    };
    ReceiptCommand.prototype.getMessage = function() {
        return this.getValue("message")
    };
    ReceiptCommand.prototype.setMessage = function(message) {
        this.setValue("message", message)
    };
    ReceiptCommand.prototype.getEnvelope = function() {
        if (!this.envelope) {
            var env = this.getValue("envelope");
            if (!env) {
                var sender = this.getValue("sender");
                var receiver = this.getValue("receiver");
                if (sender && receiver) {
                    env = this.getMap(false)
                }
            }
            this.envelope = Envelope.getInstance(env)
        }
        return this.envelope
    };
    ReceiptCommand.prototype.setEnvelope = function(env) {
        this.setValue("envelope", null);
        if (env) {
            this.setValue("sender", env.sender);
            this.setValue("receiver", env.receiver);
            this.setValue("time", env.time);
            this.setValue("group", env.getGroup())
        }
        this.envelope = env
    };
    Command.register(Command.RECEIPT, ReceiptCommand);
    ns.protocol.ReceiptCommand = ReceiptCommand
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var Command = ns.protocol.Command;
    var StorageCommand = function(info) {
        var title = null;
        if (!info) {
            info = StorageCommand.STORAGE
        } else {
            if (typeof info === "string") {
                title = info;
                info = StorageCommand.STORAGE
            }
        }
        Command.call(this, info);
        if (title) {
            this.setTitle(title)
        }
        this.data = null;
        this.plaintext = null;
        this.key = null;
        this.password = null
    };
    ns.type.Class(StorageCommand, Command);
    StorageCommand.prototype.getTitle = function() {
        var title = this.getValue("title");
        if (title) {
            return title
        } else {
            return this.getCommand()
        }
    };
    StorageCommand.prototype.setTitle = function(title) {
        this.setValue("title", title)
    };
    StorageCommand.prototype.getIdentifier = function() {
        return this.getValue("ID")
    };
    StorageCommand.prototype.setIdentifier = function(identifier) {
        this.setValue("ID", identifier)
    };
    StorageCommand.prototype.getData = function() {
        if (!this.data) {
            var base64 = this.getValue("data");
            if (base64) {
                this.data = Base64.decode(base64)
            }
        }
        return this.data
    };
    StorageCommand.prototype.setData = function(data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        this.setValue("data", base64);
        this.data = data;
        this.plaintext = null
    };
    StorageCommand.prototype.getKey = function() {
        if (!this.key) {
            var base64 = this.getValue("key");
            if (base64) {
                this.key = Base64.decode(base64)
            }
        }
        return this.key
    };
    StorageCommand.prototype.setKey = function(data) {
        var base64 = null;
        if (data) {
            base64 = Base64.encode(data)
        }
        this.setValue("key", base64);
        this.key = data;
        this.password = null
    };
    StorageCommand.prototype.decrypt = function(key) {
        if (!this.plaintext) {
            var pwd = null;
            if (ns.type.Object.isinstance(key, PrivateKey)) {
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw Error("failed to decrypt key: " + key)
                }
            } else {
                if (ns.type.Object.isinstance(key, SymmetricKey)) {
                    pwd = key
                } else {
                    throw TypeError("Decryption key error: " + key)
                }
            }
            var data = this.getData();
            this.plaintext = pwd.decrypt(data)
        }
        return this.plaintext
    };
    StorageCommand.prototype.decryptKey = function(privateKey) {
        if (!this.password) {
            var key = this.getKey();
            key = privateKey.decrypt(key);
            var json = new ns.type.String(key, "UTF-8");
            var dict = ns.format.JSON.decode(json);
            this.password = SymmetricKey.getInstance(dict)
        }
        return this.password
    };
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    Command.register(StorageCommand.STORAGE, StorageCommand);
    Command.register(StorageCommand.CONTACTS, StorageCommand);
    Command.register(StorageCommand.PRIVATE_KEY, StorageCommand);
    ns.protocol.StorageCommand = StorageCommand
}(DIMP);
! function(ns) {
    var ID = ns.ID;
    var Address = ns.Address;
    var AddressNameService = function() {
        var caches = {
            "all": ID.EVERYONE,
            "everyone": ID.EVERYONE,
            "anyone": ID.ANYONE,
            "owner": ID.ANYONE,
            "founder": AddressNameService.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.reserved = reserved;
        this.caches = caches
    };
    ns.type.Class(AddressNameService);
    AddressNameService.prototype.isReserved = function(name) {
        return this.reserved[name] === true
    };
    AddressNameService.prototype.cache = function(name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.caches[name] = identifier;
            return true
        } else {
            delete this.caches[name];
            return false
        }
    };
    AddressNameService.prototype.save = function(name, identifier) {
        console.assert(name !== null, "name empty");
        console.assert(identifier !== null, "ID empty");
        console.assert(false, "implement me!");
        return false
    };
    AddressNameService.prototype.getIdentifier = function(name) {
        return this.caches[name]
    };
    AddressNameService.prototype.getNames = function(identifier) {
        var array = [];
        var keys = Object.keys(this.caches);
        var name;
        for (var i = 0; i < keys.length; ++i) {
            name = keys[i];
            if (this.caches[name] === identifier) {
                array.push(name)
            }
        }
        return array
    };
    AddressNameService.FOUNDER = new ID("moky", Address.ANYWHERE);
    AddressNameService.KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    ns.AddressNameService = AddressNameService
}(DIMP);
! function(ns) {
    var KeyCache = ns.core.KeyCache;
    var KeyStore = function() {
        KeyCache.call(this);
        this.user = null
    };
    ns.type.Class(KeyStore, KeyCache);
    KeyStore.prototype.getUser = function() {
        return this.user
    };
    KeyStore.prototype.setUser = function(user) {
        if (this.user) {
            this.flush();
            if (this.user.equals(user)) {
                return
            }
        }
        if (!user) {
            this.user = null;
            return
        }
        this.user = user;
        var keys = this.loadKeys();
        if (keys) {
            this.updateKeys(keys)
        }
    };
    KeyStore.prototype.saveKeys = function(map) {
        console.assert(map !== null, "map empty");
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        return null
    };
    ns.KeyStore = KeyStore
}(DIMP);
! function(ns) {
    var Callback = function() {};
    ns.type.Interface(Callback);
    Callback.prototype.onFinished = function(result, error) {
        console.assert(result || error, "result empty");
        console.assert(false, "implement me!")
    };
    ns.Callback = Callback
}(DIMP);
! function(ns) {
    var CompletionHandler = function() {};
    ns.type.Interface(CompletionHandler);
    CompletionHandler.prototype.onSuccess = function() {
        console.assert(false, "implement me!")
    };
    CompletionHandler.prototype.onFailed = function(error) {
        console.assert(error !== null, "result empty");
        console.assert(false, "implement me!")
    };
    ns.CompletionHandler = CompletionHandler
}(DIMP);
! function(ns) {
    var ConnectionDelegate = function() {};
    ns.type.Interface(ConnectionDelegate);
    ConnectionDelegate.prototype.onReceivePackage = function(data) {
        console.assert(data !== null, "data empty");
        console.assert(false, "implement me!");
        return null
    };
    ns.ConnectionDelegate = ConnectionDelegate
}(DIMP);
! function(ns) {
    var MessengerDelegate = function() {};
    ns.type.Interface(MessengerDelegate);
    MessengerDelegate.prototype.uploadData = function(data, msg) {
        console.assert(data !== null, "data empty");
        console.assert(msg !== null, "msg empty");
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.downloadData = function(url, msg) {
        console.assert(url !== null, "URL empty");
        console.assert(msg !== null, "msg empty");
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.sendPackage = function(data, handler) {
        console.assert(data !== null, "data empty");
        console.assert(handler !== null, "handler empty");
        console.assert(false, "implement me!");
        return false
    };
    ns.MessengerDelegate = MessengerDelegate
}(DIMP);
! function(ns) {
    var DecryptKey = ns.crypto.DecryptKey;
    var NetworkType = ns.protocol.NetworkType;
    var Profile = ns.Profile;
    var User = ns.User;
    var Robot = ns.Robot;
    var Station = ns.Station;
    var Group = ns.Group;
    var Polylogue = ns.Polylogue;
    var Chatroom = ns.Chatroom;
    var ServiceProvider = ns.ServiceProvider;
    var Barrack = ns.core.Barrack;
    var Facebook = function() {
        Barrack.call(this);
        this.ans = null;
        this.profileMap = {};
        this.privateKeyMap = {};
        this.contactsMap = {};
        this.membersMap = {}
    };
    ns.type.Class(Facebook, Barrack);
    Facebook.prototype.ansGet = function(name) {
        if (!this.ans) {
            return null
        }
        return this.ans.getIdentifier(name)
    };
    Facebook.prototype.verifyMeta = function(meta, identifier) {
        return meta.matches(identifier)
    };
    Facebook.prototype.cacheMeta = function(meta, identifier) {
        if (!this.verifyMeta(meta, identifier)) {
            return false
        }
        return Barrack.prototype.cacheMeta.call(this, meta, identifier)
    };
    Facebook.prototype.saveMeta = function(meta, identifier) {
        console.assert(meta !== null, "meta empty");
        console.assert(identifier !== null, "ID empty");
        return false
    };
    Facebook.prototype.loadMeta = function(identifier) {
        console.assert(identifier !== null, "ID empty");
        return null
    };
    var EXPIRES_KEY = "expires";
    Facebook.prototype.EXPIRES = 3600;
    Facebook.prototype.verifyProfile = function(profile, identifier) {
        if (identifier) {
            if (!profile || !identifier.equals(profile.getIdentifier())) {
                return false
            }
        } else {
            identifier = profile.getIdentifier();
            identifier = this.getIdentifier(identifier);
            if (!identifier) {
                throw Error("profile ID error: " + profile)
            }
        }
        var meta;
        if (identifier.getType().isGroup()) {
            var members = this.getMembers(identifier);
            if (members) {
                var id;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (!meta) {
                        continue
                    }
                    if (profile.verify(meta.key)) {
                        return true
                    }
                }
            }
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (identifier.getType().equals(NetworkType.Polylogue)) {
                    meta = this.getMeta(identifier)
                } else {
                    return false
                }
            } else {
                if (members && members.contains(owner)) {
                    return false
                } else {
                    meta = this.getMeta(owner)
                }
            }
        } else {
            meta = this.getMeta(identifier)
        }
        return meta && profile.verify(meta.key)
    };
    Facebook.prototype.cacheProfile = function(profile, identifier) {
        if (!profile) {
            delete this.profileMap[identifier];
            return false
        }
        if (!this.verifyProfile(profile, identifier)) {
            return false
        }
        if (!identifier) {
            identifier = profile.getIdentifier();
            identifier = this.getIdentifier(identifier);
            if (!identifier) {
                throw Error("profile ID error: " + profile)
            }
        }
        this.profileMap[identifier] = profile;
        return true
    };
    Facebook.prototype.saveProfile = function(profile, identifier) {
        console.assert(profile !== null, "profile empty");
        console.assert(identifier !== null, "ID empty");
        return false
    };
    Facebook.prototype.loadProfile = function(identifier) {
        console.assert(identifier !== null, "ID empty");
        return null
    };
    Facebook.prototype.verifyPrivateKey = function(key, identifier) {
        var meta = this.getMeta(identifier);
        if (meta) {
            return meta.key.matches(key)
        } else {
            throw Error("failed to get meta for user: " + identifier)
        }
    };
    Facebook.prototype.cachePrivateKey = function(key, identifier) {
        if (!key) {
            delete this.privateKeyMap[identifier];
            return false
        }
        if (!this.verifyPrivateKey(key, identifier)) {
            return false
        }
        this.privateKeyMap[identifier] = key;
        return true
    };
    Facebook.prototype.savePrivateKey = function(key, identifier) {
        console.assert(key !== null, "private key empty");
        console.assert(identifier !== null, "ID empty");
        return false
    };
    Facebook.prototype.loadPrivateKey = function(identifier) {
        console.assert(identifier !== null, "ID empty");
        return null
    };
    Facebook.prototype.cacheContacts = function(contacts, identifier) {
        if (!contacts) {
            delete this.contactsMap[identifier];
            return false
        }
        this.contactsMap[identifier] = contacts;
        return true
    };
    Facebook.prototype.saveContacts = function(contacts, identifier) {
        console.assert(contacts !== null, "contacts empty");
        console.assert(identifier !== null, "ID empty");
        return false
    };
    Facebook.prototype.loadContacts = function(identifier) {
        console.assert(identifier !== null, "ID empty");
        return null
    };
    Facebook.prototype.cacheMembers = function(members, identifier) {
        if (!members) {
            delete this.membersMap[identifier];
            return false
        }
        this.membersMap[identifier] = members;
        return true
    };
    Facebook.prototype.saveMembers = function(members, identifier) {
        console.assert(members !== null, "members empty");
        console.assert(identifier !== null, "ID empty");
        return false
    };
    Facebook.prototype.loadMembers = function(identifier) {
        console.assert(identifier !== null, "ID empty");
        return null
    };
    Facebook.prototype.getLocalUsers = function() {
        console.assert(false, "implement me!");
        return null
    };
    Facebook.prototype.getCurrentUser = function() {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null
        }
        return users[0]
    };
    Facebook.prototype.createIdentifier = function(string) {
        var identifier = this.ansGet(string);
        if (identifier) {
            return identifier
        }
        return Barrack.prototype.createIdentifier.call(this, string)
    };
    Facebook.prototype.createUser = function(identifier) {
        if (identifier.isBroadcast()) {
            return new User(identifier)
        }
        var type = identifier.getType();
        if (type.isPerson()) {
            return new User(identifier)
        }
        if (type.isRobot()) {
            return new Robot(identifier)
        }
        if (type.isStation()) {
            return new Station(identifier)
        }
        throw TypeError("Unsupported user type: " + type)
    };
    Facebook.prototype.createGroup = function(identifier) {
        if (identifier.isBroadcast()) {
            return new Group(identifier)
        }
        var type = identifier.getType();
        if (type.equals(NetworkType.Polylogue)) {
            return new Polylogue(identifier)
        }
        if (type.equals(NetworkType.Chatroom)) {
            return new Chatroom(identifier)
        }
        if (type.isProvider()) {
            return new ServiceProvider(identifier)
        }
        throw TypeError("Unsupported group type: " + type)
    };
    Facebook.prototype.getMeta = function(identifier) {
        var meta = Barrack.prototype.getMeta.call(this, identifier);
        if (meta) {
            return meta
        }
        meta = this.loadMeta(identifier);
        if (meta) {
            Barrack.prototype.cacheMeta.call(this, meta, identifier)
        }
        return meta
    };
    Facebook.prototype.getProfile = function(identifier) {
        var profile = this.profileMap[identifier];
        if (profile) {
            var now = new Date();
            var timestamp = now.getTime() / 1000 + this.EXPIRES;
            var expires = profile.getValue(EXPIRES_KEY);
            if (!expires) {
                profile.setValue(EXPIRES_KEY, timestamp);
                return profile
            } else {
                if (expires < timestamp) {
                    return profile
                }
            }
        }
        profile = this.loadProfile(identifier);
        if (profile instanceof Profile) {
            profile.setValue(EXPIRES_KEY, null)
        } else {
            profile = new Profile(identifier)
        }
        this.profileMap[identifier] = profile;
        return profile
    };
    Facebook.prototype.getContacts = function(identifier) {
        var contacts = this.contactsMap[identifier];
        if (contacts) {
            return contacts
        }
        contacts = this.loadContacts(identifier);
        if (contacts) {
            this.cacheContacts(contacts, identifier)
        }
        return contacts
    };
    Facebook.prototype.getPrivateKeyForSignature = function(identifier) {
        var key = this.privateKeyMap[identifier];
        if (key) {
            return key
        }
        key = this.loadPrivateKey(identifier);
        if (key) {
            this.privateKeyMap[identifier] = key
        }
        return key
    };
    Facebook.prototype.getPrivateKeysForDecryption = function(identifier) {
        var keys = [];
        var sKey = this.getPrivateKeyForSignature(identifier);
        if (sKey && ns.type.Object.isinstance(sKey, DecryptKey)) {
            keys.push(sKey)
        }
        return keys
    };
    Facebook.prototype.getFounder = function(identifier) {
        var founder = Barrack.prototype.getFounder.call(this, identifier);
        if (founder) {
            return founder
        }
        var members = this.getMembers(identifier);
        if (members) {
            var gMeta = this.getMeta(identifier);
            if (gMeta) {
                var id;
                var meta;
                for (var i = 0; i < members.length; ++i) {
                    id = this.getIdentifier(members[i]);
                    meta = this.getMeta(id);
                    if (meta && meta.matches(meta.key)) {
                        return id
                    }
                }
            }
        }
        return null
    };
    Facebook.prototype.getOwner = function(identifier) {
        var owner = Barrack.prototype.getOwner.call(this, identifier);
        if (owner) {
            return owner
        }
        if (identifier.getType().equals(NetworkType.Polylogue)) {
            return this.getFounder(identifier)
        }
        return null
    };
    Facebook.prototype.getMembers = function(identifier) {
        var members = Barrack.prototype.getMembers.call(this, identifier);
        if (!members) {
            members = this.membersMap[identifier]
        }
        if (members) {
            return members
        }
        members = this.loadMembers(identifier);
        if (members) {
            this.cacheMembers(members, identifier)
        }
        return members
    };
    Facebook.prototype.isFounder = function(member, group) {
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            throw Error("failed to get meta for group: " + group)
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            throw Error("failed to get meta for member: " + member)
        }
        return gMeta.matches(mMeta.key)
    };
    Facebook.prototype.isOwner = function(member, group) {
        if (group.getType().equals(NetworkType.Polylogue)) {
            return this.isFounder(member, group)
        }
        throw Error("only Polylogue so far")
    };
    Facebook.prototype.existsMember = function(member, group) {
        var list = this.getMembers(group);
        if (list && list.contains(member)) {
            return true
        }
        var owner = this.getOwner(group);
        if (owner) {
            owner = this.getIdentifier(owner);
            return owner.equals(member)
        } else {
            return false
        }
    };
    Facebook.prototype.getAssistants = function(group) {
        var identifier = this.ansGet("assistant");
        if (identifier) {
            return [identifier]
        }
        return null
    };
    Facebook.prototype.existsAssistant = function(user, group) {
        var assistants = this.getAssistants(group);
        if (assistants) {
            return assistants.contains(user)
        }
        return false
    };
    ns.Facebook = Facebook
}(DIMP);
! function(ns) {
    var ForwardContent = ns.protocol.ForwardContent;
    var InviteCommand = ns.protocol.group.InviteCommand;
    var QueryCommand = ns.protocol.group.QueryCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var MessageProcessor = function(messenger) {
        this.messenger = messenger;
        this.cpu = null
    };
    ns.type.Class(MessageProcessor);
    MessageProcessor.prototype.getFacebook = function() {
        return this.messenger.getFacebook()
    };
    var is_empty = function(group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true
        }
        var owner = facebook.getOwner(group);
        return !owner
    };
    var check_group = function(content, sender) {
        var facebook = this.getFacebook();
        var group = facebook.getIdentifier(content.getGroup());
        if (!group || group.isBroadcast()) {
            return false
        }
        var meta = facebook.getMeta(group);
        if (!meta) {
            return true
        }
        var needsUpdate = is_empty.call(this, group);
        if (content instanceof InviteCommand) {
            needsUpdate = false
        }
        if (needsUpdate) {
            var cmd = new QueryCommand(group);
            return this.messenger.sendContent(cmd, sender)
        }
        return false
    };
    MessageProcessor.prototype.process = function(msg) {
        var sMsg = this.messenger.verifyMessage(msg);
        if (!sMsg) {
            return null
        }
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        if (receiver.getType().isGroup() && receiver.isBroadcast()) {
            return this.messenger.broadcastMessage(msg)
        }
        var iMsg = this.messenger.decryptMessage(sMsg);
        if (!iMsg) {
            return this.messenger.deliverMessage(msg)
        }
        if (iMsg.content instanceof ForwardContent) {
            var secret = iMsg.content.getMessage();
            return this.messenger.forwardMessage(secret)
        }
        var sender = msg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        if (check_group.call(this, iMsg.content, sender)) {
            this.messenger.suspendMessage(msg);
            return null
        }
        if (!this.cpu) {
            this.cpu = new ContentProcessor(this.messenger)
        }
        var response = this.cpu.process(iMsg.content, sender, iMsg);
        if (this.messenger.saveMessage(iMsg)) {
            return response
        }
        return null
    };
    ns.MessageProcessor = MessageProcessor
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Meta = ns.Meta;
    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var ForwardContent = ns.protocol.ForwardContent;
    var TextContent = ns.protocol.TextContent;
    var FileContent = ns.protocol.FileContent;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var ConnectionDelegate = ns.ConnectionDelegate;
    var Transceiver = ns.core.Transceiver;
    var Facebook = ns.Facebook;
    var MessageProcessor = ns.MessageProcessor;
    var Messenger = function() {
        Transceiver.call(this);
        this.context = {};
        this.processor = null;
        this.delegate = null
    };
    ns.type.Class(Messenger, Transceiver, ConnectionDelegate);
    Messenger.prototype.getContext = function(key) {
        return this.context[key]
    };
    Messenger.prototype.setContext = function(key, value) {
        if (value) {
            this.context[key] = value
        } else {
            delete this.context[key]
        }
    };
    Messenger.prototype.getFacebook = function() {
        var facebook = this.getContext("facebook");
        if (!facebook && this.entityDelegate instanceof Facebook) {
            facebook = this.entityDelegate
        }
        return facebook
    };
    var select = function(receiver) {
        var facebook = this.getFacebook();
        var users = facebook.getLocalUsers();
        if (!users || users.length === 0) {
            throw Error("local users should not be empty")
        } else {
            if (receiver.isBroadcast()) {
                return users[0]
            }
        }
        if (receiver.getType().isGroup()) {
            var members = facebook.getMembers(receiver);
            if (!members || members.length === 0) {
                return null
            }
            for (var i = 0; i < users.length; ++i) {
                if (members.contains(users[i].identifier)) {
                    return users[i]
                }
            }
        } else {
            for (var j = 0; j < users.length; ++j) {
                if (receiver.equals(users[j].identifier)) {
                    return users[j]
                }
            }
        }
        return null
    };
    var trim = function(msg) {
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        var user = select.call(this, receiver);
        if (!user) {
            return null
        } else {
            if (receiver.getType().isGroup()) {
                msg = msg.trim(user.identifier)
            }
        }
        return msg
    };
    Messenger.prototype.verifyMessage = function(msg) {
        var facebook = this.getFacebook();
        var sender = msg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        var meta = Meta.getInstance(msg.getMeta());
        if (meta) {
            if (!facebook.saveMeta(meta, sender)) {
                throw Error("save meta error: " + sender + ", " + meta)
            }
        } else {
            meta = facebook.getMeta(sender);
            if (!meta) {
                this.suspendMessage(msg);
                return null
            }
        }
        return Transceiver.prototype.verifyMessage.call(this, msg)
    };
    Messenger.prototype.encryptMessage = function(msg) {
        var sMsg = Transceiver.prototype.encryptMessage.call(this, msg);
        var group = msg.content.getGroup();
        if (!group) {
            sMsg.envelope.setGroup(group)
        }
        sMsg.envelope.setType(msg.content.type);
        return sMsg
    };
    Messenger.prototype.decryptMessage = function(msg) {
        msg = trim.call(this, msg);
        if (!msg) {
            return null
        }
        var iMsg = Transceiver.prototype.decryptMessage.call(this, msg);
        if (!iMsg) {
            throw Error("failed to decrypt message: " + msg)
        }
        if (iMsg.content instanceof ForwardContent) {
            var sMsg = this.verifyMessage(iMsg.content.getMessage());
            if (sMsg) {
                var secret = this.decryptMessage(sMsg);
                if (secret) {
                    return secret
                }
            }
        }
        return iMsg
    };
    Messenger.prototype.encryptContent = function(content, pwd, msg) {
        var key = SymmetricKey.getInstance(pwd);
        if (content instanceof FileContent) {
            var data = content.getData();
            data = key.encrypt(data);
            var url = this.delegate.uploadData(data, msg);
            if (url) {
                content.setURL(url);
                content.setData(null)
            }
        }
        return Transceiver.prototype.encryptContent.call(this, content, pwd, msg)
    };
    Messenger.prototype.encryptKey = function(pwd, receiver, msg) {
        var facebook = this.getFacebook();
        receiver = facebook.getIdentifier(receiver);
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            var meta = facebook.getMeta(receiver);
            if (!meta) {
                this.suspendMessage(msg);
                return null
            }
        }
        return Transceiver.prototype.encryptKey.call(this, pwd, receiver, msg)
    };
    Messenger.prototype.decryptContent = function(data, pwd, msg) {
        var key = SymmetricKey.getInstance(pwd);
        var content = Transceiver.prototype.decryptContent.call(this, data, pwd, msg);
        if (!content) {
            throw Error("failed to decrypt message content: " + msg)
        }
        if (content instanceof FileContent) {
            var iMsg = InstantMessage.newMessage(content, msg.envelope);
            var fileData = this.delegate.downloadData(content.getURL(), iMsg);
            if (fileData) {
                content.setData(key.decrypt(fileData))
            } else {
                content.setPassword(key)
            }
        }
        return content
    };
    Messenger.prototype.sendContent = function(content, receiver, callback, split) {
        var facebook = this.getFacebook();
        var user = facebook.getCurrentUser();
        var env = Envelope.newEnvelope(user.identifier, receiver);
        var msg = InstantMessage.newMessage(content, env);
        return this.sendMessage(msg, callback, split)
    };
    Messenger.prototype.sendMessage = function(msg, callback, split) {
        var facebook = this.getFacebook();
        var receiver = msg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        var sMsg = this.encryptMessage(msg);
        var rMsg = this.signMessage(sMsg);
        var ok = true;
        if (split && receiver.getType().isGroup()) {
            var messages = null;
            var members = facebook.getMembers(receiver);
            if (members && members.length > 0) {
                messages = rMsg.split(members)
            }
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    if (send_message.call(this, messages[i], callback)) {
                        ok = false
                    }
                }
            } else {
                ok = send_message.call(this, rMsg, callback)
            }
        } else {
            ok = send_message.call(this, rMsg, callback)
        }
        return ok
    };
    var send_message = function(msg, callback) {
        var handler = {
            onSuccess: function() {
                callback.onFinished(msg, null)
            },
            onFailed: function(error) {
                callback.onFinished(error)
            }
        };
        var data = this.serializeMessage(msg);
        return this.delegate.sendPackage(data, handler)
    };
    Messenger.prototype.forwardMessage = function(msg) {
        var facebook = this.getFacebook();
        var receiver = facebook.getIdentifier(msg.envelope.receiver);
        var content = new ForwardContent(msg);
        if (this.sendContent(content, receiver)) {
            return new ReceiptCommand("message forwarded")
        } else {
            return new TextContent("failed to forward your message")
        }
    };
    Messenger.prototype.broadcastMessage = function(msg) {
        console.assert(msg !== null, "message empty");
        return null
    };
    Messenger.prototype.deliverMessage = function(msg) {
        console.assert(msg !== null, "message empty");
        return null
    };
    Messenger.prototype.saveMessage = function(msg) {
        console.assert(msg !== null, "message empty");
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.suspendMessage = function(msg) {
        console.assert(msg !== null, "message empty");
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.onReceivePackage = function(data) {
        var rMsg = this.deserializeMessage(data);
        var response = this.process(rMsg);
        if (!response) {
            return null
        }
        var facebook = this.getFacebook();
        var sender = facebook.getIdentifier(rMsg.envelope.sender);
        var receiver = facebook.getIdentifier(rMsg.envelope.receiver);
        var user = select.call(this, receiver);
        if (!user) {
            user = facebook.getCurrentUser();
            if (!user) {
                throw Error("current user not found!")
            }
        }
        var env = Envelope.newEnvelope(user.identifier, sender);
        var iMsg = InstantMessage.newMessage(response, env);
        var nMsg = this.signMessage(this.encryptMessage(iMsg));
        return this.serializeMessage(nMsg)
    };
    Messenger.prototype.process = function(msg) {
        if (!this.processor) {
            this.processor = new MessageProcessor(this)
        }
        return this.processor.process(msg)
    };
    ns.Messenger = Messenger
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = function(messenger) {
        ContentProcessor.call(this, messenger);
        this.commandProcessors = {}
    };
    ns.type.Class(CommandProcessor, ContentProcessor);
    CommandProcessor.prototype.process = function(cmd, sender, msg) {
        var cpu = this.getCPU(cmd.getCommand());
        return cpu.process(cmd, sender, msg)
    };
    CommandProcessor.prototype.getCPU = function(command) {
        var cpu = this.commandProcessors[command];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[command];
        if (!clazz) {
            clazz = cpu_classes[CommandProcessor.UNKNOWN]
        }
        cpu = new clazz(this.messenger);
        this.commandProcessors[command] = cpu;
        return cpu
    };
    var cpu_classes = {};
    CommandProcessor.register = function(command, clazz) {
        if (clazz) {
            cpu_classes[command] = clazz
        } else {
            delete cpu_classes[command]
        }
    };
    CommandProcessor.UNKNOWN = "unknown";
    ContentProcessor.register(ContentType.COMMAND, CommandProcessor);
    ns.cpu.CommandProcessor = CommandProcessor
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var DefaultContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.type.Class(DefaultContentProcessor, ContentProcessor);
    DefaultContentProcessor.prototype.process = function(content, sender, msg) {
        var type = content.type.toString();
        var text = "Content (type: " + type + ") not support yet!";
        var res = new TextContent(text);
        var group = content.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    ContentProcessor.register(ContentType.UNKNOWN, DefaultContentProcessor);
    ns.cpu.DefaultContentProcessor = DefaultContentProcessor
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var DefaultCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.type.Class(DefaultCommandProcessor, CommandProcessor);
    DefaultCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var name = cmd.getCommand();
        var text = "Command (name: " + name + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    CommandProcessor.register(CommandProcessor.UNKNOWN, DefaultCommandProcessor);
    ns.cpu.DefaultCommandProcessor = DefaultCommandProcessor
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.type.Class(MetaCommandProcessor, CommandProcessor);
    var get_meta = function(identifier) {
        var facebook = this.getFacebook();
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            var text = "Sorry, meta not found for ID: " + identifier;
            return new TextContent(text)
        }
        return MetaCommand.response(identifier, meta)
    };
    var put_meta = function(identifier, meta) {
        var facebook = this.getFacebook();
        if (!facebook.verifyMeta(meta, identifier)) {
            return new TextContent("Meta not match ID: " + identifier)
        }
        if (!facebook.saveMeta(meta, identifier)) {
            return new TextContent("Meta not accept: " + identifier)
        }
        return new ReceiptCommand("Meta received: " + identifier)
    };
    MetaCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var identifier = cmd.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var meta = cmd.getMeta();
        if (meta) {
            return put_meta.call(this, identifier, meta)
        } else {
            return get_meta.call(this, identifier)
        }
    };
    CommandProcessor.register(Command.META, MetaCommandProcessor);
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var ProfileCommand = ns.protocol.ProfileCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var ProfileCommandProcessor = function(messenger) {
        MetaCommandProcessor.call(this, messenger)
    };
    ns.type.Class(ProfileCommandProcessor, MetaCommandProcessor);
    var get_profile = function(identifier) {
        var facebook = this.getFacebook();
        var profile = facebook.getProfile(identifier);
        if (!profile) {
            var text = "Sorry, profile not found for ID: " + identifier;
            return new TextContent(text)
        }
        return ProfileCommand.response(identifier, profile)
    };
    var put_profile = function(identifier, profile, meta) {
        var facebook = this.getFacebook();
        if (meta) {
            if (!facebook.verifyMeta(meta, identifier)) {
                return new TextContent("Meta not match ID: " + identifier)
            }
            if (!facebook.saveMeta(meta, identifier)) {
                return new TextContent("Meta not accept: " + identifier)
            }
        }
        if (!facebook.verifyProfile(profile, identifier)) {
            return new TextContent("Profile not match ID: " + identifier)
        }
        if (!facebook.saveProfile(profile, identifier)) {
            return new TextContent("Profile not accept: " + identifier)
        }
        return new ReceiptCommand("Profile received: " + identifier)
    };
    ProfileCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var identifier = cmd.getIdentifier();
        identifier = facebook.getIdentifier(identifier);
        var profile = cmd.getProfile();
        if (profile) {
            var meta = cmd.getMeta();
            return put_profile.call(this, identifier, profile, meta)
        } else {
            return get_profile.call(this, identifier)
        }
    };
    CommandProcessor.register(Command.PROFILE, ProfileCommandProcessor);
    ns.cpu.ProfileCommandProcessor = ProfileCommandProcessor
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger);
        this.gpu = null
    };
    ns.type.Class(HistoryCommandProcessor, CommandProcessor);
    HistoryCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var cpu;
        if (cmd.getGroup()) {
            if (!this.gpu) {
                this.gpu = new ns.cpu.GroupCommandProcessor(this.messenger)
            }
            cpu = this.gpu
        } else {
            var name = cmd.getCommand();
            cpu = this.getCPU(name)
        }
        return cpu.process(cmd, sender, msg)
    };
    HistoryCommandProcessor.register = function(command, clazz) {
        CommandProcessor.register.call(this, command, clazz)
    };
    ContentProcessor.register(ContentType.HISTORY, HistoryCommandProcessor);
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor
}(DIMP);
! function(ns) {
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function(messenger) {
        HistoryCommandProcessor.call(this, messenger)
    };
    ns.type.Class(GroupCommandProcessor, HistoryCommandProcessor);
    var convert_id_list = function(list) {
        var facebook = this.getFacebook();
        var array = [];
        var identifier;
        for (var i = 0; i < list.length; ++i) {
            identifier = facebook.getIdentifier(list[i]);
            if (!identifier) {
                continue
            }
            array.push(identifier)
        }
        return array
    };
    GroupCommandProcessor.prototype.getMembers = function(cmd) {
        var members = cmd.getMembers();
        if (!members) {
            var member = cmd.getMember();
            if (!member) {
                return null
            }
            members = [member]
        }
        return convert_id_list.call(this, members)
    };
    GroupCommandProcessor.prototype.containsOwner = function(members, group) {
        var facebook = this.getFacebook();
        var identifier;
        for (var i = 0; i < members.length; ++i) {
            identifier = facebook.getIdentifier(members[i]);
            if (facebook.isOwner(identifier, group)) {
                return true
            }
        }
        return false
    };
    GroupCommandProcessor.prototype.isEmpty = function(group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            return true
        }
        var owner = facebook.getOwner(group);
        return !owner
    };
    GroupCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var name = cmd.getCommand();
        var cpu = this.getCPU(name);
        return cpu.process(cmd, sender, msg)
    };
    GroupCommandProcessor.register = function(command, clazz) {
        HistoryCommandProcessor.register.call(this, command, clazz)
    };
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = {}
    }
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.type.Class(InviteCommandProcessor, GroupCommandProcessor);
    var is_reset = function(inviteList, sender, group) {
        var facebook = this.getFacebook();
        if (this.containsOwner(inviteList, group)) {
            return facebook.isOwner(sender, group)
        }
        return false
    };
    var reset = function(cmd, sender, msg) {
        var cpu = this.getCPU(GroupCommand.RESET);
        return cpu.process(cmd, sender, msg)
    };
    var invite = function(inviteList, group) {
        var facebook = this.getFacebook();
        var members = facebook.getMembers(group);
        if (!members) {
            members = []
        }
        var addedList = [];
        var item;
        for (var i = 0; i < inviteList.length; ++i) {
            item = inviteList[i];
            if (members.contains(item)) {
                continue
            }
            addedList.push(item);
            members.push(item)
        }
        if (addedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                return addedList
            }
        }
        return null
    };
    InviteCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (this.isEmpty(group)) {
            return reset.call(this, cmd, sender, msg)
        }
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + " is not a member of group: " + group)
                }
            }
        }
        var inviteList = this.getMembers(cmd);
        if (!inviteList || inviteList.length === 0) {
            throw Error("Invite command error: " + cmd)
        }
        if (is_reset.call(this, inviteList, sender, group)) {
            return reset.call(this, cmd, sender, msg)
        }
        var added = invite.call(this, inviteList, group);
        if (added) {
            cmd.setValue("added", added)
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.INVITE, InviteCommandProcessor);
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.type.Class(ExpelCommandProcessor, GroupCommandProcessor);
    ExpelCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error(sender + " is not the owner/admin of group: " + group)
            }
        }
        var expelList = this.getMembers(cmd);
        if (!expelList || expelList.length === 0) {
            throw Error("Expel command error: " + cmd)
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error("Group members not found: " + group)
        }
        var removedList = [];
        var item;
        for (var i = 0; i < expelList.length; ++i) {
            item = expelList[i];
            if (!members.contains(item)) {
                continue
            }
            removedList.push(item);
            ns.type.Arrays.remove(members, item)
        }
        if (removedList.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("removed", removedList)
            }
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.EXPEL, ExpelCommandProcessor);
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.type.Class(QuitCommandProcessor, GroupCommandProcessor);
    QuitCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (facebook.isOwner(sender, group)) {
            throw Error("owner cannot quit: " + sender + ", " + group)
        }
        if (facebook.existsAssistant(sender, group)) {
            throw Error("assistant cannot quit: " + sender + ", " + group)
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            throw Error("Group members not found: " + group)
        }
        if (!members.contains(sender)) {
            return
        }
        ns.type.Arrays.remove(members, sender);
        facebook.saveMembers(members, group);
        return null
    };
    GroupCommandProcessor.register(GroupCommand.QUIT, QuitCommandProcessor);
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var GroupCommand = ns.protocol.GroupCommand;
    var InviteCommand = ns.protocol.InviteCommand;
    var ResetCommand = ns.protocol.ResetCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.type.Class(QueryCommandProcessor, GroupCommandProcessor);
    QueryCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error(sender + " is not a member/assistant of group: " + group)
                }
            }
        }
        var members = facebook.getMembers(group);
        if (!members || members.length === 0) {
            var res = new TextContent("Sorry, members not found in group: " + group);
            res.setGroup(group);
            return res
        }
        var user = facebook.getCurrentUser();
        if (facebook.isOwner(user.identifier, group)) {
            return new ResetCommand(group, members)
        } else {
            return new InviteCommand(group, members)
        }
    };
    GroupCommandProcessor.register(GroupCommand.QUERY, QueryCommandProcessor);
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.type.Class(ResetCommandProcessor, GroupCommandProcessor);
    var save = function(newMembers, sender, group) {
        if (!this.containsOwner(newMembers, group)) {
            return GroupCommand.query(group)
        }
        var facebook = this.getFacebook();
        if (facebook.saveMembers(newMembers, group)) {
            var owner = facebook.getOwner(group);
            if (owner && !owner.equals(sender)) {
                var cmd = GroupCommand.query(group);
                this.messenger.sendContent(cmd, owner)
            }
        }
        return null
    };
    var reset = function(newMembers, group) {
        var facebook = this.getFacebook();
        var oldMembers = facebook.getMembers(group);
        if (!oldMembers) {
            oldMembers = []
        }
        var removedList = [];
        var i, item;
        for (i = 0; i < oldMembers.length; ++i) {
            item = oldMembers[i];
            if (newMembers.contains(item)) {
                continue
            }
            removedList.push(item)
        }
        var addedList = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.contains(item)) {
                continue
            }
            addedList.push(item)
        }
        var result = {};
        if (addedList.length > 0 || removedList.length > 0) {
            if (!facebook.saveMembers(newMembers, group)) {
                return result
            }
            if (addedList.length > 0) {
                result["added"] = addedList
            }
            if (removedList.length > 0) {
                result["removed"] = removedList
            }
        }
        return result
    };
    ResetCommandProcessor.prototype.process = function(cmd, sender, msg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        var newMembers = this.getMembers(cmd);
        if (!newMembers || newMembers.length === 0) {
            throw Error("Reset group command error: " + cmd)
        }
        if (this.isEmpty(group)) {
            return save.call(this, newMembers, sender, group)
        }
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error(sender + " is not the owner/admin of group: " + group)
            }
        }
        var result = reset.call(this, newMembers, group);
        var added = result["added"];
        if (added) {
            cmd.setValue("added", added)
        }
        var removed = result["removed"];
        if (removed) {
            cmd.setValue("removed", removed)
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.RESET, ResetCommandProcessor);
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor
}(DIMP);
