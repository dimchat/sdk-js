;

//
//  Test Cases
//
plugins_tests = [];

!function (ns) {
    'use strict';

    var Meta                  = ns.protocol.Meta;
    var CompatibleMetaFactory = ns.mkm.CompatibleMetaFactory;

    ns.registerPlugins();

    Meta.setFactory('1', new CompatibleMetaFactory('1'));
    Meta.setFactory('2', new CompatibleMetaFactory('2'));
    Meta.setFactory('4', new CompatibleMetaFactory('4'));
    Meta.setFactory(Meta.MKM, new CompatibleMetaFactory(Meta.MKM));
    Meta.setFactory(Meta.BTC, new CompatibleMetaFactory(Meta.BTC));
    Meta.setFactory(Meta.ETH, new CompatibleMetaFactory(Meta.ETH));

}(DIMP);

!function (ns) {
    'use strict';

    var moky = ns.format.UTF8.encode('moky');

    var test_sha256 = function () {
        // sha256（moky）= cb98b739dd699aa44bb6ebba128d20f2d1e10bb3b4aa5ff4e79295b47e9ed76d
        var exp = 'cb98b739dd699aa44bb6ebba128d20f2d1e10bb3b4aa5ff4e79295b47e9ed76d';
        var hash = ns.digest.SHA256.digest(moky);
        var res = ns.format.Hex.encode(hash);
        console.log('sha256(moky) = ' + res);
        assert(res === exp, 'sha256 error');
    };
    plugins_tests.push(test_sha256);

    var test_ripemd160 = function () {
        // ripemd160(moky) = 44bd174123aee452c6ec23a6ab7153fa30fa3b91
        var exp = '44bd174123aee452c6ec23a6ab7153fa30fa3b91';
        var hash = ns.digest.RIPEMD160.digest(moky);
        var res = ns.format.Hex.encode(hash);
        console.log('ripemd160(moky) = ' + res);
        assert(res === exp, 'ripemd160 error');
    };
    plugins_tests.push(test_ripemd160);

    var test_keccak = function (string, expect) {
        var data = ns.format.UTF8.encode(string);
        var hash = ns.digest.KECCAK256.digest(data);
        var res = ns.format.Hex.encode(hash);
        console.log('keccak256(' + string + ') = ' + res);
        assert(res === expect, 'keccak256 error');
    };
    var test_keccak256 = function () {
        test_keccak("moky", "96b07f3103d45cc7df2dd6e597922a17f48c86257dffe790d442bbd1ff46514d");
        test_keccak("hello", "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8");
        test_keccak("abc", "4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45");

        test_keccak("0450863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b23522cd470243453a299fa9e77237716103abc11a1df38855ed6f2ee187e9c582ba6",
            "fc12ad814631ba689f7abe671016f75c54c607f082ae6b0881fac0abeda21781");

//        test_keccak("044a18c2c740f49a77b289e9270c39948b9410a1b0c981d9af068c06239363d72682fdb022fef67f4f8a69582f983ab394ab5f06854c25f33d8ef1352fe7fe504d",
//                "24602722816b6cad0e143ce9fabf31f6026ec622");
    };
    plugins_tests.push(test_keccak256);

}(MONKEY);

!function (ns) {
    'use strict';

    var moky = ns.format.UTF8.encode('moky');

    var test_base58 = function () {
        // base58(moky) = 3oF5MJ
        var exp = '3oF5MJ';
        var res = ns.format.Base58.encode(moky);
        console.log('base58(moky) = ' + res);
        assert(res === exp, 'base58 error');
    };
    plugins_tests.push(test_base58);

    var test_base64 = function () {
        // base64(moky) = bW9reQ==
        var exp = 'bW9reQ==';
        var res = ns.format.Base64.encode(moky);
        console.log('base64(moky) = ' + res);
        assert(res === exp, 'base58 error');
    };
    plugins_tests.push(test_base64);

}(MONKEY);

!function (ns) {
    'use strict';

    var PublicKey = ns.crypto.PublicKey;
    var PrivateKey = ns.crypto.PrivateKey;

    var moky = ns.format.UTF8.encode('moky');

    var test_keys = function (pri, pub) {
        var pub_key = {
            'algorithm': 'ECC',
            'data': pub
        };
        var pri_key = {
            'algorithm': 'ECC',
            'data': pri
        };

        pub_key = PublicKey.parse(pub_key);
        pri_key = PrivateKey.parse(pri_key);
        console.log(pub_key, pri_key);

        var pk = pri_key.getPublicKey();
        console.log('generate public key from private key', pk);

        var signature = pri_key.sign(moky);
        console.log('signature(moky) = ', signature);

        var ok1 = pk.verify(moky, signature);
        var ok2 = pub_key.verify(moky, signature);
        assert(ok1 && ok2, 'ECC error');

    };

    var test_ecc = function () {
        test_keys('de97fdbdb823a197603e1f2cb8b1bded3824147e88ebd47367ba82d4b5600d73',
            '047c91259636a5a16538e0603636f06c532dd6f2bb42f8dd33fa0cdb39546cf449612f3eaf15db9443b7e0668ef22187de9059633eb23112643a38771c630db911');
    };
    plugins_tests.push(test_ecc);

}(MONKEY);

!function (ns) {
    'use strict';

    var Arrays = ns.type.Arrays;
    var Password = ns.crypto.Password;

    var moky = ns.format.UTF8.encode('moky');

    var test_password = function () {
        var extra_params = {};
        var pwd = Password.generate('Hello world!');
        var ciphertext = pwd.encrypt(moky, extra_params);
        var plaintext = pwd.decrypt(ciphertext, extra_params);
        assert(Arrays.equals(plaintext, moky), 'generate password error');
    };
    plugins_tests.push(test_password);

}(MONKEY);

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
            "type": 1,
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

        var json = ns.format.JSON.encode(key.toMap());
        var data = ns.format.UTF8.encode(json);

        var ciphertext;
        for (var i = 0; i < 10000; ++i) {
            ciphertext = meta.getPublicKey().encrypt(data, null);
            if (ciphertext.length !== 128) {
                throw new Error('encrypt error');
            }
        }
    };
    plugins_tests.push(test_encrypt_key);

}(MingKeMing);
