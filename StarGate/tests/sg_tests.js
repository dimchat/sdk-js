;

//
//  Test Cases
//
sg_tests = [];

var g_variables = {};

(function (ns, sys) {
    'use strict';

    var Class             = sys.type.Class;
    var Log               = ns.type.Log;
    var UTF8              = sys.format.UTF8;
    var InetSocketAddress = ns.type.InetSocketAddress;
    var PorterDelegate    = ns.port.PorterDelegate;
    var ClientHub         = ns.ws.ClientHub;
    var WSClientGate      = ns.WSClientGate;

    var Client = function (remote, local) {
        Object.call(this);
        this.remoteAddress = remote;
        this.localAddress = local;
        var gate = new WSClientGate(this);
        var hub = new ClientHub(gate);
        gate.setHub(hub);
        this.gate = gate;
        this.hub = hub;
    };
    Class(Client, Object, [PorterDelegate], null);

    Client.prototype.start = function () {
        this.hub.connect(this.remoteAddress, this.localAddress);
        this.gate.start();
    };

    Client.prototype.stop = function () {
        this.gate.stop();
    };

    Client.prototype.send = function (data) {
        var ok = this.gate.sendMessage(data, this.remoteAddress, this.localAddress);
        Log.info('send message', ok);
    };

    //
    //  Docker Delegate
    //

    // Override
    Client.prototype.onPorterStatusChanged = function (previous, current, porter) {
        var remote = porter.getRemoteAddress();
        if (remote) remote = remote.toString();
        if (previous) previous = previous.toString();
        if (current) current = current.toString();
        Log.warning('!!! docker state changed: ', previous, current, remote);
    };

    // Override
    Client.prototype.onPorterReceived = function (arrival, porter) {
        var remote = porter.getRemoteAddress();
        if (remote) remote = remote.toString();
        var data = arrival.getPayload();
        var text = UTF8.decode(data);
        Log.warning('<<< docker received: ', data.length + ' bytes', text, remote);
    };

    // Override
    Client.prototype.onPorterSent = function (departure, porter) {
        // plain departure has no response,
        // we would not know whether the task is success here
        var remote = porter.getRemoteAddress();
        if (remote) remote = remote.toString();
        var data = departure.getPayload();
        Log.warning('>>> docker sent: ', data.length + ' bytes', remote);
    };

    // Override
    Client.prototype.onPorterFailed = function (error, departure, porter) {
        var remote = porter.getRemoteAddress();
        if (remote) remote = remote.toString();
        Log.error('!!! docker failed: ', error, departure, remote);
    };

    // Override
    Client.prototype.onPorterError = function (error, departure, porter) {
        var remote = porter.getRemoteAddress();
        if (remote) remote = remote.toString();
        Log.error('!!! docker error: ', error, departure, remote);
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
