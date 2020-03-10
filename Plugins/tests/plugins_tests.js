;

//
//  Test Cases
//
plugins_tests = [];

!function (ns) {
    'use strict';

    var ID = ns.ID;

    var Immortals = ns.Immortals;

    var immortals;

    var test_immortals = function () {

        immortals = new Immortals();

        var moki = Immortals.MOKI;
        var hulk = Immortals.HULK;

        var moky = ID.getInstance('moky@4DnqXWdTV8wuZgfqSCX9GjE2kNq7HJrUgQ');

        log('moky ID: ' + moky + ' (' + moky.getNumber() + ')');
        log('moki ID: ' + moki + ' (' + moki.getNumber() + ')');
        log('hulk ID: ' + hulk + ' (' + hulk.getNumber() + ')');

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

        str = new ns.type.String(str, 'UTF-8');
        data = str.getBytes('UTF-8');
        signature = moki_sk.sign(data);
        assert(moki_pk.verify(data, signature) === true, 'verify error');

    };
    plugins_tests.push(test_immortals);

}(DIMP);

!function (ns) {
    'use strict';

}(DIMP);
