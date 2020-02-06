# Decentralized Instant Messaging (JavaScript SDK)


[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/dimchat/sdk-js/blob/master/LICENSE)
[![Version](https://img.shields.io/badge/alpha-0.1.0-red.svg)](https://github.com/dimchat/sdk-js/archive/master.zip)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dimchat/sdk-js/pulls)
[![Platform](https://img.shields.io/badge/Platform-ECMAScript%205.1-brightgreen.svg)](https://github.com/dimchat/sdk-js/wiki)


### Dependencies

1. DIMP - <https://github.com/dimchat/core-js/blob/master/DIMP/dist/dimp.js>
2. SDK - <https://github.com/dimchat/sdk-js/blob/master/SDK/dist/sdk.js>

Patches:

1. [Plugins for Crypto & Address, Meta](https://github.com/dimchat/sdk-js/blob/master/Plugins/dist/plugins.js)
2. [Extensions for local storage, notifications & connections](https://github.com/dimchat/sdk-js/blob/master/StarGate/dist/stargate.js)

All in one - <https://github.com/dimchat/sdk-js/blob/master/SDK/dist/all.js>

## Account

User private key, ID, meta, and profile are generated in client,
and broadcast only ```meta``` & ```profile``` onto DIM station.

### Register User Account

_Step 1_. generate private key (with asymmetric algorithm)

```javascript
var PrivateKey = DIMP.crypto.PrivateKey;

var sk = PrivateKey.generate(PrivateKey.RSA);
```

**NOTICE**: After registered, the client should save the private key in secret storage.

_Step 2_. generate meta with private key (and meta seed)

```javascript
var MetaType = DIMP.protocol.MetaType;
var Meta     = DIMP.Meta;

var seed = "username";
var meta = Meta.generate(MetaType.Default, sk, seed);
```

_Step 3_. generate ID with meta (and network type)

```javascript
var NetworkType = DIMP.protocol.NetworkType;

var identifier = meta.generateIdentifier(NetworkType.Main);
```

### Create and upload User Profile

_Step 4_. create profile with ID and sign with private key

```javascript
var Profile = DIMP.Profile;

var profile = new Profile(identifier);
// set nickname and avatar URL
profile.setName("Albert Moky");
profile.setProperty("avatar", "https://secure.gravatar.com/avatar/34aa0026f924d017dcc7a771f495c086");
// sign
profile.sign(privateKey);
```

_Step 5_. send meta & profile to station

```javascript
var ProfileCommand = DIMP.protocol.ProfileCommand;

var messenger = Messenger.getInstance();

var cmd = ProfileCommand.response(identifier, profile, meta);
messenger.sendCommand(cmd);
```

The profile should be sent to station after connected
and handshake accepted, details are provided in later chapters

## Connect and Handshake

_Step 1_. connect to DIM station (TCP)

_Step 2_. prepare for receiving message data package

```javascript
var onReceive = function (responseData) {
    var response = messenger.onReceivePackage(responseData);
    if (response != null && response.length > 0) {
        // send processing result back to the station
        send(response);
    }
}
```

_Step 3_. send first **handshake** command

(1) create handshake command

```javascript
var HandshakeCommand = DIMP.protocol.HandshakeCommand;

// first handshake will have no session key
var cmd = HandshakeCommand.start();
```

(2) pack, encrypt and sign

```javascript
var Envelope       = DIMP.Envelope;
var InstantMessage = DIMP.InstantMessage;

var env = Envelope.newEnvelope(userId, stationId);
var iMsg = InstantMessage.newMessage(cmd, env);
var sMsg = messenger.encryptMessage(iMsg);
var rMsg = messenger.signMessage(sMsg);
```

(3) Meta protocol

Attaching meta in the first message package is to make sure the station can find it,
particularly when it's first time the user connect to this station.

```javascript
rMsg.setMeta(user.getMeta());
```

(4) send out serialized message data package

```javascript
var data = messenger.serializeMessage(rMsg);
send(data);
```

_Step 4_. waiting handshake response

The CPU (Command Processing Units) will catch the handshake command response from station, and CPU will process them automatically, so just wait untill handshake success or network error.

## Message

### Content

* Text message

```javascript
var TextContent = DIMP.protocol.TextContent;

var content = new TextContent("Hey, girl!");
```

**NOTICE**: file message content (Image, Audio, Video)
will be sent out only includes the filename and a URL
where the file data (encrypted with the same symmetric key) be stored.

### Command

* Query meta with contact ID

```javascript
var MetaCommand = DIMP.protocol.MetaCommand;

var cmd = new MetaCommand(identifier);
```

* Query profile with contact ID

```javascript
var ProfileCommand = DIMP.protocol.ProfileCommand;

var cmd = new ProfileCommand(identifier);
```

### Send command

```javascript
/**
 *  Pack and send command to station
 *
 * @param cmd - command
 * @return true on success
 */
Messenger.prototype.sendCommand(Command cmd) {
    console.assert(server !== null, 'station not connect');
    return this.sendContent(cmd, server.identifier);
}
```

MetaCommand or ProfileCommand with only ID means querying, and the CPUs will catch and process all the response automatically.

## Command Processing Units

You can send a customized command (such as **search command**) and prepare a processor to handle the response.

### Search command processor

```javascript
var CommandProcessor = DIMP.cpu.CommandProcessor;

/**
 *  Search Command Processor
 */
var SearchCommandProcessor = function (messenger) {
    CommandProcessor.call(this, messenger);
};
SearchCommandProcessor.inherits(CommandProcessor);

//
//  Main
//
SearchCommandProcessor.prototype.process = function (cmd, sender, msg) {
	// TODO: 
};
```

### Handshake command processor

```javascript
/**
 *  Handshake Command Processor
 */
var HandshakeCommandProcessor = function (messenger) {
    CommandProcessor.call(this, messenger);
};
HandshakeCommandProcessor.inherits(CommandProcessor);

var success = function () {
    var session = this.getContext('session_key');
    var server = this.messenger.server;
    server.handshakeAccepted(session, true);
    return null;
};

var restart = function (session) {
    this.setContext('session_key', session);
    return new HandshakeCommand.restart(session)
};

//
//  Main
//
HandshakeCommandProcessor.prototype.process = function (cmd, sender, msg) {
    var message = cmd.getMessage();
    if (message === 'DIM!' || message === 'OK!') {
        // S -> C
        return success.call(this);
    } else if (message === 'DIM?') {
        // S -> C
        return restart.call(this, cmd.getSessionKey());
    } else {
        // C -> S: Hello world!
        throw Error('handshake command error: ' + cmd);
    }
};
```

And don't forget to register them.

```javascript
CommandProcessor.register(Command.HANDSHAKE, HandshakeCommandProcessor);
CommandProcessor.register(SearchCommand.SEARCH, SearchCommandProcessor);
CommandProcessor.register(SearchCommand.ONLINE_USERS, SearchCommandProcessor);
```

Copyright &copy; 2019 Albert Moky
