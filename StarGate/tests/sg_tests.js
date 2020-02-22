;

//
//  Test Cases
//
sg_tests = [];

!function (ns) {
    'use strict';

    var StarDelegate = ns.StarDelegate;
    var SocketClient = ns.extensions.SocketClient;

    var test_connection = function () {

        var options = {
            // host: '127.0.0.1',
            host: '134.175.87.98',
            port: 9394
        };

        var tasks = [];
        var item = tasks.pop();

        var delegate = new StarDelegate();
        delegate.onReceived = function (data, star) {
            console.log('received data: ' + data);
        };
        delegate.onStatusChanged = function (status, star) {
            console.log('status: ' + status);
        };

        var client = new SocketClient(delegate);
        client.launch(options);

        client.send('Hello world!\n');
    };
    sg_tests.push(test_connection);

}(StarGate);
