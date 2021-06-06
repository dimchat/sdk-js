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
     *  (when return true, means still have work to do, call this again after sleep)
     *
     * @return {boolean} false on job done
     */
    Handler.prototype.setup = function () {
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Handling run loop
     *  (when return true, means still have work to do, call this again after sleep)
     *
     * @return {boolean} false on job done
     */
    Handler.prototype.handle = function () {
        console.assert(false, 'implement me!');
        return false;
    };

    /**
     *  Cleanup after handled
     *  (when return true, means still have work to do, call this again after sleep)
     *
     * @return {boolean} false on job done
     */
    Handler.prototype.finish = function () {
        console.assert(false, 'implement me!');
        return false;
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
     *  (when return true, means still have work to do, call this again immediately)
     *
     * @return false on nothing to do now
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

    var STAGE_SETTING = 0;
    var STAGE_RUNNING = 1;
    var STAGE_CLOSING = 2;
    var STAGE_STOPPED = 3;

    var Runner = function () {
        this.__running = false;
        this.__stage = STAGE_SETTING;
    };
    DIMP.Class(Runner, null, [Handler, Processor]);

    /**
     *  Check whether still running
     *
     * @return {boolean} false on stopped
     */
    Runner.prototype.isRunning = function () {
        return this.__running;
    };

    /**
     *  Start running
     */
    Runner.prototype.start = function () {
        this.__running = true;
        run(this);
    };

    /**
     *  Stop running
     */
    Runner.prototype.stop = function () {
        this.__running = false;
    };

    var run = function (runner) {
        if (runner.isRunning() && runner.run()) {
            // no finished yet, call it after sleeping
            setTimeout(function () {
                run(runner);
            }, runner.idle());
        }
    };

    Runner.prototype.idle = function () {
        return 8;
    };

    /**
     *  Run
     *  (when return true, means still have work to do, call this again after sleep)
     *
     * @return {boolean} false on all jobs done
     */
    Runner.prototype.run = function () {
        // this.setup();
        // try {
        //     this.handle();
        // } finally {
        //     this.finish();
        // }
        if (this.__stage === STAGE_SETTING) {
            if (this.setup()) {
                // setting not finished yet, sleep and call again
                return true;
            } else {
                // setting finished, move on
                this.__stage = STAGE_RUNNING;
            }
        }
        if (this.__stage === STAGE_RUNNING) {
            try {
                if (this.handle()) {
                    // handling not finished yet, sleep and call again
                    return true;
                } else {
                    // handling finished, move on
                    this.__stage = STAGE_CLOSING;
                }
            } catch (e) {
                // handle error, move on
                this.__stage = STAGE_CLOSING;
            }
        }
        if (this.__stage === STAGE_CLOSING) {
            if (this.finish()) {
                // closing not finished yet, sleep and call again
                return true;
            } else {
                // closing finished, move on
                this.__stage = STAGE_STOPPED;
            }
        }
        // all jobs done, stop it
        this.__running = false;
        return false;
    };

    Runner.prototype.setup = function () {
        // do nothing;
    };

    Runner.prototype.handle = function () {
        while (this.isRunning() && this.process()) {
            // still have job waiting for processing
            // do it again immediately
        }
        return this.isRunning();
    };

    Runner.prototype.finish = function () {
        // do nothing;
    };

    //-------- namespace --------
    ns.Runner = Runner;

    ns.register('Runner');

})(StarTrek);
