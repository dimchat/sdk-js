;

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;

    var Immortals = ns.Immortals;

    var ClientFacebook = function () {
        Facebook.call(this);
        if (typeof Immortals === 'function') {
            this.immortals = new Immortals();
        } else {
            this.immortals = null;
        }
    };
    ns.Class(ClientFacebook, Facebook, null);

    ClientFacebook.prototype.getMeta = function (identifier) {
        if (this.immortals) {
            return this.immortals.getMeta(identifier);
        }
    };

    ns.ClientFacebook = ClientFacebook;

}(DIMP);

//
//  Test Cases
//
sdk_tests = [];

!function (ns) {
    'use strict';

    var ID = ns.ID;

    var PlainKey = ns.plugins.PlainKey;

    var TextContent = ns.protocol.TextContent;
    var Envelope = ns.Envelope;
    var InstantMessage = ns.InstantMessage;

    var KeyStore = ns.KeyStore;
    var ClientFacebook = ns.ClientFacebook;
    var Messenger = ns.Messenger;

    var key_cache;
    var barrack;
    var transceiver;

    var hulk = ID.getInstance('hulk@4YeVEN3aUnvC1DNUufCq1bs9zoBSJTzVEj');
    var moki = ID.getInstance('moki@4WDfe3zZ4T7opFSi3iDAKiuTnUHjxmXekk');

    var sender = hulk;
    var receiver = ID.EVERYONE;

    var test_key_store = function () {
        key_cache = new KeyStore();
        // get key
        var key = key_cache.getCipherKey(sender, receiver);
        log('plain key: ', key);
        assert(key instanceof PlainKey, 'broadcast key error');
    };
    sdk_tests.push(test_key_store);

    var test_facebook = function () {
        barrack = new ClientFacebook();
        // get user
        var user = barrack.getUser(sender);
        log('user: ', user);
        assert(user.identifier.isUser() === true, 'user error');
        barrack.getLocalUsers = function () {
            return [user];
        };
        // get group
        var group = barrack.getUser(receiver);
        log('group: ', group);
        assert(group.identifier.isGroup() === true, 'group error');
    };
    sdk_tests.push(test_facebook);

    var test_messenger = function () {
        transceiver = new Messenger();
        transceiver.cipherKeyDelegate = key_cache;
        transceiver.entityDelegate = barrack;
        // test
        var content = new TextContent('Hello world!');
        log('content: ', content);
        var env = Envelope.newEnvelope(sender, receiver, 0);
        log('envelope: ', env);
        var iMsg = InstantMessage.newMessage(content, env);
        log('instant message: ', iMsg);

        var sMsg = transceiver.encryptMessage(iMsg);
        log('secure message: ', sMsg);
        var nMsg = transceiver.decryptMessage(sMsg);
        log('decrypt message: ', nMsg);
        nMsg.setValue('type', null);
        assert(nMsg.content.equals(iMsg.content) === true, 'decrypt failed');
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
