# Decentralized Instant Messaging (JavaScript SDK)

[![License](https://img.shields.io/github/license/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dimchat/sdk-js/pulls)
[![Platform](https://img.shields.io/badge/Platform-ECMAScript%205.1-brightgreen.svg)](https://github.com/dimchat/sdk-js/wiki)
[![Issues](https://img.shields.io/github/issues/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/issues)
[![Repo Size](https://img.shields.io/github/repo-size/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/archive/refs/heads/main.zip)
[![Tags](https://img.shields.io/github/tag/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/tags)

[![Watchers](https://img.shields.io/github/watchers/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/watchers)
[![Forks](https://img.shields.io/github/forks/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/forks)
[![Stars](https://img.shields.io/github/stars/dimchat/sdk-js)](https://github.com/dimchat/sdk-js/stargazers)
[![Followers](https://img.shields.io/github/followers/dimchat)](https://github.com/orgs/dimchat/followers)

## Dependencies

* Latest Versions

| Name | Version | Description |
|------|---------|-------------|
| [Cryptography](https://github.com/dimchat/mkm-js) | [![Tags](https://img.shields.io/github/tag/dimchat/mkm-js)](https://github.com/dimchat/mkm-js) | Crypto Keys |
| [Ming Ke Ming (名可名)](https://github.com/dimchat/mkm-js) | [![Tags](https://img.shields.io/github/tag/dimchat/mkm-js)](https://github.com/dimchat/mkm-js) | Decentralized User Identity Authentication |
| [Dao Ke Dao (道可道)](https://github.com/dimchat/dkd-js) | [![Tags](https://img.shields.io/github/tag/dimchat/dkd-js)](https://github.com/dimchat/dkd-js) | Universal Message Module |
| [DIMP (去中心化通讯协议)](https://github.com/dimchat/core-js) | [![Tags](https://img.shields.io/github/tag/dimchat/core-js)](https://github.com/dimchat/core-js) | Decentralized Instant Messaging Protocol |

## Extensions

### Content

extends [CustomizedContent](https://github.com/dimchat/core-js#extends-content)

### ContentProcessor

```javascript
/**
 *  Customized Content Processing Unit
 *  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Handle content for application customized
 */
app.cpu.AppCustomizedProcessor = function (facebook, messenger) {
    CustomizedContentProcessor.call(this, facebook, messenger);
    this.__handlers = {};  // String => CustomizedContentHandler
};
var AppCustomizedProcessor = app.cpu.AppCustomizedProcessor;

Class(AppCustomizedProcessor, CustomizedContentProcessor, null);

AppCustomizedProcessor.prototype.setHandler = function (app, mod, handler) {
    this.__handlers[app + ':' + mod] = handler;
};

// protected
AppCustomizedProcessor.prototype.getHandler = function (app, mod) {
    return this.__handlers[app + ':' + mod];
};

// Override
AppCustomizedProcessor.prototype.filter = function (app, mod, content, rMsg) {
    var handler = this.getHandler(app, mod);
    if (handler) {
        return handler;
    }
    // default handler
    return CustomizedContentProcessor.prototype.filter.call(this, app, mod, content, rMsg);
};
```

```javascript
/*  Command Transform:

    +===============================+===============================+
    |      Customized Content       |      Group Query Command      |
    +-------------------------------+-------------------------------+
    |   "type" : i2s(0xCC)          |   "type" : i2s(0x88)          |
    |   "sn"   : 123                |   "sn"   : 123                |
    |   "time" : 123.456            |   "time" : 123.456            |
    |   "app"  : "chat.dim.group"   |                               |
    |   "mod"  : "history"          |                               |
    |   "act"  : "query"            |                               |
    |                               |   "command"   : "query"       |
    |   "group"     : "{GROUP_ID}"  |   "group"     : "{GROUP_ID}"  |
    |   "last_time" : 0             |   "last_time" : 0             |
    +===============================+===============================+
 */
app.cpu.GroupHistoryHandler = function (facebook, messenger) {
    BaseCustomizedHandler.call(this, facebook, messenger);
};
var GroupHistoryHandler = app.cpu.GroupHistoryHandler;

Class(GroupHistoryHandler, BaseCustomizedHandler, null);

// Override
GroupHistoryHandler.prototype.handleAction = function (act, sender, content, rMsg) {
    if (content.getGroup() === null) {
        var text = 'Group command error.';
        return this.respondReceipt(text, rMsg.getEnvelope(), content, null);
    } else if (GroupHistory.ACT_QUERY === act) {
        return transformQueryCommand.call(this, content, rMsg);
    }
    return BaseCustomizedHandler.prototype.handleAction.call(this, act, sender, content, rMsg);
};

var transformQueryCommand = function (content, rMsg) {
    var transceiver = this.getMessenger();
    if (!transceiver) {
        return [];
    }
    var info = content.copyMap(false);
    info['type'] = ContentType.COMMAND;
    info['command'] = GroupCommand.QUERY;
    var query = Content.parse(info);
    if (Interface.conforms(query, QueryCommand)) {
        return transceiver.processContent(query, rMsg);
    }
    var text = 'Query command error.';
    return this.respondReceipt(text, rMsg.getEnvelope(), content, null);
};
```

### ContentProcessorCreator

```javascript
app.cpu.ClientContentProcessorCreator = function (facebook, messenger) {
    BaseContentProcessorCreator.call(this, facebook, messenger);
};
var ClientContentProcessorCreator = app.cpu.ClientContentProcessorCreator;

Class(ClientContentProcessorCreator, BaseContentProcessorCreator, null);

Implementation(ClientContentProcessorCreator, {

    // protected
    createCustomizedContentProcessor: function (facebook, messenger) {
        var cpu = new AppCustomizedProcessor(facebook, messenger);

        // 'chat.dim.group:history'
        cpu.setHandler(
            GroupHistory.APP,
            GroupHistory.MOD,
            new GroupHistoryHandler(facebook, messenger)
        );

        return cpu;
    },

    // Override
    createContentProcessor: function (type) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        switch (type) {

            // application customized
            case ContentType.APPLICATION:
            case 'application':
            case ContentType.CUSTOMIZED:
            case 'customized':
                return this.createCustomizedContentProcessor(facebook, messenger);

            // ...
        }
        // others
        return BaseContentProcessorCreator.prototype.createContentProcessor.call(this, type);
    },

    // Override
    createCommandProcessor: function (type, cmd) {
        var facebook = this.getFacebook();
        var messenger = this.getMessenger();
        switch (cmd) {
        
            // handshake
            case Command.HANDSHAKE:
                return new HandshakeCommandProcessor(facebook, messenger);
                
            // ...
        }
        // others
        return BaseContentProcessorCreator.prototype.createCommandProcessor.call(this, type, cmd);
    }
});
```

## Usage

To let your **AppCustomizedProcessor** start to work,
you must override ```BaseContentProcessorCreator``` for message types:

1. ContentType.APPLICATION 
2. ContentType.CUSTOMIZED

and then set your **creator** for ```GeneralContentProcessorFactory``` in the ```MessageProcessor```.

----

Copyright &copy; 2023-2025 Albert Moky
[![Followers](https://img.shields.io/github/followers/moky)](https://github.com/moky?tab=followers)
