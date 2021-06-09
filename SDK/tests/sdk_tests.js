;

!function (ns) {
    'use strict';

    var Facebook = ns.Facebook;

    var ClientFacebook = function () {
        Facebook.call(this);
    };
    ns.Class(ClientFacebook, Facebook, null);

    ClientFacebook.prototype.getMeta = function (identifier) {
    };

    ns.ClientFacebook = ClientFacebook;

}(DIMSDK);

//
//  Test Cases
//
sdk_tests = [];

!function (ns) {
    'use strict';

    var ID = ns.protocol.ID;

    var PlainKey = ns.crypto.PlainKey;

    var TextContent = ns.protocol.TextContent;
    var Envelope = ns.protocol.Envelope;
    var InstantMessage = ns.protocol.InstantMessage;

    var KeyStore = ns.KeyStore;
    var ClientFacebook = ns.ClientFacebook;

    var MessagePacker = ns.MessagePacker;
    var MessageProcessor = ns.MessageProcessor;
    var MessageTransmitter = ns.MessageTransmitter;
    var Messenger = ns.Messenger;

    var key_cache = new KeyStore();
    var barrack = new ClientFacebook();

    var transceiver = new Messenger();
    transceiver.setCipherKeyDelegate(key_cache);
    transceiver.setEntityDelegate(barrack);
    transceiver.setPacker(new MessagePacker(transceiver));
    transceiver.setProcessor(new MessageProcessor(transceiver));
    transceiver.setTransmitter(new MessageTransmitter(transceiver));

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
        // test
        var content = new TextContent('Hello world!');
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

}(DIMSDK);

!function (ns) {
    'use strict';

    var test_cpu = function () {
        return 'not test yet';
    };
    sdk_tests.push(test_cpu);

}(DIMSDK);
