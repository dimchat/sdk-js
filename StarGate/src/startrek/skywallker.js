;
// license: https://mit-license.org
//
//  Star Trek: Interstellar Transport
//
//                               Written in 2021 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2021 Albert Moky
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// =============================================================================
//

//! require <dimp.js>
//! require 'namespace.js'

(function (ns) {
    "use strict";

    var Handler = function () {
    };
    DIMP.Interface(Handler, null);

    /**
     *  Prepare for handling
     */
    Handler.prototype.setup = function () {
        console.assert(false, 'implement me!');
    };

    /**
     *  Handling run loop
     */
    Handler.prototype.handle = function () {
        console.assert(false, 'implement me!');
    };

    /**
     *  Cleanup after handled
     */
    Handler.prototype.finish = function () {
        console.assert(false, 'implement me!');
    };

    //-------- namespace --------
    ns.Handler = Handler;

    ns.register('Handler');

})(StarTrek);

(function (ns) {
    "use strict";

    var Processor = function () {
    };
    DIMP.Interface(Processor, null);

    /**
     *  Do the job
     *
     * @return false on nothing to do
     */
    Processor.prototype.process = function () {
        console.assert(false, 'implement me!');
        return false;
    };

    //-------- namespace --------
    ns.Processor = Processor;

    ns.register('Processor');

})(StarTrek);

(function (ns) {
    "use strict";

    var Handler = ns.Handler;
    var Processor = ns.Processor;

    var Runner = function () {
        this.running = false;
    };
    DIMP.Class(Runner, [Handler, Processor]);

    Runner.prototype.isRunning = function () {
        return this.running;
    };

    var sleep = function (millis) {
        var startTime = new Date().getTime() + parseInt(millis, 10);
        while(new Date().getTime() < startTime) {}
    };

    Runner.prototype.idle = function () {
        sleep(8);
    };

    Runner.prototype.stop = function () {
        this.running = false;
    };

    Runner.prototype.run = function () {
        this.setup();
        try {
            this.handle();
        } finally {
            this.finish();
        }
    };

    Runner.prototype.setup = function () {
        this.running = true;
    };

    Runner.prototype.handle = function () {
        while (this.isRunning()) {
            if (!this.process()) {
                this.idle();
            }
        }
    };

    Runner.prototype.finish = function () {
        this.running = false;
    };

    //-------- namespace --------
    ns.Runner = Runner;

    ns.register('Runner');

})(StarTrek);
