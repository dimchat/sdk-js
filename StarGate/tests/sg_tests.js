;

//
//  Test Cases
//
sg_tests = [];

var g_variables = {};

(function (ns, sys) {
    'use strict';

    var UTF8 = sys.format.UTF8;
    var InetSocketAddress = ns.type.InetSocketAddress;
    var DockerDelegate = ns.port.DockerDelegate;
    var StreamClientHub = ns.ws.StreamClientHub;
    var WSGate = ns.WSGate;

    var Client = function (remote, local) {
        Object.call(this);
        this.remoteAddress = remote;
        this.localAddress = local;
        var gate = new WSGate(this);
        var hub = new StreamClientHub(gate);
        gate.setHub(hub);
        this.gate = gate;
    };
    sys.Class(Client, Object, [DockerDelegate], null);

    Client.prototype.start = function () {
        this.gate.start();
    };

    Client.prototype.stop = function () {
        this.gate.stop();
    };

    Client.prototype.send = function (data) {
        this.gate.sendMessage(data, this.remoteAddress, this.localAddress);
    };

    //
    //  Docker Delegate
    //

    // Override
    Client.prototype.onDockerStatusChanged = function (previous, current, docker) {
        var remote = docker.getRemoteAddress();
        if (remote) remote = remote.toString();
        if (previous) previous = previous.toString();
        if (current) current = current.toString();
        console.info('!!! docker state changed: ', previous, current, remote);
    };

    // Override
    Client.prototype.onDockerReceived = function (arrival, docker) {
        var remote = docker.getRemoteAddress();
        if (remote) remote = remote.toString();
        var data = arrival.getPackage();
        var text = UTF8.decode(data);
        console.info('<<< docker received: ', data.length + ' bytes', text, remote);
    };

    // Override
    Client.prototype.onDockerSent = function (departure, docker) {
        // plain departure has no response,
        // we would not know whether the task is success here
    };

    // Override
    Client.prototype.onDockerFailed = function (error, departure, docker) {
        var remote = docker.getRemoteAddress();
        if (remote) remote = remote.toString();
        console.error('!!! docker failed: ', error, departure, remote);
    };

    // Override
    Client.prototype.onDockerError = function (error, departure, docker) {
        var remote = docker.getRemoteAddress();
        if (remote) remote = remote.toString();
        console.error('!!! docker error: ', error, departure, remote);
    };

    var test_connection = function () {

        var host = '127.0.0.1';
        // var host = '106.52.25.169';
        var port = 9394;

        var remote = new InetSocketAddress(host, port);

        var client = new Client(remote, null);
        client.start();

        g_variables['client'] = client;

        var text = 'PING';
        var data = sys.format.UTF8.encode(text);
        setTimeout(function () {
            client.send(data);
        }, 2000);
    };
    sg_tests.push(test_connection);

})(StarTrek, MONKEY);
