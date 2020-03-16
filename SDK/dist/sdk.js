/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Mar. 10, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */
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
    ns.protocol.ReceiptCommand = ReceiptCommand;
    ns.protocol.register("ReceiptCommand")
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
    ns.Class(MuteCommand, Command, null);
    MuteCommand.MUTE = "mute";
    MuteCommand.prototype.getMuteCList = function() {
        return this.getValue("list")
    };
    MuteCommand.prototype.setMuteCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(MuteCommand.MUTE, MuteCommand);
    ns.protocol.MuteCommand = MuteCommand;
    ns.protocol.register("MuteCommand")
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
    ns.Class(BlockCommand, Command, null);
    BlockCommand.BLOCK = "block";
    BlockCommand.prototype.getBlockCList = function() {
        return this.getValue("list")
    };
    BlockCommand.prototype.setBlockCList = function(list) {
        this.setValue("list", list)
    };
    Command.register(BlockCommand.BLOCK, BlockCommand);
    ns.protocol.BlockCommand = BlockCommand;
    ns.protocol.register("BlockCommand")
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
    ns.Class(StorageCommand, Command, null);
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
            if (key instanceof PrivateKey) {
                pwd = this.decryptKey(key);
                if (!pwd) {
                    throw Error("failed to decrypt key: " + key)
                }
            } else {
                if (key instanceof SymmetricKey) {
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
    ns.protocol.StorageCommand = StorageCommand;
    ns.protocol.register("StorageCommand")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = function(messenger) {
        this.messenger = messenger;
        this.contentProcessors = {}
    };
    ns.Class(ContentProcessor, ns.type.Object, null);
    ContentProcessor.prototype.getContext = function(key) {
        return this.messenger.getContext(key)
    };
    ContentProcessor.prototype.setContext = function(key, value) {
        this.messenger.setContext(key, value)
    };
    ContentProcessor.prototype.getFacebook = function() {
        return this.messenger.getFacebook()
    };
    ContentProcessor.prototype.process = function(content, sender, iMsg) {
        var cpu = this.getCPU(content.type);
        return cpu.process(content, sender, iMsg)
    };
    ContentProcessor.prototype.getCPU = function(type) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf()
        } else {
            value = type
        }
        var cpu = this.contentProcessors[value];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[value];
        if (!clazz) {
            if (ContentType.UNKNOWN.equals(value)) {
                throw TypeError("default CPU not register yet")
            }
            return this.getCPU(ContentType.UNKNOWN)
        }
        cpu = new clazz(this.messenger);
        this.contentProcessors[value] = cpu;
        return cpu
    };
    var cpu_classes = {};
    ContentProcessor.register = function(type, clazz) {
        var value;
        if (type instanceof ContentType) {
            value = type.valueOf()
        } else {
            value = type
        }
        if (clazz) {
            cpu_classes[value] = clazz
        } else {
            delete cpu_classes[value]
        }
    };
    if (typeof ns.cpu !== "object") {
        ns.cpu = {}
    }
    ns.Namespace(ns.cpu);
    ns.cpu.ContentProcessor = ContentProcessor;
    ns.cpu.register("ContentProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = function(messenger) {
        ContentProcessor.call(this, messenger);
        this.commandProcessors = {}
    };
    ns.Class(CommandProcessor, ContentProcessor, null);
    CommandProcessor.prototype.process = function(cmd, sender, iMsg) {
        var cpu = this.getCPU(cmd.getCommand());
        return cpu.process(cmd, sender, iMsg)
    };
    CommandProcessor.prototype.getCPU = function(command) {
        var cpu = this.commandProcessors[command];
        if (cpu) {
            return cpu
        }
        var clazz = cpu_classes[command];
        if (!clazz) {
            if (command === ContentProcessor.UNKNOWN) {
                throw TypeError("default CPU not register yet")
            }
            return this.getCPU(CommandProcessor.UNKNOWN)
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
    ns.cpu.CommandProcessor = CommandProcessor;
    ns.cpu.register("CommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var TextContent = ns.protocol.TextContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var DefaultContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(DefaultContentProcessor, ContentProcessor, null);
    DefaultContentProcessor.prototype.process = function(content, sender, iMsg) {
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
    ns.cpu.DefaultContentProcessor = DefaultContentProcessor;
    ns.cpu.register("DefaultContentProcessor")
}(DIMP);
! function(ns) {
    var TextContent = ns.protocol.TextContent;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var DefaultCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger)
    };
    ns.Class(DefaultCommandProcessor, CommandProcessor, null);
    DefaultCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
    ns.cpu.DefaultCommandProcessor = DefaultCommandProcessor;
    ns.cpu.register("DefaultCommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ForwardContent = ns.protocol.ForwardContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var ForwardContentProcessor = function(messenger) {
        ContentProcessor.call(this, messenger)
    };
    ns.Class(ForwardContentProcessor, ContentProcessor, null);
    ForwardContentProcessor.prototype.process = function(content, sender, iMsg) {
        var rMsg = content.getMessage();
        var messenger = this.messenger;
        rMsg = messenger.processReliableMessage(rMsg);
        if (rMsg) {
            return new ForwardContent(rMsg)
        }
        return null
    };
    ContentProcessor.register(ContentType.FORWARD, ForwardContentProcessor);
    ns.cpu.ForwardContentProcessor = ForwardContentProcessor;
    ns.cpu.register("ForwardContentProcessor")
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
    ns.Class(MetaCommandProcessor, CommandProcessor, null);
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
    MetaCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
    ns.cpu.MetaCommandProcessor = MetaCommandProcessor;
    ns.cpu.register("MetaCommandProcessor")
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
    ns.Class(ProfileCommandProcessor, MetaCommandProcessor, null);
    var get_profile = function(identifier) {
        var facebook = this.getFacebook();
        var profile = facebook.getProfile(identifier);
        if (!profile) {
            var text = "Sorry, profile not found for ID: " + identifier;
            return new TextContent(text)
        }
        return ProfileCommand.response(identifier, profile, null)
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
    ProfileCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
    ns.cpu.ProfileCommandProcessor = ProfileCommandProcessor;
    ns.cpu.register("ProfileCommandProcessor")
}(DIMP);
! function(ns) {
    var ContentType = ns.protocol.ContentType;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CommandProcessor = ns.cpu.CommandProcessor;
    var HistoryCommandProcessor = function(messenger) {
        CommandProcessor.call(this, messenger);
        this.gpu = null
    };
    ns.Class(HistoryCommandProcessor, CommandProcessor, null);
    HistoryCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
        return cpu.process(cmd, sender, iMsg)
    };
    HistoryCommandProcessor.register = function(command, clazz) {
        CommandProcessor.register.call(this, command, clazz)
    };
    ContentProcessor.register(ContentType.HISTORY, HistoryCommandProcessor);
    ns.cpu.HistoryCommandProcessor = HistoryCommandProcessor;
    ns.cpu.register("HistoryCommandProcessor")
}(DIMP);
! function(ns) {
    var HistoryCommandProcessor = ns.cpu.HistoryCommandProcessor;
    var GroupCommandProcessor = function(messenger) {
        HistoryCommandProcessor.call(this, messenger)
    };
    ns.Class(GroupCommandProcessor, HistoryCommandProcessor, null);
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
    GroupCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
        var name = cmd.getCommand();
        var cpu = this.getCPU(name);
        return cpu.process(cmd, sender, iMsg)
    };
    GroupCommandProcessor.register = function(command, clazz) {
        HistoryCommandProcessor.register.call(this, command, clazz)
    };
    if (typeof ns.cpu.group !== "object") {
        ns.cpu.group = {}
    }
    ns.Namespace(ns.cpu.group);
    ns.cpu.GroupCommandProcessor = GroupCommandProcessor;
    ns.cpu.register("GroupCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var InviteCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(InviteCommandProcessor, GroupCommandProcessor, null);
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
            if (members.indexOf(item) >= 0) {
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
    InviteCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (this.isEmpty(group)) {
            return reset.call(this, cmd, sender, iMsg)
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
            return reset.call(this, cmd, sender, iMsg)
        }
        var added = invite.call(this, inviteList, group);
        if (added) {
            cmd.setValue("added", added)
        }
        return null
    };
    GroupCommandProcessor.register(GroupCommand.INVITE, InviteCommandProcessor);
    ns.cpu.group.InviteCommandProcessor = InviteCommandProcessor;
    ns.cpu.group.register("InviteCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ExpelCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ExpelCommandProcessor, GroupCommandProcessor, null);
    ExpelCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.isOwner(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                throw Error("sender is not the owner/admin of group: " + iMsg)
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
            if (members.indexOf(item) < 0) {
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
    ns.cpu.group.ExpelCommandProcessor = ExpelCommandProcessor;
    ns.cpu.group.register("ExpelCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var QuitCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(QuitCommandProcessor, GroupCommandProcessor, null);
    QuitCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
        if (members.indexOf(sender) < 0) {
            throw Error("sender is not a member of group: " + iMsg)
        }
        ns.type.Arrays.remove(members, sender);
        facebook.saveMembers(members, group);
        return null
    };
    GroupCommandProcessor.register(GroupCommand.QUIT, QuitCommandProcessor);
    ns.cpu.group.QuitCommandProcessor = QuitCommandProcessor;
    ns.cpu.group.register("QuitCommandProcessor")
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
    ns.Class(QueryCommandProcessor, GroupCommandProcessor, null);
    QueryCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
        var facebook = this.getFacebook();
        var group = cmd.getGroup();
        group = facebook.getIdentifier(group);
        if (!facebook.existsMember(sender, group)) {
            if (!facebook.existsAssistant(sender, group)) {
                if (!facebook.isOwner(sender, group)) {
                    throw Error("sender is not a member/assistant of group: " + iMsg)
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
    ns.cpu.group.QueryCommandProcessor = QueryCommandProcessor;
    ns.cpu.group.register("QueryCommandProcessor")
}(DIMP);
! function(ns) {
    var GroupCommand = ns.protocol.GroupCommand;
    var GroupCommandProcessor = ns.cpu.GroupCommandProcessor;
    var ResetCommandProcessor = function(messenger) {
        GroupCommandProcessor.call(this, messenger)
    };
    ns.Class(ResetCommandProcessor, GroupCommandProcessor, null);
    var save = function(newMembers, sender, group) {
        if (!this.containsOwner(newMembers, group)) {
            return GroupCommand.query(group)
        }
        var facebook = this.getFacebook();
        if (facebook.saveMembers(newMembers, group)) {
            var owner = facebook.getOwner(group);
            if (owner && !owner.equals(sender)) {
                var cmd = GroupCommand.query(group);
                this.messenger.sendContent(cmd, owner, null, false)
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
            if (newMembers.indexOf(item) >= 0) {
                continue
            }
            removedList.push(item)
        }
        var addedList = [];
        for (i = 0; i < newMembers.length; ++i) {
            item = newMembers[i];
            if (oldMembers.indexOf(item) >= 0) {
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
    ResetCommandProcessor.prototype.process = function(cmd, sender, iMsg) {
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
                throw Error("sender is not the owner/admin of group: " + iMsg)
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
    ns.cpu.group.ResetCommandProcessor = ResetCommandProcessor;
    ns.cpu.group.register("ResetCommandProcessor")
}(DIMP);
! function(ns) {
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
}(DIMP);
! function(ns) {
    var GroupDataSource = ns.GroupDataSource;
    var ChatroomDataSource = function() {};
    ns.Interface(ChatroomDataSource, [GroupDataSource]);
    ChatroomDataSource.prototype.getAdmins = function() {
        console.assert(false, "implement me!");
        return null
    };
    ns.ChatroomDataSource = ChatroomDataSource;
    ns.register("ChatroomDataSource")
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var Chatroom = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(Chatroom, Group, null);
    Chatroom.prototype.getAdmins = function() {
        return this.delegate.getAdmins(this.identifier)
    };
    ns.Chatroom = Chatroom;
    ns.register("Chatroom")
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Robot = function(identifier) {
        User.call(this, identifier)
    };
    ns.Class(Robot, User, null);
    ns.Robot = Robot;
    ns.register("Robot")
}(DIMP);
! function(ns) {
    var User = ns.User;
    var Station = function(identifier, host, port) {
        User.call(this, identifier);
        this.host = host;
        this.port = port
    };
    ns.Class(Station, User, null);
    ns.Station = Station;
    ns.register("Station")
}(DIMP);
! function(ns) {
    var Group = ns.Group;
    var ServiceProvider = function(identifier) {
        Group.call(this, identifier)
    };
    ns.Class(ServiceProvider, Group, null);
    ServiceProvider.prototype.getStations = function() {
        return this.delegate.getMembers(this.identifier)
    };
    ns.ServiceProvider = ServiceProvider;
    ns.register("ServiceProvider")
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
    ns.Class(AddressNameService, ns.type.Object, null);
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
    ns.AddressNameService = AddressNameService;
    ns.register("AddressNameService")
}(DIMP);
! function(ns) {
    var Callback = function() {};
    ns.Interface(Callback, null);
    Callback.prototype.onFinished = function(result, error) {
        console.assert(false, "implement me!")
    };
    ns.Callback = Callback;
    ns.register("Callback")
}(DIMP);
! function(ns) {
    var CompletionHandler = function() {};
    ns.Interface(CompletionHandler, null);
    CompletionHandler.prototype.onSuccess = function() {
        console.assert(false, "implement me!")
    };
    CompletionHandler.prototype.onFailed = function(error) {
        console.assert(false, "implement me!")
    };
    CompletionHandler.newHandler = function(onSuccess, onFailed) {
        var handler = new CompletionHandler();
        handler.onSuccess = onSuccess;
        handler.onFailed = onFailed;
        return handler
    };
    ns.CompletionHandler = CompletionHandler;
    ns.register("CompletionHandler")
}(DIMP);
! function(ns) {
    var ConnectionDelegate = function() {};
    ns.Interface(ConnectionDelegate, null);
    ConnectionDelegate.prototype.onReceivePackage = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    ns.ConnectionDelegate = ConnectionDelegate;
    ns.register("ConnectionDelegate")
}(DIMP);
! function(ns) {
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
    MessengerDelegate.prototype.sendPackage = function(data, handler) {
        console.assert(false, "implement me!");
        return false
    };
    ns.MessengerDelegate = MessengerDelegate;
    ns.register("MessengerDelegate")
}(DIMP);
! function(ns) {
    var KeyCache = ns.core.KeyCache;
    var KeyStore = function() {
        KeyCache.call(this);
        this.user = null
    };
    ns.Class(KeyStore, KeyCache, null);
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
        return false
    };
    KeyStore.prototype.loadKeys = function() {
        return null
    };
    ns.KeyStore = KeyStore;
    ns.register("KeyStore")
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
    ns.Class(Facebook, Barrack, null);
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
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.loadMeta = function(identifier) {
        console.assert(false, "implement me!");
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
        if (identifier.isGroup()) {
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
                if (NetworkType.Polylogue.equals(identifier.getType())) {
                    meta = this.getMeta(identifier)
                } else {
                    return false
                }
            } else {
                if (members && members.indexOf(owner) >= 0) {
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
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.loadProfile = function(identifier) {
        console.assert(false, "implement me!");
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
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.loadPrivateKey = function(identifier) {
        console.assert(false, "implement me!");
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
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.loadContacts = function(identifier) {
        console.assert(false, "implement me!");
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
        console.assert(false, "implement me!");
        return false
    };
    Facebook.prototype.loadMembers = function(identifier) {
        console.assert(false, "implement me!");
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
        if (NetworkType.Main.equals(type) || NetworkType.BTCMain.equals(type)) {
            return new User(identifier)
        }
        if (NetworkType.Robot.equals(type)) {
            return new Robot(identifier)
        }
        if (NetworkType.Station.equals(type)) {
            return new Station(identifier)
        }
        throw TypeError("Unsupported user type: " + type)
    };
    Facebook.prototype.createGroup = function(identifier) {
        if (identifier.isBroadcast()) {
            return new Group(identifier)
        }
        var type = identifier.getType();
        if (NetworkType.Polylogue.equals(type)) {
            return new Polylogue(identifier)
        }
        if (NetworkType.Chatroom.equals(type)) {
            return new Chatroom(identifier)
        }
        if (NetworkType.Provider.equals(type)) {
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
        if (sKey && ns.Interface.conforms(sKey, DecryptKey)) {
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
        if (NetworkType.Polylogue.equals(identifier.getType())) {
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
        if (NetworkType.Polylogue.equals(group.getType())) {
            return this.isFounder(member, group)
        }
        throw Error("only Polylogue so far")
    };
    Facebook.prototype.existsMember = function(member, group) {
        var list = this.getMembers(group);
        if (list && list.indexOf(member) >= 0) {
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
            return assistants.indexOf(user) >= 0
        }
        return false
    };
    ns.Facebook = Facebook;
    ns.register("Facebook")
}(DIMP);
! function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Meta = ns.Meta;
    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;
    var ReliableMessage = ns.ReliableMessage;
    var FileContent = ns.protocol.FileContent;
    var ContentProcessor = ns.cpu.ContentProcessor;
    var CompletionHandler = ns.CompletionHandler;
    var ConnectionDelegate = ns.ConnectionDelegate;
    var Transceiver = ns.core.Transceiver;
    var Facebook = ns.Facebook;
    var Messenger = function() {
        Transceiver.call(this);
        this.context = {};
        this.cpu = new ContentProcessor(this);
        this.delegate = null
    };
    ns.Class(Messenger, Transceiver, [ConnectionDelegate]);
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
        if (receiver.isGroup()) {
            for (var i = 0; i < users.length; ++i) {
                if (facebook.existsMember(users[i].identifier, receiver)) {
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
            msg = null
        } else {
            if (receiver.isGroup()) {
                msg = msg.trim(user.identifier)
            }
        }
        return msg
    };
    Messenger.prototype.verifyMessage = function(rMsg) {
        var facebook = this.getFacebook();
        var sender = rMsg.envelope.sender;
        sender = facebook.getIdentifier(sender);
        var meta = Meta.getInstance(rMsg.getMeta());
        if (meta) {
            if (!facebook.saveMeta(meta, sender)) {
                throw Error("save meta error: " + sender + ", " + meta)
            }
        } else {
            meta = facebook.getMeta(sender);
            if (!meta) {
                this.suspendMessage(rMsg);
                return null
            }
        }
        return Transceiver.prototype.verifyMessage.call(this, rMsg)
    };
    Messenger.prototype.decryptMessage = function(sMsg) {
        var msg = trim.call(this, sMsg);
        if (!msg) {
            throw Error("receiver error:" + sMsg)
        }
        return Transceiver.prototype.decryptMessage.call(this, msg)
    };
    Messenger.prototype.deserializeMessage = function(data) {
        if (!data) {
            return null
        }
        return Transceiver.prototype.deserializeMessage.call(this, data)
    };
    Messenger.prototype.encryptContent = function(content, pwd, iMsg) {
        var key = SymmetricKey.getInstance(pwd);
        if (content instanceof FileContent) {
            var data = content.getData();
            data = key.encrypt(data);
            var url = this.delegate.uploadData(data, iMsg);
            if (url) {
                content.setURL(url);
                content.setData(null)
            }
        }
        return Transceiver.prototype.encryptContent.call(this, content, pwd, iMsg)
    };
    Messenger.prototype.encryptKey = function(pwd, receiver, iMsg) {
        var facebook = this.getFacebook();
        receiver = facebook.getIdentifier(receiver);
        var key = facebook.getPublicKeyForEncryption(receiver);
        if (!key) {
            var meta = facebook.getMeta(receiver);
            if (!meta) {
                this.suspendMessage(iMsg);
                return null
            }
        }
        return Transceiver.prototype.encryptKey.call(this, pwd, receiver, iMsg)
    };
    Messenger.prototype.decryptContent = function(data, pwd, sMsg) {
        var key = SymmetricKey.getInstance(pwd);
        var content = Transceiver.prototype.decryptContent.call(this, data, pwd, sMsg);
        if (!content) {
            throw Error("failed to decrypt message content: " + sMsg)
        }
        if (content instanceof FileContent) {
            var iMsg = InstantMessage.newMessage(content, sMsg.envelope);
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
        var env = Envelope.newEnvelope(user.identifier, receiver, 0);
        var iMsg = InstantMessage.newMessage(content, env);
        return this.sendMessage(iMsg, callback, split)
    };
    Messenger.prototype.sendMessage = function(msg, callback, split) {
        if (msg instanceof InstantMessage) {
            return send_instant_message.call(this, msg, callback, split)
        } else {
            if (msg instanceof ReliableMessage) {
                return send_reliable_message.call(this, msg, callback)
            } else {
                throw TypeError("message error: " + msg)
            }
        }
    };
    var send_instant_message = function(iMsg, callback, split) {
        var facebook = this.getFacebook();
        var receiver = iMsg.envelope.receiver;
        receiver = facebook.getIdentifier(receiver);
        var sMsg = this.encryptMessage(iMsg);
        var rMsg = this.signMessage(sMsg);
        var ok = true;
        if (split && receiver.isGroup()) {
            var messages = null;
            var members = facebook.getMembers(receiver);
            if (members && members.length > 0) {
                messages = rMsg.split(members)
            }
            if (messages) {
                for (var i = 0; i < messages.length; ++i) {
                    if (send_reliable_message.call(this, messages[i], callback)) {
                        ok = false
                    }
                }
            } else {
                ok = send_reliable_message.call(this, rMsg, callback)
            }
        } else {
            ok = send_reliable_message.call(this, rMsg, callback)
        }
        if (!this.saveMessage(iMsg)) {
            return false
        }
        return ok
    };
    var send_reliable_message = function(rMsg, callback) {
        var handler = CompletionHandler.newHandler(function() {
            callback.onFinished(rMsg, null)
        }, function(error) {
            callback.onFinished(error)
        });
        var data = this.serializeMessage(rMsg);
        return this.delegate.sendPackage(data, handler)
    };
    Messenger.prototype.saveMessage = function(iMsg) {
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.suspendMessage = function(msg) {
        console.assert(false, "implement me!");
        return false
    };
    Messenger.prototype.onReceivePackage = function(data) {
        var rMsg = this.deserializeMessage(data);
        if (!rMsg) {
            return null
        }
        rMsg = this.processReliableMessage(rMsg);
        if (!rMsg) {
            return null
        }
        return this.serializeMessage(rMsg)
    };
    Messenger.prototype.processReliableMessage = function(rMsg) {
        var sMsg = this.verifyMessage(rMsg);
        if (!sMsg) {
            return null
        }
        sMsg = this.processSecureMessage(sMsg);
        if (!sMsg) {
            return null
        }
        return this.signMessage(sMsg)
    };
    Messenger.prototype.processSecureMessage = function(sMsg) {
        var iMsg = this.decryptMessage(sMsg);
        if (!iMsg) {
            return null
        }
        iMsg = this.processInstantMessage(iMsg);
        if (!iMsg) {
            return null
        }
        return this.encryptMessage(iMsg)
    };
    Messenger.prototype.processInstantMessage = function(iMsg) {
        var facebook = this.getFacebook();
        var content = iMsg.content;
        var env = iMsg.envelope;
        var sender = facebook.getIdentifier(env.sender);
        var res = this.cpu.process(content, sender, iMsg);
        if (!this.saveMessage(iMsg)) {
            return null
        }
        if (!res) {
            return null
        }
        var receiver = facebook.getIdentifier(env.receiver);
        var user = select.call(this, receiver);
        env = Envelope.newEnvelope(user.identifier, sender, 0);
        return InstantMessage.newMessage(res, env)
    };
    ns.Messenger = Messenger;
    ns.register("Messenger")
}(DIMP);
