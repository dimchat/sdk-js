/**
 *  StarGate (v0.1.0)
 *  (Interfaces for network connection)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 6, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
if (typeof LocalNotificationService !== "object") {
    LocalNotificationService = new MONKEY.Namespace()
}
if (typeof FiniteStateMachine !== "object") {
    FiniteStateMachine = new MONKEY.Namespace()
}
if (typeof FileSystem !== "object") {
    FileSystem = new MONKEY.Namespace()
}
if (typeof StarTrek !== "object") {
    StarTrek = new MONKEY.Namespace()
}
if (typeof StarGate !== "object") {
    StarGate = new MONKEY.Namespace()
}
(function(ns, sys) {
    var obj = sys.type.Object;
    var Storage = function(storage, prefix) {
        obj.call(this);
        this.storage = storage;
        if (prefix) {
            this.ROOT = prefix
        } else {
            this.ROOT = "dim"
        }
    };
    sys.Class(Storage, obj, null);
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
        return sys.format.Base64.decode(base64)
    };
    Storage.prototype.loadJSON = function(path) {
        var json = this.loadText(path);
        if (!json) {
            return null
        }
        return sys.format.JSON.decode(json)
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
            base64 = sys.format.Base64.encode(data)
        }
        return this.saveText(base64, path)
    };
    Storage.prototype.saveJSON = function(container, path) {
        var json = null;
        if (container) {
            json = sys.format.JSON.encode(container);
            json = sys.format.UTF8.decode(json)
        }
        return this.saveText(json, path)
    };
    ns.LocalStorage = new Storage(window.localStorage, "dim.fs");
    ns.SessionStorage = new Storage(window.sessionStorage, "dim.mem");
    ns.registers("LocalStorage");
    ns.registers("SessionStorage")
})(FileSystem, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Notification = function(name, sender, userInfo) {
        obj.call(this);
        this.name = name;
        this.sender = sender;
        this.userInfo = userInfo
    };
    sys.Class(Notification, obj, null);
    ns.Notification = Notification;
    ns.registers("Notification")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var Observer = function() {};
    sys.Interface(Observer, null);
    Observer.prototype.onReceiveNotification = function(notification) {
        console.assert(false, "implement me!")
    };
    ns.Observer = Observer;
    ns.registers("Observer")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Arrays = sys.type.Arrays;
    var Notification = ns.Notification;
    var Observer = ns.Observer;
    var Center = function() {
        obj.call(this);
        this.__observers = {}
    };
    sys.Class(Center, obj, null);
    Center.prototype.addObserver = function(observer, name) {
        var list = this.__observers[name];
        if (list) {
            if (list.indexOf(observer) >= 0) {
                return
            }
        } else {
            list = [];
            this.__observers[name] = list
        }
        list.push(observer)
    };
    Center.prototype.removeObserver = function(observer, name) {
        if (name) {
            var list = this.__observers[name];
            if (list) {
                Arrays.remove(list, observer)
            }
        } else {
            var names = Object.keys(this.__observers);
            for (var i = 0; i < names.length; ++i) {
                this.removeObserver(observer, names[i])
            }
        }
    };
    Center.prototype.postNotification = function(notification, sender, userInfo) {
        if (typeof notification === "string") {
            notification = new Notification(notification, sender, userInfo)
        }
        var observers = this.__observers[notification.name];
        if (!observers) {
            return
        }
        var obs;
        for (var i = 0; i < observers.length; ++i) {
            obs = observers[i];
            if (sys.Interface.conforms(obs, Observer)) {
                obs.onReceiveNotification(notification)
            } else {
                if (typeof obs === "function") {
                    obs.call(notification)
                }
            }
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
    ns.registers("NotificationCenter")
})(LocalNotificationService, MONKEY);
(function(ns, sys) {
    var Delegate = function() {};
    sys.Interface(Delegate, null);
    Delegate.prototype.enterState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.exitState = function(state, machine) {
        console.assert(false, "implement me!")
    };
    Delegate.prototype.pauseState = function(state, machine) {};
    Delegate.prototype.resumeState = function(state, machine) {};
    ns.Delegate = Delegate;
    ns.registers("Delegate")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Transition = function(targetStateName) {
        obj.call(this);
        this.target = targetStateName
    };
    sys.Class(Transition, obj, null);
    Transition.prototype.evaluate = function(machine) {
        console.assert(false, "implement me!");
        return false
    };
    ns.Transition = Transition;
    ns.registers("Transition")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var State = function() {
        obj.call(this);
        this.__transitions = []
    };
    sys.Class(State, obj, null);
    State.prototype.addTransition = function(transition) {
        if (this.__transitions.indexOf(transition) < 0) {
            this.__transitions.push(transition)
        } else {
            throw new Error("transition exists: " + transition)
        }
    };
    State.prototype.tick = function(machine) {
        var transition;
        for (var i = 0; i < this.__transitions.length; ++i) {
            transition = this.__transitions[i];
            if (transition.evaluate(machine)) {
                machine.changeState(transition.target);
                break
            }
        }
    };
    State.prototype.onEnter = function(machine) {
        console.assert(false, "implement me!")
    };
    State.prototype.onExit = function(machine) {
        console.assert(false, "implement me!")
    };
    State.prototype.onPause = function(machine) {};
    State.prototype.onResume = function(machine) {};
    ns.State = State;
    ns.registers("State")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Status = sys.type.Enum(null, {
        Stopped: 0,
        Running: 1,
        Paused: 2
    });
    var Machine = function(defaultStateName) {
        obj.call(this);
        this.__default = defaultStateName ? defaultStateName : "default";
        this.__current = null;
        this.__status = Status.Stopped;
        this.__delegate = null
    };
    sys.Class(Machine, obj, null);
    Machine.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    Machine.prototype.getDelegate = function() {
        return this.__delegate
    };
    Machine.prototype.getCurrentState = function() {
        return this.__current
    };
    Machine.prototype.addState = function(state, name) {
        console.assert(false, "implement me!")
    };
    Machine.prototype.getState = function(name) {
        console.assert(false, "implement me!");
        return null
    };
    Machine.prototype.changeState = function(name) {
        var delegate = this.getDelegate();
        var oldState = this.getCurrentState();
        var newState = this.getState(name);
        if (delegate) {
            if (oldState) {
                delegate.exitState(oldState, this)
            }
            if (newState) {
                delegate.enterState(newState, this)
            }
        }
        this.__current = newState;
        if (oldState) {
            oldState.onExit(this)
        }
        if (newState) {
            newState.onEnter(this)
        }
    };
    Machine.prototype.start = function() {
        if (this.__current || !Status.Stopped.equals(this.__status)) {
            throw new Error("FSM start error: " + this.__status)
        }
        this.changeState(this.__default);
        this.__status = Status.Running
    };
    Machine.prototype.stop = function() {
        if (!this.__current || Status.Stopped.equals(this.__status)) {
            throw new Error("FSM stop error: " + this.__status)
        }
        this.__status = Status.Stopped;
        this.changeState(null)
    };
    Machine.prototype.pause = function() {
        if (!this.__current || !Status.Running.equals(this.__status)) {
            throw new Error("FSM pause error: " + this.__status)
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.pauseState(this.__current, this)
        }
        this.__status = Status.Paused;
        this.__current.onPause(this)
    };
    Machine.prototype.resume = function() {
        if (!this.__current || !Status.Paused.equals(this.__status)) {
            throw new Error("FSM resume error: " + this.__status)
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.resumeState(this.__current, this)
        }
        this.__status = Status.Running;
        this.__current.onResume(this)
    };
    Machine.prototype.tick = function() {
        if (this.__current && Status.Running.equals(this.__status)) {
            this.__current.tick(this)
        }
    };
    ns.Machine = Machine;
    ns.registers("Machine")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var Runnable = sys.threading.Runnable;
    var Thread = sys.threading.Thread;
    var Machine = ns.Machine;
    var AutoMachine = function(defaultStateName) {
        Machine.call(this, defaultStateName);
        this.__states = {};
        this.__thread = null
    };
    sys.Class(AutoMachine, Machine, [Runnable]);
    AutoMachine.prototype.addState = function(state, name) {
        this.__states[name] = state
    };
    AutoMachine.prototype.getState = function(name) {
        return this.__states[name]
    };
    AutoMachine.prototype.start = function() {
        Machine.prototype.start.call(this);
        force_stop(this);
        var thread = new Thread(this);
        this.__thread = thread;
        thread.start()
    };
    var force_stop = function(machine) {
        var thread = machine.__thread;
        machine.__thread = null;
        if (thread) {
            thread.stop()
        }
    };
    AutoMachine.prototype.stop = function() {
        Machine.prototype.stop.call(this);
        force_stop(this)
    };
    AutoMachine.prototype.run = function() {
        this.tick();
        return this.getCurrentState() != null
    };
    ns.AutoMachine = AutoMachine;
    ns.registers("AutoMachine")
})(FiniteStateMachine, MONKEY);
(function(ns, sys) {
    var Ship = function() {};
    sys.Interface(Ship, null);
    Ship.prototype.getPackage = function() {
        console.assert(false, "implement me!");
        return null
    };
    Ship.prototype.getSN = function() {
        console.assert(false, "implement me!");
        return null
    };
    Ship.prototype.getPayload = function() {
        console.assert(false, "implement me!");
        return null
    };
    var ShipDelegate = function() {};
    sys.Interface(ShipDelegate, null);
    ShipDelegate.prototype.onShipSent = function(ship, error) {
        console.assert(false, "implement me!")
    };
    Ship.Delegate = ShipDelegate;
    ns.Ship = Ship;
    ns.registers("Ship")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Ship = ns.Ship;
    var StarShip = function(priority, delegate) {
        obj.call(this);
        this.priority = priority;
        this.__delegate = delegate;
        this.__timestamp = 0;
        this.__retries = -1
    };
    sys.Class(StarShip, obj, [Ship]);
    StarShip.EXPIRES = 120 * 1000;
    StarShip.RETRIES = 2;
    StarShip.URGENT = -1;
    StarShip.NORMAL = 0;
    StarShip.SLOWER = 1;
    StarShip.prototype.getDelegate = function() {
        return this.__delegate
    };
    StarShip.prototype.getTimestamp = function() {
        return this.__timestamp
    };
    StarShip.prototype.getRetries = function() {
        return this.__retries
    };
    StarShip.prototype.isExpired = function() {
        var now = new Date();
        return now.getTime() > this.__timestamp + StarShip.EXPIRES * (StarShip.RETRIES + 2)
    };
    StarShip.prototype.update = function() {
        this.__timestamp = (new Date()).getTime();
        this.__retries += 1
    };
    ns.StarShip = StarShip;
    ns.registers("StarShip")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var StarShip = ns.StarShip;
    var Dock = function() {
        obj.call(this);
        this.__priorities = [];
        this.__fleets = {}
    };
    sys.Class(Dock, obj, null);
    Dock.prototype.park = function(task) {
        var prior = task.priority;
        var fleet = this.__fleets[prior];
        if (!fleet) {
            fleet = [];
            this.__fleets[prior] = fleet;
            var index = 0;
            for (; index < this.__priorities.length; ++index) {
                if (prior < this.__priorities[index]) {
                    break
                }
            }
            this.__priorities[index] = prior
        }
        for (var i = 0; i < fleet.length; ++i) {
            if (fleet[i] === task) {
                return false
            }
        }
        fleet.push(task);
        return true
    };
    Dock.prototype.pull = function(sn) {
        if (sn === "*") {
            return seek(this, function(ship) {
                if (ship.getTimestamp() === 0) {
                    ship.update();
                    return -1
                } else {
                    return 0
                }
            })
        } else {
            return seek(this, function(ship) {
                var sn1 = ship.getSN();
                if (sn1.length !== sn.length) {
                    return 0
                }
                for (var i = 0; i < sn1.length; ++i) {
                    if (sn1[i] !== sn[i]) {
                        return 0
                    }
                }
                return -1
            })
        }
    };
    var seek = function(dock, checking) {
        var fleet, ship, flag;
        var i, j;
        for (i = 0; i < dock.__priorities.length; ++i) {
            fleet = dock.__fleets[dock.__priorities[i]];
            if (!fleet) {
                continue
            }
            for (j = 0; j < fleet.length; ++j) {
                ship = fleet[j];
                flag = checking(ship);
                if (flag === -1) {
                    fleet.splice(j, 1);
                    return ship
                } else {
                    if (flag === 1) {
                        return ship
                    }
                }
            }
        }
        return null
    };
    Dock.prototype.any = function() {
        var expired = (new Date()).getTime() - StarShip.EXPIRES;
        return seek(this, function(ship) {
            if (ship.getTimestamp() > expired) {
                return 0
            }
            if (ship.getRetries() < StarShip.RETRIES) {
                ship.update();
                return 1
            }
            if (ship.isExpired()) {
                return -1
            }
        })
    };
    ns.Dock = Dock;
    ns.registers("Dock")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Handler = sys.threading.Handler;
    var Processor = sys.threading.Processor;
    var Docker = function() {};
    sys.Interface(Docker, [Handler, Processor]);
    Docker.prototype.pack = function(payload, priority, delegate) {
        console.assert(false, "implement me!");
        return null
    };
    ns.Docker = Docker;
    ns.registers("Docker")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Docker = ns.Docker;
    var StarDocker = function(gate) {
        Runner.call(this);
        this.__gate = gate;
        this.__heartbeatExpired = (new Date()).getTime() + 2000
    };
    sys.Class(StarDocker, Runner, [Docker]);
    StarDocker.prototype.getGate = function() {
        return this.__gate
    };
    StarDocker.prototype.process = function() {
        var gate = this.getGate();
        var income = this.getIncomeShip();
        if (income) {
            this.removeLinkedShip(income);
            var res = this.processIncomeShip(income);
            if (res) {
                gate.sendShip(res)
            }
        }
        var delegate;
        var outgo = null;
        if (ns.Gate.Status.CONNECTED.equals(gate.getStatus())) {
            outgo = this.getOutgoShip()
        }
        if (outgo) {
            if (outgo.isExpired()) {
                delegate = outgo.getDelegate();
                if (delegate) {
                    delegate.onShipSent(outgo, new Error("Request timeout"))
                }
            } else {
                if (!gate.send(outgo.getPackage())) {
                    delegate = outgo.getDelegate();
                    if (delegate) {
                        delegate.onShipSent(outgo, new Error("Connection error"))
                    }
                }
            }
        }
        if (income || outgo) {
            return true
        } else {
            var now = (new Date()).getTime();
            if (now > this.__heartbeatExpired) {
                if (gate.isExpired()) {
                    var beat = this.getHeartbeat();
                    if (beat) {
                        gate.parkShip(beat)
                    }
                }
                this.__heartbeatExpired = now + 2000
            }
            return false
        }
    };
    StarDocker.prototype.getIncomeShip = function() {
        console.assert(false, "implement me!");
        return null
    };
    StarDocker.prototype.processIncomeShip = function(income) {
        console.assert(false, "implement me!");
        return null
    };
    StarDocker.prototype.removeLinkedShip = function(income) {
        var linked = this.getOutgoShip(income);
        if (linked) {
            var delegate = linked.getDelegate();
            if (delegate) {
                delegate.onShipSent(linked, null)
            }
        }
    };
    StarDocker.prototype.getOutgoShip = function(income) {
        var gate = this.getGate();
        if (income) {
            return gate.pullShip(income.getSN())
        } else {
            var outgo = gate.pullShip("*");
            if (!outgo) {
                outgo = gate.anyShip()
            }
            return outgo
        }
    };
    StarDocker.prototype.getHeartbeat = function() {
        return null
    };
    ns.StarDocker = StarDocker;
    ns.registers("StarDocker")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Gate = function() {};
    sys.Interface(Gate, null);
    Gate.prototype.getDelegate = function() {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.isExpired = function() {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.sendPayload = function(payload, priority, delegate) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.sendShip = function(outgo) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.send = function(pack) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.receive = function(length, remove) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.parkShip = function(outgo) {
        console.assert(false, "implement me!");
        return false
    };
    Gate.prototype.pullShip = function(sn) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.anyShip = function() {
        console.assert(false, "implement me!");
        return null
    };
    Gate.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    var GateStatus = sys.type.Enum(null, {
        ERROR: -1,
        INIT: 0,
        CONNECTING: 1,
        CONNECTED: 2
    });
    var GateDelegate = function() {};
    sys.Interface(GateDelegate, null);
    GateDelegate.prototype.onGateStatusChanged = function(gate, oldStatus, newStatus) {
        console.assert(false, "implement me!")
    };
    GateDelegate.prototype.onGateReceived = function(gate, ship) {
        console.assert(false, "implement me!");
        return null
    };
    Gate.Status = GateStatus;
    Gate.Delegate = GateDelegate;
    ns.Gate = Gate;
    ns.registers("Gate")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Gate = ns.Gate;
    var Dock = ns.Dock;
    var StarShip = ns.StarShip;
    var StarGate = function() {
        Runner.call(this);
        this.dock = this.createDock();
        this.__docker = null;
        this.__delegate = null
    };
    sys.Class(StarGate, Runner, [Gate]);
    StarGate.prototype.createDock = function() {
        return new Dock()
    };
    StarGate.prototype.createDocker = function() {
        console.assert(false, "implement me!");
        return null
    };
    StarGate.prototype.getDocker = function() {
        if (!this.__docker) {
            this.__docker = this.createDocker()
        }
        return this.__docker
    };
    StarGate.prototype.setDocker = function(worker) {
        this.__docker = worker
    };
    StarGate.prototype.getDelegate = function() {
        return this.__delegate
    };
    StarGate.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    StarGate.prototype.sendPayload = function(payload, priority, delegate) {
        var worker = this.getDocker();
        if (worker) {
            var outgo = worker.pack(payload, priority, delegate);
            return this.sendShip(outgo)
        } else {
            return false
        }
    };
    StarGate.prototype.sendShip = function(outgo) {
        if (!this.getStatus().equals(Gate.Status.CONNECTED)) {
            return false
        } else {
            if (outgo.priority > StarShip.URGENT) {
                return this.parkShip(outgo)
            } else {
                return this.send(outgo.getPackage())
            }
        }
    };
    StarGate.prototype.parkShip = function(outgo) {
        return this.dock.park(outgo)
    };
    StarGate.prototype.pullShip = function(sn) {
        return this.dock.pull(sn)
    };
    StarGate.prototype.anyShip = function() {
        return this.dock.any()
    };
    StarGate.prototype.setup = function() {
        var docker = this.getDocker();
        if (docker) {
            return docker.setup()
        } else {
            return true
        }
    };
    StarGate.prototype.finish = function() {
        var docker = this.__docker;
        if (docker) {
            return docker.finish()
        } else {
            return false
        }
    };
    StarGate.prototype.process = function() {
        var docker = this.__docker;
        if (docker) {
            return docker.process()
        } else {
            return false
        }
    };
    ns.StarGate = StarGate;
    ns.registers("StarGate")
})(StarTrek, MONKEY);
(function(ns, sys) {
    var CachePool = function() {};
    sys.Interface(CachePool, null);
    CachePool.prototype.push = function(data) {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.shift = function(maxLength) {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.all = function() {
        console.assert(false, "implement me!");
        return null
    };
    CachePool.prototype.length = function() {
        console.assert(false, "implement me!");
        return 0
    };
    ns.CachePool = CachePool;
    ns.registers("CachePool")
})(StarGate, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var CachePool = ns.CachePool;
    var MemoryCache = function() {
        obj.call(this);
        this.__packages = [];
        this.__occupied = 0
    };
    sys.Class(MemoryCache, obj, [CachePool]);
    MemoryCache.prototype.push = function(data) {
        this.__packages.push(data);
        this.__occupied += data.length
    };
    MemoryCache.prototype.shift = function(maxLength) {
        var data = this.__packages.shift();
        if (data.length > maxLength) {
            this.__packages.unshift(data.subarray(maxLength));
            data = data.subarray(0, maxLength)
        }
        this.__occupied -= data.length;
        return data
    };
    MemoryCache.prototype.all = function() {
        var size = 0;
        var i, item;
        for (i = 0; i < this.__packages.length; ++i) {
            size += this.__packages[i].length
        }
        var data = new Uint8Array(size);
        var offset = 0;
        for (i = 0; i < this.__packages.length; ++i) {
            item = this.__packages[i];
            data.set(item, offset);
            offset += item.length
        }
        return data
    };
    MemoryCache.prototype.length = function() {
        return this.__occupied
    };
    ns.MemoryCache = MemoryCache;
    ns.registers("MemoryCache")
})(StarGate, MONKEY);
(function(ns, sys) {
    var connect = function(url, proxy) {
        var ws = new WebSocket(url);
        ws.onopen = function(ev) {
            proxy.onConnected()
        };
        ws.onclose = function(ev) {
            proxy.onClosed()
        };
        ws.onerror = function(ev) {
            var error = new Error("WebSocket error: " + ev);
            proxy.onError(error)
        };
        ws.onmessage = function(ev) {
            var data = ev.data;
            if (!data || data.length === 0) {
                return
            } else {
                if (typeof data === "string") {
                    data = sys.format.UTF8.encode(data)
                } else {
                    if (data instanceof Uint8Array) {} else {
                        data = new Uint8Array(data)
                    }
                }
            }
            proxy.onReceived(data)
        };
        return ws
    };
    var build_url = function(host, port) {
        if ("https" === window.location.protocol.split(":")[0]) {
            return "wss://" + host + ":" + port
        } else {
            return "ws://" + host + ":" + port
        }
    };
    var parse_url = function(url) {
        var pos1 = url.indexOf("://");
        if (pos1 < 0) {
            throw new URIError("URl error: " + url)
        }
        var scheme = url.substr(0, pos1);
        var host, port;
        pos1 += 3;
        var pos2 = url.indexOf("/", pos1 + 4);
        if (pos2 > pos1) {
            url = url.substr(0, pos2)
        }
        pos2 = url.indexOf(":", pos1 + 4);
        if (pos2 > pos1) {
            host = url.substr(pos1, pos2 - pos1);
            port = parseInt(url.substr(pos2 + 1))
        } else {
            host = url.substr(pos1);
            if (scheme === "ws" || scheme === "http") {
                port = 80
            } else {
                if (scheme === "wss" || scheme === "https") {
                    port = 443
                } else {
                    throw new URIError("URL scheme error: " + scheme)
                }
            }
        }
        return {
            "scheme": scheme,
            "host": host,
            "port": port
        }
    };
    var obj = sys.type.Object;
    var Socket = function(url) {
        obj.call(this);
        this.__packages = [];
        this.__connected = false;
        this.__closed = false;
        if (url) {
            var info = parse_url(url);
            this.__host = info["host"];
            this.__port = info["port"];
            this.__ws = connect(url, this)
        } else {
            this.__host = null;
            this.__port = null;
            this.__ws = null
        }
    };
    sys.Class(Socket, obj, null);
    Socket.prototype.getHost = function() {
        return this.__host
    };
    Socket.prototype.getPort = function() {
        return this.__port
    };
    Socket.prototype.connect = function(host, port) {
        this.close();
        this.__ws = connect(build_url(host, port), this)
    };
    Socket.prototype.close = function() {
        if (this.__ws) {
            this.__ws.close();
            this.__ws = null
        }
    };
    Socket.prototype.isConnected = function() {
        return this.__connected
    };
    Socket.prototype.isClosed = function() {
        return this.__closed
    };
    Socket.prototype.onConnected = function() {
        this.__connected = true
    };
    Socket.prototype.onClosed = function() {
        this.__closed = true
    };
    Socket.prototype.onError = function(error) {};
    Socket.prototype.onReceived = function(data) {
        this.__packages.push(data)
    };
    Socket.prototype.send = function(data) {
        this.__ws.send(data)
    };
    Socket.prototype.receive = function() {
        if (this.__packages.length > 0) {
            return this.__packages.shift()
        } else {
            return null
        }
    };
    ns.Socket = Socket;
    ns.registers("Socket")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Connection = function() {};
    sys.Interface(Connection, null);
    Connection.MAX_CACHE_LENGTH = 65536;
    Connection.EXPIRES = 16 * 1000;
    Connection.prototype.send = function(data) {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.available = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.received = function() {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.receive = function(maxLength) {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.getHost = function() {
        console.assert(false, "implement me!");
        return null
    };
    Connection.prototype.getPort = function() {
        console.assert(false, "implement me!");
        return 0
    };
    Connection.prototype.stop = function() {
        console.assert(false, "implement me!")
    };
    Connection.prototype.isRunning = function() {
        console.assert(false, "implement me!");
        return false
    };
    Connection.prototype.getStatus = function() {
        console.assert(false, "implement me!");
        return null
    };
    var ConnectionStatus = sys.type.Enum(null, {
        DEFAULT: (0),
        CONNECTING: (1),
        CONNECTED: (17),
        MAINTAINING: (33),
        EXPIRED: (34),
        ERROR: (136)
    });
    var ConnectionDelegate = function() {};
    sys.Interface(ConnectionDelegate, null);
    ConnectionDelegate.prototype.onConnectionStatusChanged = function(connection, oldStatus, newStatus) {
        console.assert(false, "implement me!")
    };
    ConnectionDelegate.prototype.onConnectionReceivedData = function(connection, data) {
        console.assert(false, "implement me!")
    };
    Connection.Status = ConnectionStatus;
    Connection.Delegate = ConnectionDelegate;
    ns.Connection = Connection;
    ns.registers("Connection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var MemoryCache = ns.MemoryCache;
    var Connection = ns.Connection;
    var BaseConnection = function(socket) {
        Runner.call(this);
        this._socket = socket;
        this.__cache = this.createCachePool();
        this.__delegate = null;
        this.__status = Connection.Status.DEFAULT;
        this.__lastSentTime = 0;
        this.__lastReceivedTime = 0
    };
    sys.Class(BaseConnection, Runner, [Connection]);
    BaseConnection.prototype.createCachePool = function() {
        return new MemoryCache()
    };
    BaseConnection.prototype.getDelegate = function() {
        return this.__delegate
    };
    BaseConnection.prototype.setDelegate = function(delegate) {
        this.__delegate = delegate
    };
    BaseConnection.prototype.getSocket = function() {
        if (this.isRunning()) {
            return this._socket
        } else {
            return null
        }
    };
    BaseConnection.prototype.getHost = function() {
        var sock = this._socket;
        if (sock) {
            return sock.getHost()
        } else {
            return null
        }
    };
    BaseConnection.prototype.getPort = function() {
        var sock = this._socket;
        if (sock) {
            return sock.getPort()
        } else {
            return 0
        }
    };
    var is_available = function(sock) {
        if (!sock || sock.isClosed()) {
            return false
        } else {
            return sock.isConnected()
        }
    };
    BaseConnection.prototype.isRunning = function() {
        return is_available(this._socket)
    };
    var write = function(data) {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error("socket lost, cannot write data: " + data.length + " byte(s)")
        }
        sock.send(data);
        this.__lastSentTime = (new Date()).getTime();
        return data.length
    };
    var read = function() {
        var sock = this.getSocket();
        if (!sock) {
            throw new Error("socket lost, cannot read data")
        }
        var data = sock.receive();
        if (data) {
            this.__lastReceivedTime = (new Date()).getTime()
        }
        return data
    };
    var close = function() {
        var sock = this._socket;
        try {
            if (is_available(sock)) {
                sock.close()
            }
        } finally {
            this._socket = null
        }
    };
    BaseConnection.prototype._receive = function() {
        try {
            return read.call(this)
        } catch (e) {
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null
        }
    };
    BaseConnection.prototype.send = function(data) {
        try {
            return write.call(this, data)
        } catch (e) {
            close.call(this);
            this.setStatus(Connection.Status.ERROR);
            return null
        }
    };
    BaseConnection.prototype.available = function() {
        return this.__cache.length()
    };
    BaseConnection.prototype.received = function() {
        return this.__cache.all()
    };
    BaseConnection.prototype.receive = function(maxLength) {
        return this.__cache.shift(maxLength)
    };
    BaseConnection.prototype.getStatus = function() {
        var now = new Date();
        fsm_tick.call(this, now.getTime());
        return this.__status
    };
    BaseConnection.prototype.setStatus = function(newStatus) {
        var oldStatus = this.__status;
        if (oldStatus.equals(newStatus)) {
            return
        }
        this.__status = newStatus;
        if (newStatus.equals(Connection.Status.CONNECTED) && !oldStatus.equals(Connection.Status.MAINTAINING)) {
            var now = (new Date()).getTime();
            this.__lastSentTime = now - Connection.EXPIRES - 1;
            this.__lastReceivedTime = now - Connection.EXPIRES - 1
        }
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionStatusChanged(this, oldStatus, newStatus)
        }
    };
    BaseConnection.prototype.stop = function() {
        close.call(this);
        Runner.prototype.stop.call(this)
    };
    BaseConnection.prototype.setup = function() {
        this.setStatus(Connection.Status.CONNECTING);
        return false
    };
    BaseConnection.prototype.finish = function() {
        close.call(this);
        this.setStatus(Connection.Status.DEFAULT);
        return false
    };
    BaseConnection.prototype.process = function() {
        var count = this.__cache.length();
        if (count >= Connection.MAX_CACHE_LENGTH) {
            return false
        }
        var status = this.getStatus();
        if (Connection.Status.CONNECTED.equals(status) || Connection.Status.MAINTAINING.equals(status) || Connection.Status.EXPIRED.equals(status)) {} else {
            return false
        }
        var data = this._receive();
        if (!data || data.length === 0) {
            return false
        }
        this.__cache.push(data);
        var delegate = this.getDelegate();
        if (delegate) {
            delegate.onConnectionReceivedData(this, data)
        }
        return true
    };
    var fsm_tick = function(now) {
        var tick = evaluations[this.__status];
        if (typeof tick === "function") {
            tick.call(this, now)
        } else {
            throw new EvalError("connection status error: " + this.__status)
        }
    };
    var evaluations = {};
    evaluations[Connection.Status.DEFAULT] = function(now) {
        if (this.isRunning()) {
            this.setStatus(Connection.Status.CONNECTING)
        }
    };
    evaluations[Connection.Status.CONNECTING] = function(now) {
        if (!this.isRunning()) {
            this.setStatus(Connection.Status.DEFAULT)
        } else {
            if (is_available(this.getSocket())) {
                this.setStatus(Connection.Status.CONNECTED)
            }
        }
    };
    evaluations[Connection.Status.CONNECTED] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now > this.__lastReceivedTime + Connection.EXPIRES) {
                this.setStatus(Connection.Status.EXPIRED)
            }
        }
    };
    evaluations[Connection.Status.EXPIRED] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now < this.__lastSentTime + Connection.EXPIRES) {
                this.setStatus(Connection.Status.MAINTAINING)
            }
        }
    };
    evaluations[Connection.Status.MAINTAINING] = function(now) {
        if (!is_available(this.getSocket())) {
            this.setStatus(Connection.Status.ERROR)
        } else {
            if (now > this.__lastReceivedTime + (Connection.EXPIRES << 4)) {
                this.setStatus(Connection.Status.ERROR)
            } else {
                if (now < this.__lastReceivedTime + Connection.EXPIRES) {
                    this.setStatus(Connection.Status.CONNECTED)
                } else {
                    if (now > this.__lastSentTime + Connection.EXPIRES) {
                        this.setStatus(Connection.Status.EXPIRED)
                    }
                }
            }
        }
    };
    evaluations[Connection.Status.ERROR] = function(now) {
        if (!this.isRunning()) {
            this.setStatus(Connection.Status.DEFAULT)
        } else {
            if (is_available(this.getSocket())) {
                this.setStatus(Connection.Status.CONNECTED)
            }
        }
    };
    ns.BaseConnection = BaseConnection;
    ns.registers("BaseConnection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Runner = sys.threading.Runner;
    var Socket = ns.Socket;
    var Connection = ns.Connection;
    var BaseConnection = ns.BaseConnection;
    var ActiveConnection = function(host, port) {
        BaseConnection.call(this, null);
        this.__host = host;
        this.__port = port;
        this.__connecting = 0
    };
    sys.Class(ActiveConnection, BaseConnection, null);
    var connect = function() {
        this.setStatus(Connection.Status.CONNECTING);
        try {
            var sock = new Socket(null);
            sock.connect(this.getHost(), this.getPort());
            this._socket = sock;
            this.setStatus(Connection.Status.CONNECTED);
            return true
        } catch (e) {
            this.setStatus(Connection.Status.ERROR);
            return false
        }
    };
    var reconnect = function() {
        var redo;
        this.__connecting += 1;
        try {
            if (this.__connecting === 1 && !this._socket) {
                redo = connect.call(this)
            } else {
                redo = false
            }
        } finally {
            this.__connecting -= 1
        }
        return redo
    };
    ActiveConnection.prototype.getSocket = function() {
        if (this.isRunning()) {
            if (!this._socket) {
                reconnect.call(this)
            }
            return this._socket
        } else {
            return null
        }
    };
    ActiveConnection.prototype.getHost = function() {
        return this.__host
    };
    ActiveConnection.prototype.getPort = function() {
        return this.__port
    };
    ActiveConnection.prototype.isRunning = function() {
        return Runner.prototype.isRunning.call(this)
    };
    ActiveConnection.prototype._receive = function() {
        var data = BaseConnection.prototype._receive.call(this);
        if (!data && reconnect.call(this)) {
            data = BaseConnection.prototype._receive.call(this)
        }
        return data
    };
    ActiveConnection.prototype.send = function(data) {
        var res = BaseConnection.prototype.send.call(this, data);
        if (res < 0 && reconnect.call(this)) {
            res = BaseConnection.prototype.send.call(this, data)
        }
        return res
    };
    ns.ActiveConnection = ActiveConnection;
    ns.registers("ActiveConnection")
})(StarGate, MONKEY);
(function(ns, sys) {
    var obj = sys.type.Object;
    var Host = function(ip, port, data) {
        obj.call(this);
        this.ip = ip;
        this.port = port;
        this.data = data
    };
    sys.Class(Host, obj, null);
    Host.prototype.valueOf = function() {
        console.assert(false, "implement me!");
        return null
    };
    Host.prototype.toString = function() {
        return this.valueOf()
    };
    Host.prototype.toLocaleString = function() {
        return this.valueOf()
    };
    Host.prototype.toArray = function(default_port) {
        var data = this.data;
        var port = this.port;
        var len = data.length;
        var array, index;
        if (!port || port === default_port) {
            array = new Uint8Array(len);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
        } else {
            array = new Uint8Array(len + 2);
            for (index = 0; index < len; ++index) {
                array[index] = data[index]
            }
            array[len] = port >> 8;
            array[len + 1] = port & 255
        }
        return array
    };
    ns.Host = Host;
    ns.registers("Host")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Host = ns.Host;
    var IPv4 = function(ip, port, data) {
        if (data) {
            if (!ip) {
                ip = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                if (data.length === 6) {
                    port = (data[4] << 8) | data[5]
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(4);
                var array = ip.split(".");
                for (var index = 0; index < 4; ++index) {
                    data[index] = parseInt(array[index], 10)
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    sys.Class(IPv4, Host, null);
    IPv4.prototype.valueOf = function() {
        if (this.port === 0) {
            return this.ip
        } else {
            return this.ip + ":" + this.port
        }
    };
    IPv4.patten = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    IPv4.parse = function(host) {
        if (!this.patten.test(host)) {
            return null
        }
        var pair = host.split(":");
        var ip = pair[0],
            port = 0;
        if (pair.length === 2) {
            port = parseInt(pair[1])
        }
        return new IPv4(ip, port)
    };
    ns.IPv4 = IPv4;
    ns.registers("IPv4")
})(StarGate, MONKEY);
(function(ns, sys) {
    var Host = ns.Host;
    var parse_v4 = function(data, array) {
        var item, index = data.byteLength;
        for (var i = array.length - 1; i >= 0; --i) {
            item = array[i];
            data[--index] = item
        }
        return data
    };
    var parse_v6 = function(data, ip, count) {
        var array, item, index;
        var pos = ip.indexOf("::");
        if (pos < 0) {
            array = ip.split(":");
            index = -1;
            for (var i = 0; i < count; ++i) {
                item = parseInt(array[i], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255
            }
        } else {
            var left = ip.substring(0, pos).split(":");
            index = -1;
            for (var j = 0; j < left.length; ++j) {
                item = parseInt(left[j], 16);
                data[++index] = item >> 8;
                data[++index] = item & 255
            }
            var right = ip.substring(pos + 2).split(":");
            index = count * 2;
            for (var k = right.length - 1; k >= 0; --k) {
                item = parseInt(right[k], 16);
                data[--index] = item & 255;
                data[--index] = item >> 8
            }
        }
        return data
    };
    var hex_encode = function(hi, lo) {
        if (hi > 0) {
            if (lo >= 16) {
                return Number(hi).toString(16) + Number(lo).toString(16)
            }
            return Number(hi).toString(16) + "0" + Number(lo).toString(16)
        } else {
            return Number(lo).toString(16)
        }
    };
    var IPv6 = function(ip, port, data) {
        if (data) {
            if (!ip) {
                ip = hex_encode(data[0], data[1]);
                for (var index = 2; index < 16; index += 2) {
                    ip += ":" + hex_encode(data[index], data[index + 1])
                }
                ip = ip.replace(/:(0:){2,}/, "::");
                ip = ip.replace(/^(0::)/, "::");
                ip = ip.replace(/(::0)$/, "::");
                if (data.length === 18) {
                    port = (data[16] << 8) | data[17]
                }
            }
        } else {
            if (ip) {
                data = new Uint8Array(16);
                var array = ip.split(".");
                if (array.length === 1) {
                    data = parse_v6(data, ip, 8)
                } else {
                    if (array.length === 4) {
                        var prefix = array[0];
                        var pos = prefix.lastIndexOf(":");
                        array[0] = prefix.substring(pos + 1);
                        prefix = prefix.substring(0, pos);
                        data = parse_v6(data, prefix, 6);
                        data = parse_v4(data, array)
                    } else {
                        throw new URIError("IPv6 format error: " + ip)
                    }
                }
            } else {
                throw new URIError("IP data empty: " + data + ", " + ip + ", " + port)
            }
        }
        Host.call(this, ip, port, data)
    };
    sys.Class(IPv6, Host, null);
    IPv6.prototype.valueOf = function() {
        if (this.port === 0) {
            return this.ip
        } else {
            return "[" + this.ip + "]:" + this.port
        }
    };
    IPv6.patten = /^\[?([0-9A-Fa-f]{0,4}:){2,7}[0-9A-Fa-f]{0,4}(]:\d{1,5})?$/;
    IPv6.patten_compat = /^\[?([0-9A-Fa-f]{0,4}:){2,6}(\d{1,3}.){3}\d{1,3}(]:\d{1,5})?$/;
    IPv6.parse = function(host) {
        if (!this.patten.test(host) && !this.patten_compat.test(host)) {
            return null
        }
        var ip, port;
        if (host.charAt(0) === "[") {
            var pos = host.indexOf("]");
            ip = host.substring(1, pos);
            port = parseInt(host.substring(pos + 2))
        } else {
            ip = host;
            port = 0
        }
        return new IPv6(ip, port)
    };
    ns.IPv6 = IPv6;
    ns.registers("IPv6")
})(StarGate, MONKEY);
(function(ns, base, sys) {
    var StarShip = base.StarShip;
    var WSShip = function(pack, priority, delegate) {
        StarShip.call(this, priority, delegate);
        this.__pack = pack
    };
    sys.Class(WSShip, StarShip, null);
    WSShip.prototype.getPackage = function() {
        return this.__pack
    };
    WSShip.prototype.getSN = function() {
        return this.__pack
    };
    WSShip.prototype.getPayload = function() {
        return this.__pack
    };
    ns.WSShip = WSShip;
    ns.registers("WSShip")
})(StarGate, StarTrek, MONKEY);
(function(ns, base, sys) {
    var StarDocker = base.StarDocker;
    var StarShip = base.StarShip;
    var WSShip = ns.WSShip;
    var WSDocker = function(gate) {
        StarDocker.call(this, gate)
    };
    sys.Class(WSDocker, StarDocker, null);
    WSDocker.prototype.pack = function(payload, priority, delegate) {
        return new WSShip(payload, priority, delegate)
    };
    WSDocker.prototype.getIncomeShip = function() {
        var gate = this.getGate();
        var pack = gate.receive(1024 * 1024, true);
        if (!pack) {
            return null
        }
        return new WSShip(pack, 0, null)
    };
    WSDocker.prototype.processIncomeShip = function(income) {
        var data = income.getPayload();
        if (data.length === 0) {
            return null
        } else {
            if (data.length === 2) {
                if (sys.type.Arrays.equals(data, OK)) {
                    return null
                }
            } else {
                if (data.length === 4) {
                    if (sys.type.Arrays.equals(data, NOOP)) {
                        return null
                    } else {
                        if (sys.type.Arrays.equals(data, PONG)) {
                            return null
                        } else {
                            if (sys.type.Arrays.equals(data, PING)) {
                                return new WSShip(PONG, StarShip.SLOWER, null)
                            }
                        }
                    }
                }
            }
        }
        var gate = this.getGate();
        var delegate = gate.getDelegate();
        var res = delegate.onGateReceived(gate, income);
        if (res) {
            return new WSShip(res, StarShip.NORMAL, null)
        } else {
            return null
        }
    };
    WSDocker.prototype.getHeartbeat = function() {
        return new WSShip(PING, StarShip.SLOWER, null)
    };
    var PING = sys.format.UTF8.encode("PING");
    var PONG = sys.format.UTF8.encode("PONG");
    var NOOP = sys.format.UTF8.encode("NOOP");
    var OK = sys.format.UTF8.encode("OK");
    ns.WSDocker = WSDocker;
    ns.registers("WSDocker")
})(StarGate, StarTrek, MONKEY);
(function(ns, base, sys) {
    var Gate = base.Gate;
    var StarGate = base.StarGate;
    var Connection = ns.Connection;
    var WSDocker = ns.WSDocker;
    var WSGate = function(connection) {
        StarGate.call(this);
        this.connection = connection
    };
    sys.Class(WSGate, StarGate, [Connection.Delegate]);
    WSGate.prototype.createDocker = function() {
        return new WSDocker(this)
    };
    WSGate.prototype.isRunning = function() {
        var running = StarGate.prototype.isRunning.call(this);
        return running && this.connection.isRunning()
    };
    WSGate.prototype.isExpired = function() {
        var status = this.connection.getStatus();
        return Connection.Status.EXPIRED.equals(status)
    };
    WSGate.prototype.getStatus = function() {
        var status = this.connection.getStatus();
        return WSGate.getStatus(status)
    };
    WSGate.getStatus = function(connStatus) {
        if (Connection.Status.CONNECTING.equals(connStatus)) {
            return Gate.Status.CONNECTING
        } else {
            if (Connection.Status.CONNECTED.equals(connStatus)) {
                return Gate.Status.CONNECTED
            } else {
                if (Connection.Status.MAINTAINING.equals(connStatus)) {
                    return Gate.Status.CONNECTED
                } else {
                    if (Connection.Status.EXPIRED.equals(connStatus)) {
                        return Gate.Status.CONNECTED
                    } else {
                        if (Connection.Status.ERROR.equals(connStatus)) {
                            return Gate.Status.ERROR
                        } else {
                            return Gate.Status.INIT
                        }
                    }
                }
            }
        }
    };
    WSGate.prototype.send = function(pack) {
        var conn = this.connection;
        if (conn.isRunning()) {
            return conn.send(pack) === pack.length
        } else {
            return false
        }
    };
    WSGate.prototype.receive = function(length, remove) {
        var available = this.connection.available();
        if (available === 0) {
            return null
        } else {
            if (available < length) {
                length = available
            }
        }
        return this.connection.receive(length)
    };
    WSGate.prototype.onConnectionStatusChanged = function(connection, oldStatus, newStatus) {
        var s1 = WSGate.getStatus(oldStatus);
        var s2 = WSGate.getStatus(newStatus);
        if (!s1.equals(s2)) {
            var delegate = this.getDelegate();
            if (delegate) {
                delegate.onGateStatusChanged(this, s1, s2)
            }
        }
    };
    WSGate.prototype.onConnectionReceivedData = function(connection, data) {};
    ns.WSGate = WSGate;
    ns.registers("WSGate")
})(StarGate, StarTrek, MONKEY);
