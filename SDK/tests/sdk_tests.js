;

!function (ns) {
    'use strict';

    ns.registerAllFactories();

}(DIMP);

!function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Facebook = ns.Facebook;

    var ClientFacebook = function () {
        Facebook.call(this);
    };
    Class(ClientFacebook, Facebook, null, {

        // Override
        getMeta: function (identifier) {
            // TODO:
        }
    });

    ns.ClientFacebook = ClientFacebook;

}(DIMP);

!function (ns) {
    'use strict';

    var Class = ns.type.Class;
    var Messenger = ns.Messenger;
    var MessagePacker = ns.MessagePacker;
    var MessageProcessor = ns.MessageProcessor;

    var ClientMessenger = function (facebook, keyCache) {
        Messenger.call(this);
        this.__facebook = facebook;
        this.__keyCache = keyCache;
        this.__packer = new MessagePacker(facebook, this);
        this.__processor = new MessageProcessor(facebook, this);
    };
    Class(ClientMessenger, Messenger, null, {
        // Override
        getEntityDelegate: function () {
            return this.__facebook;
        },
        // Override
        getCipherKeyDelegate: function () {
            return this.__keyCache;
        },
        // Override
        getPacker: function () {
            return this.__packer;
        },
        // Override
        getProcessor: function () {
            return this.__processor;
        }
    });

    ns.ClientMessenger = ClientMessenger;

    ns.registerAllFactories();

}(DIMP);

//
//  Test Cases
//
sdk_tests = [];

!function (ns) {
    'use strict';

    var ID = ns.protocol.ID;

    var PlainKey = ns.crypto.PlainKey;

    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;
    var BaseTextContent = ns.dkd.BaseTextContent;

    var KeyStore = ns.KeyStore;
    var ClientFacebook = ns.ClientFacebook;
    var ClientMessenger = ns.ClientMessenger;

    var key_cache = new KeyStore();
    var barrack = new ClientFacebook();

    var transceiver = new ClientMessenger(barrack, key_cache);

    var hulk = ID.parse('hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj');
    var moki = ID.parse('moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk');

    var sender = hulk;
    var receiver = ID.EVERYONE;

    var test_key_store = function () {
        // get key
        var key = key_cache.getCipherKey(sender, receiver);
        log('plain key: ', key);
        assert(key instanceof PlainKey, 'broadcast key error');
    };
    sdk_tests.push(test_key_store);

    var test_facebook = function () {
        // get user
        var user = barrack.getUser(sender);
        log('user: ', user);
        assert(user.getIdentifier().isUser() === true, 'user error');
        barrack.getLocalUsers = function () {
            return [user];
        };
        // get group
        var group = barrack.getUser(receiver);
        log('group: ', group);
        assert(group.getIdentifier().isGroup() === true, 'group error');
    };
    sdk_tests.push(test_facebook);

    var test_messenger = function () {
        // test
        var content = new BaseTextContent('Hello world!');
        log('content: ', content);
        var env = Envelope.create(sender, receiver, 0);
        log('envelope: ', env);
        var iMsg = InstantMessage.create(env, content);
        log('instant message: ', iMsg);

        var sMsg = transceiver.encryptMessage(iMsg);
        log('secure message: ', sMsg);
        var nMsg = transceiver.decryptMessage(sMsg);
        log('decrypt message: ', nMsg);
        nMsg.setValue('type', null);
        assert(nMsg.getContent().equals(iMsg.getContent()) === true, 'decrypt failed');
    };
    sdk_tests.push(test_messenger);

}(DIMP);

!function (ns) {
    'use strict';

    var test_cpu = function () {
        return 'not test yet';
    };
    sdk_tests.push(test_cpu);

}(DIMP);
