;
// license: https://mit-license.org
//
//  MONKEY: Memory Object aNd KEYs
//
//                               Written in 2020 by Moky <albert.moky@gmail.com>
//
// =============================================================================
// The MIT License (MIT)
//
// Copyright (c) 2020 Albert Moky
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

//! require 'arrays.js'

(function (ns) {
    'use strict';

    var Arrays = ns.type.Arrays;

    /**
     *  Create data bytes with capacity, or another data bytes
     *
     *  Usages:
     *      1. new Data();
     *      2. new Data(capacity);
     *      3. new Data(other);
     *      4. new Data(buffer);
     *      5. new Data(buffer, offset, length);
     */
    var bytes = function () {
        Object.call(this);
        this._buffer = null;
        this._offset = 0;
        this._length = 0;
        if (arguments.length === 0) {
            // 1. default capacity
            this._buffer = new Uint8Array(4);
        } else if (arguments.length === 1) {
            var arg = arguments[0];
            if (typeof arg === 'number') {
                // 2. create empty buffer with capacity
                this._buffer = new Uint8Array(arg);
            } else if (arg instanceof bytes) {
                // 3. create from another object
                // (this will share the same ArrayBuffer)
                this._buffer = arg._buffer;
                this._offset = arg._offset;
                this._length = arg._length;
            } else {
                // 4. create with another array
                if (arg instanceof Uint8Array) {
                    this._buffer = arg;
                } else {
                    this._buffer = new Uint8Array(arg);
                }
                this._length = arg.length;
            }
        } else if (arguments.length === 3) {
            // 5. create with another array, and offset, length
            this._buffer = arguments[0];
            this._offset = arguments[1];
            this._length = arguments[2];
        } else {
            throw new SyntaxError('arguments error: ' + arguments);
        }
    };
    ns.Class(bytes, Object, null, null);

    bytes.ZERO = new bytes(new Uint8Array(0), 0, 0);

    bytes.prototype.getBuffer = function () {
        return this._buffer;
    };
    bytes.prototype.getOffset = function () {
        return this._offset;
    };

    /**
     *  Check whether bytes equal
     *
     * @param {bytes|Uint8Array|uint[]} other - another array
     * @return {boolean}
     */
    bytes.prototype.equals = function (other) {
        if (!other) {
            // empty array
            return this._length === 0;
        } else if (this === other) {
            // same object
            return true;
        }
        var otherBuffer, otherOffset, otherLength;
        if (other instanceof bytes) {
            otherBuffer = other._buffer;
            otherOffset = other._offset;
            otherLength = other._length;
        } else {  // if (other instanceof Array)
            otherBuffer = other;
            otherOffset = 0;
            otherLength = other.length;
        }
        // pre-checking
        if (this._length !== otherLength) {
            return false;
        } else if (this._buffer === otherBuffer && this._offset === otherOffset) {
            return true;
        }
        // check items one by one
        var buffer = this._buffer;
        var pos1 = this._offset + this._length - 1;
        var pos2 = otherOffset + otherLength - 1;
        for (; pos2 >= otherOffset; --pos1, --pos2) {
            if (buffer[pos1] !== otherBuffer[pos2]) {
                return false;
            }
        }
        return true;
    };

    // adjust the position within range [0, len)
    var adjust = function (pos, len) {
        if (pos < 0) {
            pos += len;    // count from right hand
            if (pos < 0) {
                return 0;  // too small
            }
        } else if (pos > len) {
            return len;    // too big
        }
        return pos;
    };
    bytes.adjust = adjust;

    //
    //  Searching
    //

    /**
     *  Search value in range [start, end)
     *
     * @param {uint} value - element value
     * @param {int} start - start position (include)
     * @param {int} end   - end position (exclude)
     * @return -1 on not found
     */
    var find_value = function (value, start, end) {
        // adjust position
        start += this._offset;
        end += this._offset;
        for (; start < end; ++start) {
            if (this._buffer[start] === value) {
                // got it
                return start - this._offset;
            }
        }
        return -1;
    };

    /**
     *  Search sub data in range [start, end)
     *
     * @param {bytes} sub - sub data
     * @param {int} start - start position (include)
     * @param {int} end   - end position (exclude)
     * @return -1 on not found
     */
    var find_sub = function (sub, start, end) {
        if ((end - start) < sub._length) {
            return -1;
        }
        start += this._offset;
        end += this._offset - sub._length + 1;
        if (this._buffer === sub._buffer) {
            // same buffer
            if (start === sub._offset) {
                return start - this._offset;
            }
            // NOTICE: if (start < sub.offset < end), then the position (sub.offset - this.offset) is right,
            //         but we cannot confirm this is the first position it appeared,
            //         so we still need to do searching.
        }
        var index;
        for (; start < end; ++start) {
            for (index = 0; index < sub._length; ++index) {
                if (this._buffer[start + index] !== sub._buffer[sub._offset + index]) {
                    // not match
                    break;
                }
            }
            if (index === sub._length) {
                // got it
                return start - this._offset;
            }
        }
        return -1;
    };

    /**
     *  Find item value or sub bytes
     *
     *  Usages:
     *      1. find(value);
     *      2. find(value, start);
     *      3. find(value, start, end);
     *      4. find(sub);
     *      5. find(sub, start);
     *      6. find(sub, start, end);
     *
     * @return -1 on not found
     */
    bytes.prototype.find = function () {
        var sub, start, end;
        if (arguments.length === 1) {
            sub = arguments[0];
            start = 0;
            end = this._length;
        } else if (arguments.length === 2) {
            sub = arguments[0];
            start = arguments[1];
            end = this._length;
            start = adjust(start, this._length);
        } else if (arguments.length === 3) {
            sub = arguments[0];
            start = arguments[1];
            end = arguments[2];
            start = adjust(start, this._length);
            end = adjust(end, this._length);
        } else {
            throw new SyntaxError('arguments error: ' + arguments);
        }
        if (typeof sub === 'number') {
            return find_value.call(this, sub & 0xFF, start, end);
        } else if (sub instanceof bytes) {
            return find_sub.call(this, sub, start, end);
        } else {
            return find_sub.call(this, new bytes(sub), start, end);
        }
    };

    /**
     *  Get value with index
     *
     * @param {Number} index
     * @return {uint}
     */
    bytes.prototype.getByte = function (index) {
        // check position
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                throw new RangeError('error index: ' + (index - this._length) + ', length: ' + this._length);
            }
        } else if (index >= this._length) {
            throw new RangeError('error index: ' + index + ', length: ' + this._length);
        }
        return this._buffer[this._offset + index];
    };

    /**
     *  Get bytes within range [start, end)
     *
     * @param {int} start - start position (include)
     * @param {int} end   - end position (exclude)
     * @return {Uint8Array} sub bytes
     */
    var get_bytes = function (start, end) {
        start += this._offset;
        end += this._offset;
        // check range
        if (start === 0 && end === this._buffer.length) {
            // who buffer
            return this._buffer;
        } else if (start < end) {
            // sub view
            return this._buffer.subarray(start, end);
        } else {
            // empty buffer
            return this.ZERO.getBytes();
        }
    };

    /**
     *  Get bytes within range [start, end)
     *
     *  Usages:
     *      1. getBytes();
     *      2. getBytes(start);
     *      3. getBytes(start, end);
     *
     * @return {Uint8Array}
     */
    bytes.prototype.getBytes = function () {
        var start, end;
        if (arguments.length === 0) {
            start = 0;
            end = this._length;
        } else if (arguments.length === 1) {
            start = arguments[0];
            end = this._length;
            start = adjust(start, this._length);
        } else if (arguments.length === 2) {
            start = arguments[0];
            end = arguments[1];
            start = adjust(start, this._length);
            end = adjust(end, this._length);
        } else {
            throw new SyntaxError('arguments error: ' + arguments);
        }
        return get_bytes.call(this, start, end);
    };

    /**
     *  Get sub data within range [start, end)
     *
     *  Usages:
     *      1. slice(start);
     *      2. slice(start, end);
     *
     * @return {bytes}
     */
    bytes.prototype.slice = function (start) {
        var end;
        if (arguments.length === 2) {
            end = arguments[1];
            end = adjust(end, this._length);
        } else {
            end = this._length;
        }
        start = adjust(start, this._length);
        return slice(this, start, end);
    };

    var slice = function (data, start, end) {
        if (start === 0 && end === data._length) {
            // whole data
            return data;
        } else if (start < end) {
            // sub view
            return new bytes(data._buffer, data._offset + start, end - start);
        } else {
            // error
            return bytes.ZERO;
        }
    };

    /**
     *  Combines two or more data.
     *
     *  Usages:
     *      1. concat(other);
     *      2. concat(other1, other2, ...);
     *
     * @return {bytes}
     */
    bytes.prototype.concat = function () {
        var result = this;
        var arg, other;
        for (var i = 0; i < arguments.length; ++i) {
            arg = arguments[i];
            if (arg instanceof bytes) {
                other = arg;
            } else {
                other = new bytes(arg);
            }
            result = concat(result, other);
        }
        return result;
    };

    var concat = function (left, right) {
        if (left._length === 0) {
            return right;
        } else if (right._length === 0) {
            return left;
        } else if (left._buffer === right._buffer && (left._offset + left._length) === right._offset) {
            // sticky data
            return new bytes(left._buffer, left._offset, left._length + right._length);
        } else {
            var joined = new Uint8Array(left._length + right._length);
            Arrays.copy(left._buffer, left._offset, joined, 0, left._length);
            Arrays.copy(right._buffer, right._offset, joined, left._length, right._length);
            return new bytes(joined, 0, joined.length);
        }
    };

    /**
     *  Clone data
     *
     * @return {bytes}
     */
    bytes.prototype.copy = function () {
        return new bytes(this._buffer, this._offset, this._length);
    };

    bytes.prototype.mutableCopy = function () {
        var buffer = this.getBytes();
        buffer = new Uint8Array(buffer);
        return new bytes(buffer, 0, buffer.length);
    };

    /**
     *  Convert Uint8Array to Array
     *
     * @return {uint[]}
     */
    bytes.prototype.toArray = function () {
        var array = this.getBytes();
        if (typeof Array.from === 'function') {
            return Array.from(array);
        } else {
            return [].slice.call(array);
        }
    };

    //-------- namespace --------
    ns.type.Data = bytes;

    ns.type.registers('Data');

})(MONKEY);
