;

//
//  Test Cases
//
plugins_tests = [];

!function (ns) {
    'use strict';

    var ID = ns.protocol.ID;

    var Immortals = ns.Immortals;

    var immortals;

    var test_immortals = function () {

        immortals = new Immortals();

        var moki = Immortals.MOKI;
        var hulk = Immortals.HULK;

        var moky = ID.parse('moky@4DnqXWdTV8wuZgfqSCX9GjE2kNq7HJrUgQ');

        log('moky ID: ' + moky + ' (' + moky.getType() + ')');
        log('moki ID: ' + moki + ' (' + moki.getType() + ')');
        log('hulk ID: ' + hulk + ' (' + hulk.getType() + ')');

        var moki_meta = immortals.getMeta(moki);
        var hulk_meta = immortals.getMeta(hulk);

        var moki_sk = immortals.getPrivateKeyForSignature(moki);
        var hulk_sk = immortals.getPrivateKeyForSignature(hulk);

        var moki_pk = moki_meta.key;
        var hulk_pk = hulk_meta.key;

        assert(moki_pk.matches(moki_sk) === true, 'keys not match');
        assert(hulk_pk.matches(hulk_sk) === true, 'keys not match');

        var str = 'moky';
        var data;
        var signature;

        data = ns.format.UTF8.encode(str);
        signature = moki_sk.sign(data);
        assert(moki_pk.verify(data, signature) === true, 'verify error');

    };
    plugins_tests.push(test_immortals);

}(DIMP);

!function (ns) {
    'use strict';

    var SymmetricKey = ns.crypto.SymmetricKey;

    var Meta = ns.protocol.Meta;

    var test_encrypt_key = function () {
        var key = {
            "algorithm": "AES",
            "data": "7uAlY2VZr9VaEexUg1gAeFrLhDheE8GITZLsFJHtLxQ=",
            "iv": "BMqauKb8kV1LwpDkStPWIQ=="
        };
        key = SymmetricKey.parse(key);

        // var receiver = "chatroom-admin@2Pc5gJrEQYoz9D9TJrL35sA3wvprNdenPi7";

        var meta = {
            "version": 1,
            "seed": "chatroom-admin",
            "key": {
                "algorithm": "RSA",
                "data": "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9qlgQ8iT1R+ID/JpIai/dF6Sc\nm3i/WLQrL1AI0qqN6UzEBBB9guJEPFKrnHDrtU04W0f/QtO2ifnhAbSlW4evwMSt\nLsRy6SWxPvG0tUKCBA+S9dYQLUwlLNtmw5fhF6f/1Iz9DOIvk+Ab0MPXRCjdtTNV\nvmnHZTqGoDAI/crRqQIDAQAB\n-----END PUBLIC KEY-----",
                "mode": "ECB",
                "padding": "PKCS1",
                "digest": "SHA256"
            },
            "fingerprint": "QY9SoCopLFBYcoa6IWd5x16Uf+VEAGiFCy34USlNOyVJr7MWJrGFONVtQDxhNzLVOV3xeSyY+VAr8mRFsyZILASQf+iWdrPUJMFAqryRsh1RLVVm7KY+1gDyL9/Xz1bzUKQ7V1h0uIzXWsZpAehBng7KZTN1zXth+ViXyF55rFM="
        };
        meta = Meta.parse(meta);

        var json = ns.format.JSON.encode(key.getMap());

        var ciphertext;
        for (var i = 0; i < 10000; ++i) {
            ciphertext = meta.key.encrypt(json);
            if (ciphertext.length !== 128) {
                throw Error('encrypt error');
            }
        }
    };
    plugins_tests.push(test_encrypt_key);

    // var test_base64 = function () {
    //     var base64 = '1iA92/Bp8VXctd/qSvpy7UWaRY6V87mILdljM+79MfFT3NnbQuxs5OEkcsbwAfBlcOK3Uk6t/tcm3yxjrF8BeWVj4IyWK1e81jDwL+kAn8nDDtTlg1E/xm86HdmOEVO9+yeI63kTIkHZ1zLwxShoXdtP9zdCHBVWNLTwJsdpAg==';
    //     var data = ns.format.Base64.decode(base64);
    //     assert(data.length === 128, 'base64 error');
    // };
    // plugins_tests.push(test_base64);

}(DIMP);
