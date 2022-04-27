;
// license: https://mit-license.org
//
//  MONKEY: Memory Object aNd KEYs
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

//! require 'class.js'

(function (ns) {
    'use strict';

    var Runnable = function () {};
    ns.Interface(Runnable, null);

    /**
     *  Run
     *
     * @return {boolean} false on finished, true on continuous
     */
    Runnable.prototype.run = function () {
        console.assert(false, 'implement me!');
        return false;
    };
    //-------- namespace --------
    ns.threading.Runnable = Runnable;

    ns.threading.registers('Runnable');

})(MONKEY);

(function (ns) {
    'use strict';

    var Runnable = ns.threading.Runnable;

    /**
     *  Create Thread for runnable target
     *
     *  Usages:
     *      1. new Thread();
     *      2. new Thread(runnable);
     *      3. new Thread(interval);
     *      4. new Thread(runnable, interval);
     */
    var Thread = function () {
        Object.call(this);
        if (arguments.length === 0) {
            // new Thread();
            this.__target = null;
            this.__interval = 128;
        } else if (arguments.length === 2) {
            // new Thread(runnable, interval);
            this.__target = arguments[0];
            this.__interval = arguments[1];
        } else if (typeof arguments[0] === 'number') {
            // new Thread(interval);
            this.__target = null;
            this.__interval = arguments[0];
        } else {
            // new Thread(runnable);
            this.__target = arguments[0];
            this.__interval = 128;
        }
        this.__running = false;
        this.__thread_id = 0;
    };
    ns.Class(Thread, Object, [Runnable]);

    /**
     *  Start running
     */
    Thread.prototype.start = function () {
        this.__running = true;
        var thread = this;
        this.__thread_id = setInterval(function () {
            var ran = thread.isRunning() && thread.run();
            if (!ran) {
                stop(thread);
            }
        }, this.getInterval());
    };
    var stop = function (thread) {
        var tid = thread.__thread_id;
        if (tid > 0) {
            thread.__thread_id = 0;
            clearInterval(tid);
        }
    }
    /**
     *  Stop running
     */
    Thread.prototype.stop = function () {
        // force to stop immediately
        stop(this);
        this.__running = false;
    };

    /**
     *  Check whether thread is running
     *
     * @return {boolean} false on stopped
     */
    Thread.prototype.isRunning = function () {
        return this.__running;
    };

    /**
     *  Get idle interval
     *
     * @return {number} milliseconds
     */
    Thread.prototype.getInterval = function () {
        return this.__interval;
    };

    // return true for sleeping a while to continued
    Thread.prototype.run = function () {
        var target = this.__target;
        if (!target || target === this) {
            throw new SyntaxError('Thread::run() > override me!');
        } else {
            return target.run();
        }
    };

    //-------- namespace --------
    ns.threading.Thread = Thread;

    ns.threading.registers('Thread');

})(MONKEY);
