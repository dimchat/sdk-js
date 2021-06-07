;

//
//  Test Cases
//
sg_tests = [];

var g_variables = {};

(function (ns, sys) {
    'use strict';

    var Thread = sys.threading.Thread;

    var ActiveConnection = ns.ActiveConnection;
    var WSGate = ns.WSGate;

    var StarTrek = function (connection) {
        WSGate.call(this, connection);
    };
    sys.Class(StarTrek, WSGate, null);

    StarTrek.createGate = function (host, port) {
        var conn = new ActiveConnection(host, port);
        var gate = new StarTrek(conn);
        conn.setDelegate(gate);
        return gate;
    };

    StarTrek.prototype.start = function () {
        this.connection.start();
        WSGate.prototype.start.call(this);
    };

    StarTrek.prototype.finish = function () {
        WSGate.prototype.finish.call(this);
        this.connection.stop();
    };

    var test_connection = function () {

        var host = '127.0.0.1';
        // var host = '106.52.25.169';
        var port = 9394;

        var gate = StarTrek.createGate(host, port);
        gate.start();
        g_variables['gate'] = gate;

        var text = 'PING';
        var data = sys.format.UTF8.encode(text);
        setTimeout(function () {
            gate.send(data);
        }, 2000);
    };
    sg_tests.push(test_connection);

})(StarGate, MONKEY);
