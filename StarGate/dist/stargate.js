/**
 *  DIM-SDK (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 3, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = {}
}
if (typeof StarGate !== "object") {
    StarGate = {}
}! function(sg, fsm) {
    if (typeof StarGate.extensions !== "object") {
        sg.extensions = {}
    }
    DIMP.namespace(fsm);
    DIMP.namespace(sg);
    DIMP.namespace(sg.extensions);
    sg.register("extensions")
}(StarGate, FiniteStateMachine);
! function(ns) {
    var Delegate = function() {};
    Delegate.prototype.enterState = function(state, machine) {
        console.assert(state !== null, "state empty");
        console.assert(machine !== null, "machine empty");
        console.assert(false, "implement me!")
    };
    Delegate.prototype.exitState = function(state, machine) {
        console.assert(state !== null, "state empty");
        console.assert(machine !== null, "machine empty");
        console.assert(false, "implement me!")
    };
    Delegate.prototype.pauseState = function(state, machine) {
        console.assert(state !== null, "state empty");
        console.assert(machine !== null, "machine empty")
    };
    Delegate.prototype.resumeState = function(state, machine) {
        console.assert(state !== null, "state empty");
        console.assert(machine !== null, "machine empty")
    };
    ns.StateDelegate = Delegate;
    ns.register("StateDelegate")
}(FiniteStateMachine);
! function(ns) {
    var Transition = function(targetStateName) {
        this.target = targetStateName
    };
    Transition.prototype.evaluate = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.assert(false, "implement me!");
        return false
    };
    ns.Transition = Transition;
    ns.register("Transition")
}(FiniteStateMachine);
! function(ns) {
    var State = function() {
        this.transitions = []
    };
    State.prototype.addTransition = function(transition) {
        if (this.transitions.contains(transition)) {
            throw Error("transition exists: " + transition)
        }
        this.transitions.push(transition)
    };
    State.prototype.tick = function(machine) {
        var transition;
        for (var i = 0; i < this.transitions.length; ++i) {
            transition = this.transitions[i];
            if (transition.evaluate(machine)) {
                machine.changeState(transition.target);
                break
            }
        }
    };
    State.prototype.onEnter = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.assert(false, "implement me!")
    };
    State.prototype.onExit = function(machine) {
        console.assert(machine !== null, "machine empty");
        console.assert(false, "implement me!")
    };
    State.prototype.onPause = function(machine) {
        console.assert(machine !== null, "machine empty")
    };
    State.prototype.onResume = function(machine) {
        console.assert(machine !== null, "machine empty")
    };
    ns.State = State;
    ns.register("State")
}(FiniteStateMachine);
! function(ns) {
    var Status = DIMP.type.Enum({
        Stopped: 0,
        Running: 1,
        Paused: 2
    });
    var Machine = function(defaultStateName) {
        this.defaultStateName = defaultStateName ? defaultStateName : "default";
        this.currentState = null;
        this.stateMap = {};
        this.status = Status.Stopped;
        this.delegate = null
    };
    Machine.prototype.addState = function(state, name) {
        this.stateMap[name] = state
    };
    Machine.prototype.changeState = function(name) {
        var state = this.currentState;
        if (state) {
            this.delegate.exitState(state, this);
            state.onExit(this)
        }
        state = this.stateMap[name];
        this.currentState = state;
        if (state) {
            this.delegate.enterState(state, this);
            state.onEnter(this)
        }
    };
    Machine.prototype.isRunning = function() {
        return this.status.equals(Status.Running)
    };
    Machine.prototype.tick = function() {
        if (this.isRunning()) {
            this.currentState.tick(this)
        }
    };
    Machine.prototype.start = function() {
        if (!this.status.equals(Status.Stopped) || this.currentState) {
            throw Error("FSM start error: " + this.status)
        }
        this.changeState(this.defaultStateName);
        this.status = Status.Running
    };
    Machine.prototype.stop = function() {
        if (this.status.equals(Status.Stopped) || !this.currentState) {
            throw Error("FSM stop error: " + this.status)
        }
        this.status = Status.Stopped;
        this.changeState(null)
    };
    Machine.prototype.pause = function() {
        if (!this.status.equals(Status.Running) || !this.currentState) {
            throw Error("FSM pause error: " + this.status)
        }
        this.delegate.pauseState(this.currentState, this);
        this.status = Status.Paused;
        this.currentState.onPause(this)
    };
    Machine.prototype.resume = function() {
        if (!this.status.equals(Status.Paused) || !this.currentState) {
            throw Error("FSM resume error: " + this.status)
        }
        this.delegate.resumeState(this.currentState, this);
        this.status = Status.Running;
        this.currentState.onResume(this)
    };
    ns.Machine = Machine;
    ns.register("Machine")
}(FiniteStateMachine);
! function(ns) {
    var Observer = function() {};
    Observer.prototype.onReceiveNotification = function(notification) {
        console.assert(notification !== null, "notification empty");
        console.assert(false, "implement me!")
    };
    ns.Observer = Observer;
    ns.register("Observer")
}(StarGate);
! function(ns) {
    var Notification = function(name, sender, userInfo) {
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo
    };
    ns.Notification = Notification;
    ns.register("Notification")
}(StarGate);
! function(ns) {
    var Notification = ns.Notification;
    var Center = function() {
        this.observerMap = {}
    };
    Center.prototype.addObserver = function(observer, name) {
        var list = this.observerMap[name];
        if (list) {
            if (list.contains(observer)) {
                return
            }
        } else {
            list = [];
            this.observerMap[name] = list
        }
        list.push(observer)
    };
    Center.prototype.removeObserver = function(observer, name) {
        if (name) {
            var list = this.observerMap[name];
            if (list) {
                list.remove(observer)
            }
        } else {
            var names = Object.keys(this.observerMap);
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i])
            }
        }
    };
    Center.prototype.postNotification = function(notification, sender, userInfo) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo)
        }
        var observers = this.observerMap[notification.name];
        if (!observers) {
            return
        }
        for (var i = 0; i < observers.length; ++i) {
            observers[i].onReceiveNotification(notification)
        }
    };
    var s_notification_center = null;
    Center.getInstance = function() {
        if (!s_notification_center) {
            s_notification_center = new Center()
        }
        return s_notification_center
    };
    ns.NotificationCenter = Center;
    ns.register("NotificationCenter")
}(StarGate);
! function(ns) {
    var Storage = function(storage, prefix) {
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = "dim"
        }
    };
    Storage.prototype.getItem = function(key) {
        return this.storage.getItem(key)
    };
    Storage.prototype.setItem = function(key, value) {
        this.storage.setItem(key, value)
    };
    Storage.prototype.removeItem = function(key) {
        this.storage.removeItem(key)
    };
    Storage.prototype.clear = function() {
        this.storage.clear()
    };
    Storage.prototype.getLength = function() {
        return this.storage.length
    };
    Storage.prototype.key = function(index) {
        return this.storage.key(index)
    };
    Storage.prototype.exists = function(path) {
        return !!this.getItem(this.ROOT + "." + path)
    };
    Storage.prototype.loadText = function(path) {
        return this.getItem(this.ROOT + "." + path)
    };
    Storage.prototype.loadData = function(path) {
        var base64 = this.loadText(path);
        if (!base64) {
            return null
        }
        return DIMP.format.Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function(path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return DIMP.format.JSON.decode(json)
    };
    Storage.prototype.remove = function(path) {
        this.removeItem(this.ROOT + "." + path);
        return true
    };
    Storage.prototype.saveText = function(text, path) {
        if (text) {
            this.setItem(this.ROOT + "." + path, text);
            return true
        } else {
            this.removeItem(this.ROOT + "." + path);
            return false
        }
    };
    Storage.prototype.saveData = function(data, path) {
        var base64 = null;
        if (data) {
            base64 = DIMP.format.Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function(container, path) {
        var json = null;
        if (container) {
            json = DIMP.format.JSON.encode(container)
        }
        return this.saveText(json, path)
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.register("LocalStorage");
    ns.register("SessionStorage")
}(StarGate);
! function(ns) {
    var Delegate = function() {};
    Delegate.prototype.onReceived = function(response, star) {
        console.assert(response !== null, "response empty");
        console.assert(star !== null, "star empty");
        console.assert(false, "implement me!")
    };
    Delegate.prototype.onStatusChanged = function(status, star) {
        console.assert(status !== null, "status empty");
        console.assert(star !== null, "star empty");
        console.assert(false, "implement me!")
    };
    Delegate.prototype.onSent = function(request, error, star) {
        console.assert(request !== null, "request empty");
        console.assert(star !== null, "star empty");
        console.assert(false, "implement me!")
    };
    var Status = DIMP.type.Enum({
        Error: -1,
        Init: 0,
        Connecting: 1,
        Connected: 2
    });
    ns.StarDelegate = Delegate;
    ns.StarStatus = Status;
    ns.register("StarDelegate");
    ns.register("StarStatus")
}(StarGate);
! function(ns) {
    var Star = function() {};
    Star.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    Star.prototype.launch = function(options) {
        console.assert(options !== null, "options empty");
        console.assert(false, "implement me!")
    };
    Star.prototype.terminate = function() {
        console.assert(false, "implement me!")
    };
    Star.prototype.pause = function(options) {};
    Star.prototype.resume = function(options) {};
    Star.prototype.send = function(payload, delegate) {
        console.assert(payload !== null, "payload empty");
        console.assert(delegate !== null, "delegate empty");
        console.assert(false, "implement me!")
    };
    ns.Star = Star;
    ns.register("Star")
}(StarGate);
! function(ns) {
    var Star = ns.Star;
    var Task = function(data, delegate) {
        this.data = data;
        this.delegate = delegate;
        this.star = null
    };
    Task.prototype.onResponse = function(data) {
        this.delegate.onReceived(data)
    };
    Task.prototype.onSuccess = function() {
        this.delegate.onSent(this.data, null, this.star)
    };
    Task.prototype.onError = function(error) {
        this.delegate.onSent(this.data, error, this.star)
    };
    ns.extensions.Task = Task;
    ns.extensions.register("Task")
}(StarGate);
! function(ns) {
    var Task = ns.extensions.Task;
    var StarStatus = ns.StarStatus;
    var Star = ns.Star;
    var Fence = function(delegate) {
        this.delegate = delegate;
        this.status = StarStatus.Init;
        this.waitingList = []
    };
    Fence.inherits(Star);
    Fence.prototype.onReceived = function(data) {
        this.delegate.onReceived(data, this)
    };
    Fence.prototype.getStatus = function() {
        return this.status
    };
    Fence.prototype.setStatus = function(status) {
        if (status.equals(this.status)) {
            return
        }
        this.delegate.onStatusChanged(status, this);
        this.status = status
    };
    Fence.prototype.getTask = function() {
        if (this.waitingList.length === 0) {
            return null
        }
        return this.waitingList.shift()
    };
    Fence.prototype.connect = function(host, port) {
        console.assert(host !== null, "host empty");
        console.assert(port !== null, "port empty");
        console.assert(false, "implement me!")
    };
    Fence.prototype.disconnect = function() {
        console.assert(false, "implement me!")
    };
    Fence.prototype.isConnected = function() {
        return this.status.equals(StarStatus.Connected)
    };
    Fence.prototype.onConnected = function() {
        this.setStatus(StarStatus.Connected)
    };
    Fence.prototype.onClosed = function() {
        this.setStatus(StarStatus.Init)
    };
    Fence.prototype.onError = function(error) {
        this.setStatus(StarStatus.Error)
    };
    Fence.prototype.onReceived = function(data) {
        this.delegate.onReceived(data, this)
    };
    Fence.prototype.launch = function(options) {
        this.disconnect();
        this.setStatus(StarStatus.Connecting);
        var host = options["host"];
        var port = options["port"];
        this.connect(host, port)
    };
    Fence.prototype.terminate = function() {
        this.disconnect();
        this.setStatus(StarStatus.Init)
    };
    Fence.prototype.send = function(data, delegate) {
        var task = new Task(data, delegate);
        task.star = this;
        this.waitingList.push(task)
    };
    ns.extensions.Fence = Fence;
    ns.extensions.register("Fence")
}(StarGate);
! function(ns) {
    var Fence = ns.extensions.Fence;
    var SocketClient = function(delegate) {
        Fence.call(this, delegate);
        this.ws = null
    };
    SocketClient.inherits(Fence);
    SocketClient.prototype.connect = function(host, port) {
        var protocol = "ws";
        if ("https" === window.location.protocol.split(":")[0]) {
            protocol = "wss"
        }
        var url = protocol + "://" + host + ":" + port;
        var ws = new WebSocket(url);
        ws.client = this;
        ws.onopen = function(ev) {
            this.client.onConnected()
        };
        ws.onclose = function(ev) {
            this.client.onClosed()
        };
        ws.onerror = function(ev) {
            var error = new Error("ws error: " + ev);
            this.client.onError(error)
        };
        ws.onmessage = function(ev) {
            this.client.onReceived(ev.data)
        };
        this.ws = ws
    };
    SocketClient.prototype.disconnect = function(ws) {
        if (!this.ws) {
            return
        }
        this.ws.close();
        this.ws = null
    };
    SocketClient.prototype.onConnected = function() {
        Fence.prototype.onConnected.call(this);
        var task;
        while (true) {
            task = this.getTask();
            if (!task) {
                break
            }
            this.ws.send(task.data);
            if (task.delegate) {
                task.delegate.onSent(task.data, null, this)
            }
        }
    };
    SocketClient.prototype.send = function(data, delegate) {
        if (this.isConnected()) {
            this.ws.send(data);
            if (delegate) {
                delegate.onSent(data, null, this)
            }
        } else {
            Fence.prototype.send.call(this, data, delegate)
        }
    };
    ns.extensions.SocketClient = SocketClient;
    ns.extensions.register("SocketClient")
}(StarGate);
