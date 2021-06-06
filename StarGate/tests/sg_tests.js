;

//
//  Test Cases
//
sg_tests = [];

var g_variables = {};

!function (ns) {
    'use strict';

    var Connection = ns.Connection;
    var ActiveConnection = ns.ActiveConnection;

    var ConnectionDelegate = function () {
    };
    DIMP.Class(ConnectionDelegate, null, [Connection.Delegate]);
    ConnectionDelegate.prototype.onConnectionStatusChanged = function (connection, oldStatus, newStatus) {
        console.log('connection status changed: ' + oldStatus + ' -> ' + newStatus);
    };
    ConnectionDelegate.prototype.onConnectionReceivedData = function (connection, data) {
        console.log('connection received data: ' + data.length + ' byte(s)');
    };

    var test_connection = function () {

        var host = '127.0.0.1';
        // var host = '106.52.25.169';
        var port = 9394;

        var text = 'Hello world!\n';
        var data = DIMP.format.UTF8.encode(text);

        var connection = new ActiveConnection(host, port);
        connection.start();
        setTimeout(function () {
            connection.send(data);
        }, 2000);
        g_variables['connection'] = connection;
    };
    sg_tests.push(test_connection);

}(StarTrek);
