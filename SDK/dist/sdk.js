/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 5, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function(ns) {
    if (typeof ns.cpu !== "object") {
        ns.cpu = {}
    }
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = {}
    }
    ns.Namespace(ns.cpu);
    ns.Namespace(ns.cpu.group);
    ns.register("cpu");
    ns.cpu.register("group")
})(DIMP);
(function(ns) {
    var Envelope = ns.protocol.Envelope;
    var Command = ns.protocol.Command;
    var ReceiptCommand = function() {
        if (arguments.length === 3) {
            Command.call(this, Command.RECEIPT);
            this.setMessage(arguments[0]);
            if (arguments[1] > 0) {
                this.setSerialNumber(arguments[1])
            }
            this.setEnvelope(arguments[2])
        } else {
            if (typeof arguments[0] === "string") {
                Command.call(this, Command.RECEIPT);
                this.setMessage(arguments[0]);
                this.envelope = null
            } else {
                Command.call(this, arguments[0]);
                this.envelope = null
            }
        }
    };
    ns.Class(ReceiptCommand, Command, null);
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
                    env = this.getMap()
                }
            }
            this.envelope = Envelope.parse(env)
        }
        return this.envelope
    };
    ReceiptCommand.prototype.setEnvelope = function(env) {
        this.setValue("envelope", null);
        if (env) {
            this.setValue("sender", env.getValue("sender"));
            this.setValue("receiver", env.getValue("receiver"));
            var time = env.getValue("time");
            if (time) {
                this.setValue("time", time)
            }
            var group = env.getValue("group");
            if (group) {
                this.setValue("group", group)
            }
        }
        this.envelope = env
    };
    ReceiptCommand.prototype.getSignature = function() {
        var signature = this.getValue("signature");
        if (typeof signature === "string") {
            signature = ns.format.Base64.decode(signature)
        }
        return signature
    };
    ReceiptCommand.prototype.setSignature = function(signature) {
        if (signature instanceof Uint8Array) {
            signature = ns.format.Base64.encode(signature)
        }
        if (typeof signature === "string") {
            this.setValue("signature", signature)
        }
    };
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.register("ReceiptCommand")
})(DIMP);
(function(ns) {
    var HandshakeState = ns.type.Enum(null, {
        INIT: 0,
        START: 1,
        AGAIN: 2,
        RESTART: 3,
        SUCCESS: 4
    });
    var START_MESSAGE = "Hello world!";
    var AGAIN_MESSAGE = "DIM?";
    var SUCCESS_MESSAGE = "DIM!";
    var get_state = function(text, session) {
        if (text === SUCCESS_MESSAGE || text === "OK!") {
            return HandshakeState.SUCCESS
        } else {
            if (text === AGAIN_MESSAGE) {
                return HandshakeState.AGAIN
            } else {
                if (text !== START_MESSAGE) {
                    return HandshakeState.INIT
                } else {
                    if (session) {
                        return HandshakeState.RESTART
                    } else {
                        return HandshakeState.START
                    }
                }
            }
        }
    };
    var Command = ns.protocol.Command;
    var HandshakeCommand = function() {
        if (arguments.length === 1) {
            Command.call(this, arguments[0])
        } else {
            if (arguments.length === 2) {
                Command.call(this, Command.HANDSHAKE);
                var text = arguments[0];
                if (text) {
                    this.setValue("message", text)
                } else {
                    this.setValue("message", START_MESSAGE)
                }
                var session = arguments[1];
                if (session) {
                    this.setValue("session", session)
                }
            }
        }
    };
    ns.Class(HandshakeCommand, Command, null);
    HandshakeCommand.prototype.getMessage = function() {
        return this.getValue("message")
    };
    HandshakeCommand.prototype.getSessionKey = function() {
        return this.getValue("session")
    };
    HandshakeCommand.prototype.getState = function() {
        return get_state(this.getMessage(), this.getSessionKey())
    };
    HandshakeCommand.start = function() {
        return new HandshakeCommand(null, null)
    };
    HandshakeCommand.restart = function(session) {
        return new HandshakeCommand(null, session)
    };
    HandshakeCommand.again = function(session) {
        return new HandshakeCommand(AGAIN_MESSAGE, session)
    };
    HandshakeCommand.success = function() {
        return new HandshakeCommand(SUCCESS_MESSAGE, null)
    };
    ns.protocol.HandshakeCommand = HandshakeCommand;
    ns.protocol.HandshakeState = HandshakeState;
    ns.protocol.register("HandshakeCommand");
    ns.protocol.register("HandshakeState")
})(DIMP);
(function(ns) {
    var map = ns.type.Map;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var Station = ns.Station;
    var LoginCommand = function(info) {
        if (ns.Interface.conforms(info, ID)) {
            Command.call(this, Command.LOGIN);
            this.setValue("ID", info.toString())
        } else {
            Command.call(this, info)
        }
    };
    ns.Class(LoginCommand, Command, null);
    LoginCommand.prototype.getIdentifier = function() {
        return ID.parse(this.getValue("ID"))
    };
    LoginCommand.prototype.getDevice = function() {
        return this.getValue("device")
    };
    LoginCommand.prototype.setDevice = function(device) {
        this.setValue("device", device)
    };
    LoginCommand.prototype.getAgent = function() {
        return this.getValue("agent")
    };
    LoginCommand.prototype.setAgent = function(UA) {
        this.setValue("agent", UA)
    };
    LoginCommand.prototype.getStation = function() {
        return this.getValue("station")
    };
    LoginCommand.prototype.setStation = function(station) {
        var info;
        if (station instanceof Station) {
            info = {
                "host": station.getHost(),
                "port": station.getPort(),
                "ID": station.identifier.toString()
            }
        } else {
            if (ns.Interface.conforms(station, map)) {
                info = station.getMap()
            } else {
                info = station
            }
        }
        this.setValue("station", info)
    };
    LoginCommand.prototype.getProvider = function() {
        return this.getValue("provider")
    };
    LoginCommand.prototype.setProvider = function(provider) {
        var info;
        if (provider instanceof ns.ServiceProvider) {
            info = {
                "ID": provider.identifier.toString()
            }
        } else {
            if (ns.Interface.conforms(provider, ID)) {
                info = {
                    "ID": provider.toString()
                }
            } else {
                if (ns.Interface.conforms(provider, map)) {
                    info = provider.getMap()
                } else {
                    info = provider
                }
            }
        }
        this.setValue("provider", info)
    };
    ns.protocol.LoginCommand = LoginCommand;
    ns.protocol.register("LoginCommand")
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var MuteCommand = function(info) {
        if (arguments.length === 0) {
            Command.call(this, MuteCommand.MUTE);
            this.list = null
        } else {
            if (arguments[0] instanceof Array) {
                Command.call(this, MuteCommand.MUTE);
                this.setBlockCList(arguments[0])
            } else {
                Command.call(this, arguments[0]);
                this.list = null
            }
        }
    };
    ns.Class(MuteCommand, Command, null);
    MuteCommand.MUTE = "mute";
    MuteCommand.getMuteList = function(cmd) {
        var list = cmd["list"];
        if (list && list.length > 0) {
            return ID.convert(list)
        } else {
            return list
        }
    };
    MuteCommand.setMuteList = function(list, cmd) {
        if (list && list.length > 0) {
            cmd["list"] = ID.revert(list)
        } else {
            delete cmd["list"]
        }
    };
    MuteCommand.prototype.getMuteCList = function() {
        if (!this.list) {
            this.list = MuteCommand.getMuteList(this.getMap())
        }
        return this.list
    };
    MuteCommand.prototype.setMuteCList = function(list) {
        MuteCommand.setMuteList(list, this.getMap());
        this.list = list
    };
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.register("MuteCommand")
})(DIMP);
(function(ns) {
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var BlockCommand = function() {
        if (arguments.length === 0) {
            Command.call(this, BlockCommand.BLOCK);
            this.list = null
        } else {
            if (arguments[0] instanceof Array) {
                Command.call(this, BlockCommand.BLOCK);
                this.setBlockCList(arguments[0])
            } else {
                Command.call(this, arguments[0]);
                this.list = null
            }
        }
    };
    ns.Class(BlockCommand, Command, null);
    BlockCommand.BLOCK = "block";
    BlockCommand.getBlockList = function(cmd) {
        var list = cmd["list"];
        if (list && list.length > 0) {
            return ID.convert(list)
        } else {
            return list
        }
    };
    BlockCommand.setBlockList = function(list, cmd) {
        if (list && list.length > 0) {
            cmd["list"] = ID.revert(list)
        } else {
            delete cmd["list"]
        }
    };
    BlockCommand.prototype.getBlockCList = function() {
        if (!this.list) {
            this.list = BlockCommand.getBlockList(this.getMap())
        }
        return this.list
    };
    BlockCommand.prototype.setBlockCList = function(list) {
        BlockCommand.setBlockList(list, this.getMap());
        this.list = list
    };
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.register("BlockCommand")
})(DIMP);
(function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var ID = ns.protocol.ID;
    var Command = ns.protocol.Command;
    var StorageCommand = function(info) {
        if (typeof info === "string") {
            Command.call(this, StorageCommand.STORAGE);
            this.setTitle(info)
        } else {
            Command.call(this, info)
        }
        this.data = null;
        this.plaintext = null;
        this.key = null;
        this.password = null
    };
    ns.Class(StorageCommand, Command, null);
    StorageCommand.prototype.getTitle = function() {
        var title = this.getValue("title");
        if (title && title.length > 0) {
            return title
        } else {
            return this.getCommand()
        }
    };
    StorageCommand.prototype.setTitle = function(title) {
        this.setValue("title", title)
    };
    StorageCommand.prototype.getIdentifier = function() {
        return ID.parse(this.getValue("ID"))
    };
    StorageCommand.prototype.setIdentifier = function(identifier) {
        if (ns.Interface.conforms(identifier, ID)) {
            this.setValue("ID", identifier.toString())
        } else {
            this.setValue("ID", null)
        }
    };
    StorageCommand.prototype.getData = function() {
        if (!this.data) {
            var base64 = this.getValue("data");
            if (base64) {
                this.data = ns.format.Base64.decode(base64)
            }
        }
        return this.data
    };
    StorageCommand.prototype.setData = function(data) {
        var base64 = null;
        if (data) {
            base64 = ns.format.Base64.encode(data)
        }
        this.setValue("data", base64);
        this.data = data;
        this.plaintext = null
    };
    StorageCommand.prototype.getKey = function() {
        if (!this.key) {
            var base64 = this.getValue("key");
            if (base64) {
                this.key = ns.format.Base64.decode(base64)
            }
        }
        return this.key
    };
    StorageCommand.prototype.setKey = function(data) {
        var base64 = null;
        if (data) {
            base64 = ns.format.Base64.encode(data)
        }
        this.setValue("key", base64);
        this.key = data;
        this.password = null
    };
    StorageCommand.prototype.decrypt = function(key) {
        if (!this.plaintext) {
            var pwd = null;
            if (ns.Interface.conforms(key, PrivateKey)) {
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw new Error("failed to decrypt key: " + key)
                }
            } else {
                if (ns.Interface.conforms(key, SymmetricKey)) {
                    pwd = key
                } else {
                    throw new TypeError("Decryption key error: " + key)
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
            var dict = ns.format.JSON.decode(key);
            this.password = SymmetricKey.parse(dict)
        }
        return this.password
    };
    StorageCommand.STORAGE = "storage";
    StorageCommand.CONTACTS = "contacts";
    StorageCommand.PRIVATE_KEY = "private_key";
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.register("StorageCommand")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var Content = ns.protocol.Content;
    var TextContent = ns.protocol.TextContent;
    var ContentProcessor = function() {
        this.messenger = null
    };
    ns.Class(ContentProcessor, ns.type.Object, null);
    ContentProcessor.prototype.getMessenger = function() {
        return this.messenger
    };
    ContentProcessor.prototype.setMessenger = function(messenger) {
        this.messenger = messenger
    };
    ContentProcessor.prototype.getFacebook = function() {
        return this.messenger.getFacebook()
    };
    ContentProcessor.prototype.process = function(content, rMsg) {
        var text = "Content (type: " + content.getType() + ") not support yet!";
        var res = new TextContent(text);
        var group = content.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    var contentProcessors = {};
    ContentProcessor.getProcessor = function(info) {
        if (ns.Interface.conforms(info, Content)) {
            return contentProcessors[info.getType()]
        } else {
            if (info instanceof ContentType) {
                return contentProcessors[info.valueOf()]
            } else {
                return contentProcessors[info]
            }
        }
    };
    ContentProcessor.register = function(type, cpu) {
        if (type instanceof ContentType) {
            contentProcessors[type.valueOf()] = cpu
        } else {
            contentProcessors[type] = cpu
        }
    };
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.register("ContentProcessor")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var Command = ns.protocol.Command;
    var GroupCommand = ns.protocol.GroupCommand;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = function() {
        ContentProcessor.call(this)
    };
    ns.Class(CommandProcessor, ContentProcessor, null);
    CommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "Command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    CommandProcessor.prototype.process = function(cmd, rMsg) {
        var cpu = CommandProcessor.getProcessor(cmd);
        if (!cpu) {
            if (cmd instanceof GroupCommand) {
                cpu = CommandProcessor.getProcessor("group")
            }
        }
        if (cpu) {
            cpu.setMessage(this.getMessenger())
        } else {
            cpu = this
        }
        return cpu.execute(cmd, rMsg)
    };
    var commandProcessors = {};
    CommandProcessor.getProcessor = function(command) {
        if (command instanceof Command) {
            return commandProcessors[command.getCommand()]
        } else {
            return commandProcessors[command]
        }
    };
    CommandProcessor.register = function(command, cpu) {
        commandProcessors[command] = cpu
    };
    ContentProcessor.register(ContentType.COMMAND, CommandProcessor);
    ns.cpu.CommandProcessor = CommandProcessor;
    ns.cpu.register("CommandProcessor")
})(DIMP);
(function(ns) {
    var ForwardContent = ns.protocol.ForwardContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var ForwardContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(ForwardContentProcessor, ContentProcessor, null);
    ForwardContentProcessor.prototype.process = function(content, rMsg) {
        var secret = content.getMessage();
        secret = this.getMessenger().processReliableMessage(secret);
        if (secret) {
            return new ForwardContent(secret)
        }
        return null
    };
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.register("ForwardContentProcessor")
})(DIMP);
(function(ns) {
    var FileContent = ns.protocol.FileContent;
    var InstantMessage = ns.protocol.InstantMessage;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var FileContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(FileContentProcessor, ContentProcessor, null);
    FileContentProcessor.prototype.uploadFileContent = function(content, pwd, iMsg) {
        var data = content.getData();
        if (!data || data.length === 0) {
            return false
        }
        var encrypted = pwd.encrypt(data);
        if (!encrypted || encrypted.length === 0) {
            throw new Error("failed to encrypt file data with key: " + pwd.getMap())
        }
        var url = this.getMessenger().uploadData(encrypted, iMsg);
        if (url) {
            content.setURL(url);
            content.setData(null);
            return true
        } else {
            return false
        }
    };
    FileContentProcessor.prototype.downloadFileContent = function(content, pwd, sMsg) {
        var url = content.getURL();
        if (!url || !url.indexOf("://") < 3) {
            return false
        }
        var iMsg = InstantMessage.create(sMsg.getEnvelope(), content);
        var encrypted = this.getMessenger().downloadData(url, iMsg);
        if (!encrypted || encrypted.length === 0) {
            content.setPassword(pwd);
            return false
        } else {
            var data = pwd.decrypt(encrypted);
            if (!data || data.length === 0) {
                throw new Error("failed to decrypt file data with key: " + pwd.getMap())
            }
            content.setData(data);
            content.setURL(null);
            return true
        }
    };
    FileContentProcessor.prototype.process = function(content, rMsg) {
        return null
    };
    ns.cpu.FileContentProcessor = FileContentProcessor;
    ns.cpu.register("FileContentProcessor")
})(DIMP);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var MetaCommand = ns.protocol.MetaCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var MetaCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.Class(MetaCommandProcessor, CommandProcessor, null);
    var get_meta = function(identifier, facebook) {
        var meta = facebook.getMeta(identifier);
        if (!meta) {
            var text = "Sorry, meta not found for ID: " + identifier;
            return new TextContent(text)
        }
        return MetaCommand.response(identifier, meta)
    };
    var put_meta = function(identifier, meta, facebook) {
        if (!facebook.saveMeta(meta, identifier)) {
            return new TextContent("Meta not accept: " + identifier)
        }
        return new ReceiptCommand("Meta received: " + identifier)
    };
    MetaCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var meta = cmd.getMeta();
            if (meta) {
                return put_meta.call(this, identifier, meta, this.getFacebook())
            } else {
                return get_meta.call(this, identifier, this.getFacebook())
            }
        }
        return null
    };
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.register("MetaCommandProcessor")
})(DIMP);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var DocumentCommand = ns.protocol.DocumentCommand;
    var ReceiptCommand = ns.protocol.ReceiptCommand;
    var MetaCommandProcessor = ns.cpu.MetaCommandProcessor;
    var DocumentCommandProcessor = function(messenger) {
        MetaCommandProcessor.call(this, messenger)
    };
    ns.Class(DocumentCommandProcessor, MetaCommandProcessor, null);
    var get_doc = function(identifier, type, facebook) {
        var doc = facebook.getDocument(identifier, type);
        if (!doc) {
            var text = "Sorry, document not found for ID: " + identifier;
            return new TextContent(text)
        }
        var meta = facebook.getMeta(identifier);
        return DocumentCommand.response(identifier, meta, doc)
    };
    var put_doc = function(identifier, meta, doc, facebook) {
        if (meta) {
            if (!facebook.saveMeta(meta, identifier)) {
                return new TextContent("Meta not accept: " + identifier)
            }
        }
        if (!facebook.saveDocument(doc)) {
            return new TextContent("Document not accept: " + identifier)
        }
        return new ReceiptCommand("Document received: " + identifier)
    };
    DocumentCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var identifier = cmd.getIdentifier();
        if (identifier) {
            var doc = cmd.getDocument();
            if (!doc) {
                var type = cmd.getValue("doc_type");
                if (!type) {
                    type = "*"
                }
                return get_doc(identifier, type, this.getFacebook())
            } else {
                if (identifier.equals(doc.getIdentifier())) {
                    var meta = cmd.getMeta();
                    return put_doc(identifier, meta, doc, this.getFacebook())
                }
            }
        }
        return null
    };
    ns.cpu.DocumentCommandProcessor = DocumentCommandProcessor;
    ns.cpu.register("DocumentCommandProcessor")
})(DIMP);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.Class(HistoryCommandProcessor, CommandProcessor, null);
    HistoryCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "History command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        var group = cmd.getGroup();
        if (group) {
            res.setGroup(group)
        }
        return res
    };
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.register("HistoryCommandProcessor")
})(DIMP);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function(messenger) {
        HistoryCommandProcessor.call(this, messenger)
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null);
    GroupCommandProcessor.getProcessor = CommandProcessor.getProcessor;
    GroupCommandProcessor.prototype.getMembers = function(cmd) {
        var members = cmd.getMembers();
        if (members) {
            return members
        }
        var member = cmd.getMember();
        if (member) {
            return [member]
        } else {
            return []
        }
    };
    GroupCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var text = "Group command (name: " + cmd.getCommand() + ") not support yet!";
        var res = new TextContent(text);
        res.setGroup(cmd.getGroup());
        return res
    };
    GroupCommandProcessor.prototype.process = function(cmd, rMsg) {
        var cpu = CommandProcessor.getProcessor(cmd);
        if (cpu) {
            cpu.setMessenger(this.getMessenger())
        } else {
            cpu = this
        }
        return cpu.execute(cmd, rMsg)
    };
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.register("GroupCommandProcessor")
})(DIMP);
(function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(InviteCommandProcessor, GroupCommandProcessor, null);
    var call_reset = function(cmd, rMsg) {
        var gpu = GroupCommandProcessor.getProcessor(GroupCommand.RESET);
        gpu.setMessenger(this.getMessenger());
        return gpu.execute(cmd, rMsg)
    };
    InviteCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            return call_reset.call(this, cmd, rMsg)
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot invite member.")
            }
        }
        var invites = this.getMembers(cmd);
        if (invites.length === 0) {
            throw new EvalError("invite command error: " + cmd.getMap())
        }
        if (sender.equals(owner) && invites.indexOf(owner) >= 0) {
            return call_reset.call(this, cmd, rMsg)
        }
        var adds = [];
        var item, pos;
        for (var i = 0; i < invites.length; ++i) {
            item = invites[i];
            pos = members.indexOf(item);
            if (pos >= 0) {
                continue
            }
            adds.push(item.toString());
            members.push(item)
        }
        if (adds.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("added", adds)
            }
        }
        return null
    };
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.register("InviteCommandProcessor")
})(DIMP);
(function(ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null);
    ExpelCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            throw new EvalError("group not ready: " + group.toString())
        }
        var sender = rMsg.getSender();
        if (!owner.equals(sender)) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not the owner/assistant of group " + group.toString() + ", cannot expel member.")
            }
        }
        var expels = this.getMembers(cmd);
        if (expels.length === 0) {
            throw new EvalError("expel command error: " + cmd.getMap())
        }
        if (expels.indexOf(owner)) {
            throw new EvalError("cannot expel owner " + owner.toString() + " of group " + group.toString())
        }
        var removes = [];
        var item, pos;
        for (var i = 0; i < expels.length; ++i) {
            item = expels[i];
            pos = members.indexOf(item);
            if (pos < 0) {
                continue
            }
            removes.push(item.toString());
            members = members.splice(pos, 1)
        }
        if (removes.length > 0) {
            if (facebook.saveMembers(members, group)) {
                cmd.setValue("removed", removes)
            }
        }
        return null
    };
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.register("ExpelCommandProcessor")
})(DIMP);
(function(ns) {
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null);
    QuitCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            throw new EvalError("group not ready: " + group.toString())
        }
        var sender = rMsg.getSender();
        if (owner.equals(sender)) {
            throw new EvalError("owner cannot quit: " + sender.toString() + " -> " + group.toString())
        }
        var assistants = facebook.getAssistants(group);
        if (assistants && assistants.indexOf(sender) >= 0) {
            throw new EvalError("assistant cannot quit: " + sender.toString() + " -> " + group.toString())
        }
        var pos = members.indexOf(sender);
        if (pos > 0) {
            members = members.splice(pos, 1);
            facebook.saveMembers(members, group)
        }
        return null
    };
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.register("QuitCommandProcessor")
})(DIMP);
(function(ns) {
    var TextContent = ns.protocol.TextContent;
    var InviteCommand = ns.protocol.InviteCommand;
    var ResetCommand = ns.protocol.group.ResetCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QueryCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null);
    QueryCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            var text = "Sorry, members not found in group: " + group.toString();
            var res = new TextContent(text);
            res.setGroup(group);
            return res
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot query.")
            }
        }
        var user = facebook.getCurrentUser();
        if (owner.equals(user.identifier)) {
            return new ResetCommand(group, members)
        } else {
            return new InviteCommand(group, members)
        }
    };
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.register("QueryCommandProcessor")
})(DIMP);
(function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null);
    var save = function(cmd, sender) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var newMembers = this.getMembers(cmd);
        var item;
        for (var i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (facebook.isOwner(item, group)) {
                if (facebook.saveMembers(newMembers, group)) {
                    if (!item.equals(sender)) {
                        cmd = GroupCommand.query(group);
                        this.getMessenger().sendContent(null, item, cmd, null, 1)
                    }
                }
                return null
            }
        }
        return GroupCommand.query(group)
    };
    ResetCommandProcessor.prototype.execute = function(cmd, rMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        var owner = facebook.getOwner(group);
        var members = facebook.getMembers(group);
        if (!owner || !members || members.length === 0) {
            return save.call(this, cmd, rMsg.getSender())
        }
        var sender = rMsg.getSender();
        if (members.indexOf(sender) < 0) {
            var assistants = facebook.getAssistants(group);
            if (!assistants || assistants.indexOf(sender) < 0) {
                throw new EvalError(sender.toString() + " is not a member/assistant of group " + group.toString() + ", cannot reset member.")
            }
        }
        var newMembers = this.getMembers(cmd);
        if (newMembers.length === 0) {
            throw new EvalError("reset command error: " + cmd.getMap())
        }
        if (newMembers.indexOf(owner) < 0) {
            throw new EvalError("cannot expel owner " + owner.toString() + " of group " + group.toString())
        }
        var removes = [];
        var item, i;
        for (i = 0; i < members.length; ++i) {
            item = members[i];
            if (newMembers.indexOf(item) < 0) {
                removes.push(item.toString())
            }
        }
        var adds = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (members.indexOf(item) < 0) {
                adds.push(item.toString())
            }
        }
        if (adds.length > 0 || removes.length > 0) {
            if (facebook.saveMembers(newMembers, group)) {
                if (adds.length > 0) {
                    cmd.setValue("added", adds)
                }
                if (removes.length > 0) {
                    cmd.setValue("removed", removes)
                }
            }
        }
        return null
    };
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.register("ResetCommandProcessor")
})(DIMP);
(function(ns) {
    var Group = ns.Group;
    var Polylogue = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Polylogue, Group, null);
    Polylogue.prototype.getOwner = function() {
        var owner = Group.prototype.getOwner.call(this);
        if (owner) {
            return owner
        }
        return this.getFounder()
    };
    ns.Polylogue = Polylogue;
    ns.register("Polylogue")
})(DIMP);
(function(ns) {
    var Group = ns.Group;
    var Chatroom = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Chatroom, Group, null);
    Chatroom.prototype.getAdmins = function() {
        return this.getDataSource().getAdmins(this.identifier)
    };
    var ChatroomDataSource = function() {};
    ns.Interface(ChatroomDataSource, [Group.DataSource]);
    ChatroomDataSource.prototype.getAdmins = function() {
        console.assert(false, "implement me!");
        return null
    };
    Chatroom.DataSource = ChatroomDataSource;
    ns.Chatroom = Chatroom;
    ns.register("Chatroom")
})(DIMP);
(function(ns) {
    var User = ns.User;
    var Robot = function(identifier) {
        User.call(this, identifier)
    };
    ns.Class(Robot, User, null);
    ns.Robot = Robot;
    ns.register("Robot")
})(DIMP);
(function(ns) {
    var User = ns.User;
    var Station = function(identifier, host, port) {
        User.call(this, identifier);
        this.host = host;
        this.port = port
    };
    ns.Class(Station, User, null);
    Station.prototype.getHost = function() {
        if (!this.host) {
            var doc = this.getDocument("*");
            if (doc) {
                this.host = doc.getProperty("host")
            }
            if (!this.host) {
                this.host = "0.0.0.0"
            }
        }
        return this.host
    };
    Station.prototype.getPort = function() {
        if (!this.port) {
            var doc = this.getDocument("*");
            if (doc) {
                this.port = doc.getProperty("port")
            }
            if (!this.port) {
                this.port = 9394
            }
        }
        return this.port
    };
    ns.Station = Station;
    ns.register("Station")
})(DIMP);
(function(ns) {
    var Group = ns.Group;
    var ServiceProvider = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(ServiceProvider, Group, null);
    ServiceProvider.prototype.getStations = function() {
        return this.getMembers()
    };
    ns.ServiceProvider = ServiceProvider;
    ns.register("ServiceProvider")
})(DIMP);
(function(ns) {
    var KEYWORDS = ["all", "everyone", "anyone", "owner", "founder", "dkd", "mkm", "dimp", "dim", "dimt", "rsa", "ecc", "aes", "des", "btc", "eth", "crypto", "key", "symmetric", "asymmetric", "public", "private", "secret", "password", "id", "address", "meta", "profile", "entity", "user", "group", "contact", "member", "admin", "administrator", "assistant", "main", "polylogue", "chatroom", "social", "organization", "company", "school", "government", "department", "provider", "station", "thing", "robot", "message", "instant", "secure", "reliable", "envelope", "sender", "receiver", "time", "content", "forward", "command", "history", "keys", "data", "signature", "type", "serial", "sn", "text", "file", "image", "audio", "video", "page", "handshake", "receipt", "block", "mute", "register", "suicide", "found", "abdicate", "invite", "expel", "join", "quit", "reset", "query", "hire", "fire", "resign", "server", "client", "terminal", "local", "remote", "barrack", "cache", "transceiver", "ans", "facebook", "store", "messenger", "root", "supervisor"];
    var ID = ns.protocol.ID;
    var AddressNameService = function() {
        var caches = {
            "all": ID.EVERYONE,
            "everyone": ID.EVERYONE,
            "anyone": ID.ANYONE,
            "owner": ID.ANYONE,
            "founder": ID.FOUNDER
        };
        var reserved = {};
        var keywords = AddressNameService.KEYWORDS;
        for (var i = 0; i < keywords.length; ++i) {
            reserved[keywords[i]] = true
        }
        this.reserved = reserved;
        this.caches = caches
    };
    ns.Class(AddressNameService, ns.type.Object, null);
    AddressNameService.KEYWORDS = KEYWORDS;
    AddressNameService.prototype.isReserved = function(name) {
        return this.reserved[name] === true
    };
    AddressNameService.prototype.cache = function(name, identifier) {
        if (this.isReserved(name)) {
            return false
        }
        if (identifier) {
            this.caches[name] = identifier
        } else {
            delete this.caches[name]
        }
        return true
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
    AddressNameService.prototype.save = function(name, identifier) {
        return this.cache(name, identifier)
    };
    ns.AddressNameService = AddressNameService;
    ns.register("AddressNameService")
})(DIMP);
(function(ns) {
    var Callback = function() {};
    ns.Interface(Callback, null);
    Callback.prototype.onFinished = function(result, error) {
        console.assert(false, "implement me!")
    };
    ns.Callback = Callback;
    ns.register("Callback")
})(DIMP);
(function(ns) {
    var CompletionHandler = function() {};
    ns.Interface(CompletionHandler, null);
    CompletionHandler.prototype.onSuccess = function() {
        console.assert(false, "implement me!")
    };
    CompletionHandler.prototype.onFailed = function(error) {
        console.assert(false, "implement me!")
    };
    ns.CompletionHandler = CompletionHandler;
    ns.register("CompletionHandler")
})(DIMP);
(function(ns) {
    var MessengerDelegate = function() {};
    ns.Interface(MessengerDelegate, null);
    MessengerDelegate.prototype.uploadData = function(data, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.downloadData = function(url, iMsg) {
        console.assert(false, "implement me!");
        return null
    };
    MessengerDelegate.prototype.sendPackage = function(data, handler, priority) {
        console.assert(false, "implement me!");
        return false
    };
    ns.MessengerDelegate = MessengerDelegate;
    ns.register("MessengerDelegate")
})(DIMP);
(function(ns) {
    var MessengerDataSource = function() {};
    ns.Interface(MessengerDataSource, null);
    MessengerDataSource.prototype.saveMessage = function(iMsg) {
        console.assert(false, "implement me!");
        return false
    };
    MessengerDataSource.prototype.suspendReliableMessage = function(rMsg) {
        console.assert(false, "implement me!")
    };
    MessengerDataSource.prototype.suspendInstantMessage = function(iMsg) {
        console.assert(false, "implement me!")
    };
    ns.MessengerDataSource = MessengerDataSource;
    ns.register("MessengerDataSource")
})(DIMP);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var ID = ns.protocol.ID;
    var User = ns.User;
    var Robot = ns.Robot;
    var Station = ns.Station;
    var Group = ns.Group;
    var Polylogue = ns.Polylogue;
    var Chatroom = ns.Chatroom;
    var ServiceProvider = ns.ServiceProvider;
    var Barrack = ns.core.Barrack;
    var Facebook = function() {
        Barrack.call(this)
    };
    ns.Class(Facebook, Barrack, null);
    Facebook.prototype.getCurrentUser = function() {
        var users = this.getLocalUsers();
        if (!users || users.length === 0) {
            return null
        }
        return users[0]
    };
    Facebook.prototype.saveMeta = function(meta, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.saveDocument = function(doc) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.saveMembers = function(members, identifier) {
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.checkDocument = function(doc) {
        var identifier = doc.getIdentifier();
        if (!identifier) {
            return false
        }
        var meta;
        if (identifier.isGroup()) {
            var owner = this.getOwner(identifier);
            if (!owner) {
                if (NetworkType.POLYLOGUE.equals(identifier.getType())) {
                    meta = this.getMeta(identifier)
                } else {
                    return false
                }
            } else {
                meta = this.getMeta(owner)
            }
        } else {
            meta = this.getMeta(identifier)
        }
        return meta && doc.verify(meta.key)
    };
    Facebook.prototype.isFounder = function(member, group) {
        var gMeta = this.getMeta(group);
        if (!gMeta) {
            return false
        }
        var mMeta = this.getMeta(member);
        if (!mMeta) {
            return false
        }
        return gMeta.matches(mMeta.key)
    };
    Facebook.prototype.isOwner = function(member, group) {
        if (NetworkType.POLYLOGUE.equals(group.getType())) {
            return this.isFounder(member, group)
        }
        throw new Error("only Polylogue so far")
    };
    Facebook.prototype.createUser = function(identifier) {
        if (identifier.isBroadcast()) {
            return new User(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.MAIN.equals(type) || NetworkType.BTC_MAIN.equals(type)) {
            return new User(identifier)
        }
        if (NetworkType.ROBOT.equals(type)) {
            return new Robot(identifier)
        }
        if (NetworkType.STATION.equals(type)) {
            return new Station(identifier)
        }
        throw new TypeError("Unsupported user type: " + type)
    };
    Facebook.prototype.createGroup = function(identifier) {
        if (identifier.isBroadcast()) {
            return new Group(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.POLYLOGUE.equals(type)) {
            return new Polylogue(identifier)
        }
        if (NetworkType.CHATROOM.equals(type)) {
            return new Chatroom(identifier)
        }
        if (NetworkType.PROVIDER.equals(type)) {
            return new ServiceProvider(identifier)
        }
        throw new TypeError("Unsupported group type: " + type)
    };
    ns.Facebook = Facebook;
    ns.register("Facebook")
})(DIMP);
(function(ns) {
    var CorePacker = ns.core.Packer;
    var MessagePacker = function(messenger) {
        CorePacker.call(this, messenger)
    };
    ns.Class(MessagePacker, CorePacker, null);
    MessagePacker.prototype.getMessenger = function() {
        return this.getTransceiver()
    };
    MessagePacker.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    var is_waiting = function(identifier, facebook) {
        if (identifier.isGroup()) {
            return !facebook.getMeta(identifier)
        } else {
            return !facebook.getPublicKeyForEncryption(identifier)
        }
    };
    MessagePacker.prototype.encryptMessage = function(iMsg) {
        var receiver = iMsg.getReceiver();
        var group = iMsg.getGroup();
        if (!(receiver.isBroadcast() || (group && group.isBroadcast()))) {
            var fb = this.getFacebook();
            if (is_waiting(receiver, fb) || (group && is_waiting(group, fb))) {
                this.getMessenger().suspendMessage(iMsg);
                return null
            }
        }
        return CorePacker.prototype.encryptMessage.call(this, iMsg)
    };
    MessagePacker.prototype.verifyMessage = function(rMsg) {
        var facebook = this.getFacebook();
        var sender = rMsg.getSender();
        var meta = rMsg.getMeta();
        if (!meta) {
            meta = facebook.getMeta(sender)
        } else {
            if (!facebook.saveMeta(meta, sender)) {
                meta = null
            }
        }
        if (!meta) {
            this.getMessenger().suspendMessage(rMsg);
            return null
        }
        var visa = rMsg.getVisa();
        if (visa != null) {
            facebook.saveDocument(visa)
        }
        return CorePacker.prototype.verifyMessage.call(this, rMsg)
    };
    MessagePacker.prototype.decryptMessage = function(sMsg) {
        var messenger = this.getMessenger();
        if (sMsg.getDelegate() == null) {
            sMsg.setDelegate(messenger)
        }
        var receiver = sMsg.getReceiver();
        var user = messenger.selectLocalUser(receiver);
        var trimmed;
        if (!user) {
            trimmed = null
        } else {
            if (receiver.isGroup()) {
                trimmed = sMsg.trim(user.identifier)
            } else {
                trimmed = sMsg
            }
        }
        if (!trimmed) {
            throw new ReferenceError("receiver error: " + sMsg.getMap())
        }
        return CorePacker.prototype.decryptMessage.call(this, sMsg)
    };
    ns.MessagePacker = MessagePacker;
    ns.register("MessagePacker")
})(DIMP);
(function(ns) {
    var Processor = ns.core.Processor;
    var MessageProcessor = function(messenger) {
        Processor.call(this, messenger)
    };
    ns.Class(MessageProcessor, Processor, null);
    MessageProcessor.prototype.getMessenger = function() {
        return this.getTransceiver()
    };
    MessageProcessor.prototype.processInstantMessage = function(iMsg, rMsg) {
        var res = Processor.prototype.processInstantMessage.call(this, iMsg, rMsg);
        if (this.getMessenger().saveMessage(iMsg)) {
            return res
        } else {
            return null
        }
    };
    MessageProcessor.prototype.processContent = function(content, rMsg) {
        var cpu = ns.cpu.ContentProcessor.getProcessor(content);
        if (cpu == null) {
            cpu = ns.cpu.ContentProcessor.getProcessor(0)
        }
        cpu.setMessenger(this.getMessenger());
        return cpu.process(content, rMsg)
    };
    ns.MessageProcessor = MessageProcessor;
    ns.register("MessageProcessor")
})(DIMP);
(function(ns) {
    var Transmitter = function() {};
    ns.Interface(Transmitter, null);
    Transmitter.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    Transmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    Transmitter.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        console.assert(false, "implement me!");
        return false
    };
    ns.Transmitter = Transmitter;
    ns.register("Transmitter")
})(DIMP);
(function(ns) {
    var obj = ns.type.Object;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var CompletionHandler = ns.CompletionHandler;
    var Transmitter = ns.Transmitter;
    var MessageTransmitter = function(messenger) {
        obj.call(this);
        this.messenger = messenger
    };
    ns.Class(MessageTransmitter, obj, [Transmitter]);
    MessageTransmitter.prototype.getMessenger = function() {
        return this.messenger
    };
    MessageTransmitter.prototype.getFacebook = function() {
        return this.getMessenger().getFacebook()
    };
    MessageTransmitter.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        if (!sender) {
            var user = this.getFacebook().getCurrentUser();
            if (!user) {
                throw new ReferenceError("current user not set")
            }
            sender = user.identifier
        }
        var env = Envelope.create(sender, receiver, null);
        var iMsg = InstantMessage.create(env, content);
        return this.getMessenger().sendInstantMessage(iMsg, callback, priority)
    };
    MessageTransmitter.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        var messenger = this.getMessenger();
        var sMsg = messenger.encryptMessage(iMsg);
        if (sMsg == null) {
            return false
        }
        var rMsg = messenger.signMessage(sMsg);
        if (rMsg == null) {
            throw new ReferenceError("failed to sign message: " + sMsg.getMap())
        }
        var OK = messenger.sendReliableMessage(rMsg, callback, priority);
        return messenger.saveMessage(iMsg) && OK
    };
    MessageTransmitter.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        var handler = null;
        if (callback != null) {
            handler = new MessageCallbackHandler(rMsg, callback)
        }
        var messenger = this.getMessenger();
        var data = messenger.serializeMessage(rMsg);
        return messenger.sendPackage(data, handler, priority)
    };
    var MessageCallbackHandler = function(rMsg, callback) {
        obj.call(this);
        this.message = rMsg;
        this.callback = callback
    };
    ns.Class(MessageCallbackHandler, obj, [CompletionHandler]);
    MessageCallbackHandler.prototype.onSuccess = function() {
        this.callback.onFinished(this.message, null)
    };
    MessageCallbackHandler.prototype.onFailed = function(error) {
        this.callback.onFinished(this.message, error)
    };
    ns.MessageTransmitter = MessageTransmitter;
    ns.register("MessageTransmitter")
})(DIMP);
(function(ns) {
    var ContentType = ns.protocol.ContentType;
    var FileContent = ns.protocol.FileContent;
    var Transceiver = ns.core.Transceiver;
    var Messenger = function() {
        Transceiver.call(this);
        this.delegate = null;
        this.datasource = null;
        this.transmitter = null
    };
    ns.Class(Messenger, Transceiver, null);
    Messenger.prototype.getFacebook = function() {
        return this.getEntityDelegate()
    };
    var get_fpu = function(messenger) {
        var cpu = ns.cpu.ContentProcessor.getProcessor(ContentType.FILE);
        cpu.setMessenger(messenger);
        return cpu
    };
    Messenger.prototype.serializeContent = function(content, pwd, iMsg) {
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.uploadFileContent(content, pwd, iMsg)
        }
        return Transceiver.prototype.serializeContent.call(this, content, pwd, iMsg)
    };
    Messenger.prototype.encryptKey = function(data, receiver, iMsg) {
        var key = this.getFacebook().getPublicKeyForEncryption(receiver);
        if (key == null) {
            this.suspendMessage(iMsg);
            return null
        }
        return Transceiver.prototype.encryptKey.call(this, data, receiver, iMsg)
    };
    Messenger.prototype.deserializeContent = function(data, pwd, sMsg) {
        var content = Transceiver.prototype.deserializeContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw new Error("failed to deserialize message content: " + sMsg)
        }
        if (content instanceof FileContent) {
            var fpu = get_fpu(this);
            fpu.downloadFileContent(content, pwd, sMsg)
        }
        return content
    };
    Messenger.prototype.setTransmitter = function(transmitter) {
        this.transmitter = transmitter
    };
    Messenger.prototype.getTransmitter = function() {
        return this.transmitter
    };
    Messenger.prototype.sendContent = function(sender, receiver, content, callback, priority) {
        return this.getTransmitter().sendContent(sender, receiver, content, callback, priority)
    };
    Messenger.prototype.sendInstantMessage = function(iMsg, callback, priority) {
        return this.getTransmitter().sendInstantMessage(iMsg, callback, priority)
    };
    Messenger.prototype.sendReliableMessage = function(rMsg, callback, priority) {
        return this.getTransmitter().sendReliableMessage(rMsg, callback, priority)
    };
    Messenger.prototype.setDelegate = function(delegate) {
        this.delegate = delegate
    };
    Messenger.prototype.getDelegate = function() {
        return this.delegate
    };
    Messenger.prototype.uploadData = function(data, iMsg) {
        return this.getDelegate().uploadData(data, iMsg)
    };
    Messenger.prototype.downloadData = function(url, iMsg) {
        return this.getDelegate().downloadData(url, iMsg)
    };
    Messenger.prototype.sendPackage = function(data, handler, priority) {
        return this.delegate.sendPackage(data, handler, priority)
    };
    Messenger.prototype.setDataSource = function(datasource) {
        this.datasource = datasource
    };
    Messenger.prototype.getDataSource = function() {
        return this.datasource
    };
    Messenger.prototype.saveMessage = function(iMsg) {
        return this.getDataSource().saveMessage(iMsg)
    };
    Messenger.prototype.suspendReliableMessage = function(rMsg) {
        return this.getDataSource().suspendReliableMessage(rMsg)
    };
    Messenger.prototype.suspendInstantMessage = function(iMsg) {
        return this.getDataSource().suspendInstantMessage(iMsg)
    };
    ns.Messenger = Messenger;
    ns.register("Messenger")
})(DIMP);
