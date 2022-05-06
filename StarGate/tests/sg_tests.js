;

//
//  Test Cases
//
sg_tests = [];

var g_variables = {};

(function (ns, sys) {
    'use strict';

    var ActiveConnection = ns.socket.ActiveConnection;
    var InetSocketAddress = ns.type.InetSocketAddress;
    var StarGate = ns.StarGate;
    var StreamClientHub = ns.ws.StreamClientHub;

    var StarTrek = function (connection) {
        StarGate.call(this, connection);
    };
    sys.Class(StarTrek, StarGate, null);

    StarTrek.createGate = function (host, port) {
        var conn = new ActiveConnection(host, port);
        var gate = new StarTrek(conn);
        conn.setDelegate(gate);
        return gate;
    };

    var test_connection = function () {

        var host = '127.0.0.1';
        // var host = '106.52.25.169';
        var port = 9394;

        var remote = new InetSocketAddress(host, port);

        var gate = StarTrek.createGate(host, port);
        // gate.start();
        g_variables['gate'] = gate;

        var text = 'PING';
        var data = sys.format.UTF8.encode(text);
        setTimeout(function () {
            gate.sendData(data, remote, null);
        }, 2000);
    };
    sg_tests.push(test_connection);

})(StarGate, MONKEY);
