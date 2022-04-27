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

//! require 'data.js'

(function (ns) {
    'use strict';

    var Arrays = ns.type.Arrays;

    /**
     *  Mutable Data View
     */
    var bytes = ns.type.Data;
    var adjust = bytes.adjust;

    var resize = function (size) {
        var bigger = new Uint8Array(size);
        Arrays.copy(this._buffer, this._offset, bigger, 0, this._length);
        this._buffer = bigger;
        this._offset = 0;
    };

    var expand = function () {
        var capacity = this._buffer.length - this._offset;
        if (capacity > 4) {
            resize.call(this, capacity << 1);
        } else {
            resize.call(this, 8);
        }
    };

    /**
     *  Set value with index
     *
     * @param {int}  index
     * @param {uint} value
     */
    bytes.prototype.setByte = function (index, value) {
        // adjust position
        if (index < 0) {
            index += this._length;  // count from right hand
            if (index < 0) {
                return false;      // too small
                //throw new RangeError('error index: ' + (index - this._length) + ', length: ' + this._length);
            }
        }
        // check position
        if (index >= this._length) {
            // target position is out of range [offset, offset + length)
            // check empty spaces on the right
            if (this._offset + index >= this._buffer.length) {
                // empty spaces on the right not enough
                // check empty spaces on the left
                if (index < this._buffer.length) {
                    // move all data left
                    Arrays.copy(this._buffer, this._offset, this._buffer, 0, this._length);
                    this._offset = 0;
                } else {
                    // current space not enough, expand it
                    resize.call(this, index + 1);
                }
            }
            // TODO: fill range [offset + length, offset + index) with ZERO?
            this._length = index + 1;
        }
        this._buffer[this._offset + index] = value & 0xFF;
        return true;
    };

    /**
     *  Copy values from source buffer with range [start, end)
     *
     * @param {bytes} data        - self
     * @param {int} pos           - copy to self buffer from this position
     * @param {Uint8Array} source - source buffer
     * @param {int} start         - source start position (include)
     * @param {int} end           - source end position (exclude)
     */
    var copy_buffer = function (data, pos, source, start, end) {
        var copyLen = end - start;
        if (copyLen > 0) {
            var copyEnd = pos + copyLen;  // relative to offset
            if (source !== data._buffer || (data._offset + pos) !== start) {
                // not sticky data
                if (data._offset + copyEnd > data._buffer.length) {
                    // expend the buffer to this size
                    resize.call(data, copyEnd);
                }
                // copy buffer
                Arrays.copy(source, start, data._buffer, data._offset + pos, copyLen);
            }
            // reset view length
            if (copyEnd > data._length) {
                data._length = copyEnd;
            }
        }
    };

    /**
     *  Copy data from source to position
     *
     *  Usages:
     *      1. fill(pos, source);
     *      2. fill(pos, source, start);
     *      3. fill(pos, source, start, end);
     *
     * @param {int} pos    - self position to copy data
     * @param {bytes|Uint8Array} source - data source
     */
    bytes.prototype.fill = function (pos, source) {
        if (pos < 0) {
            pos += this._length;  // count from right hand
            if (pos < 0) {
                throw new RangeError('error position: ' + (pos - this._length) + ', length: ' + this._length);
            }
        }
        var start, end;
        if (arguments.length === 4) {
            // fill(pos, source, start, end);
            start = arguments[2];
            end = arguments[3];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source));
        } else if (arguments.length === 3) {
            // fill(pos, source, start);
            start = arguments[2];
            end = get_length(source);
            start = adjust(start, get_length(source));
        } else {
            // fill(pos, source);
            start = 0;
            end = get_length(source);
        }
        if (source instanceof bytes) {
            copy_buffer(this, pos, source._buffer, source._offset + start, source._offset + end);
        } else {
            copy_buffer(this, pos, source, start, end);
        }
    };

    var get_length = function (source) {
        if (source instanceof bytes) {
            return source._length;
        } else {
            return source.length;
        }
    };

    //
    //  Expanding
    //

    /**
     *  Append data from source
     *
     *  Usages:
     *      1. append(source);
     *      2. append(source, start);
     *      3. append(source, start, end);
     *      4. append(source1, source2, ...);
     *
     * @param {bytes|Uint8Array} source - data source
     */
    bytes.prototype.append = function (source) {
        if (arguments.length > 1 && typeof arguments[1] !== 'number') {
            // append(bytes1, bytes2, ...);
            for (var i = 0; i < arguments.length; ++i) {
                this.append(arguments[i]);
            }
            return
        }
        var start, end;
        if (arguments.length === 3) {
            // append(bytes, start, end);
            start = arguments[1];
            end = arguments[2];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source));
        } else if (arguments.length === 2) {
            // append(bytes, start);
            start = arguments[1];
            end = get_length(source);
            start = adjust(start, get_length(source));
        } else {
            // append(bytes);
            start = 0;
            end = get_length(source);
        }
        if (source instanceof bytes) {
            copy_buffer(this, this._length, source._buffer, source._offset + start, source._offset + end);
        } else {
            copy_buffer(this, this._length, source, start, end);
        }
    };

    /**
     *  Insert the value to this position
     *
     * @param {int}  index - position
     * @param {uint} value - value
     * @return false for ArrayIndexOutOfBoundsException
     */
    bytes.prototype.insert = function (index, value) {
        // check position
        if (index < 0) {
            index += this._length;  // count from right hand
            if (index < 0) {
                return false;      // too small
                //throw new RangeError('error index: ' + (index - this._length) + ', length: ' + this._length);
            }
        }
        if (index >= this._length) {
            // target position is out of range [offset, offset + length)
            // set it directly
            return this.setByte(index, value);
        }
        if (index === 0) {
            // insert to the head
            if (this._offset > 0) {
                // empty spaces exist before the queue, no need to move elements
                this._offset -= 1;
            } else {
                // no empty space before the queue
                if (this._length === this._buffer.length) {
                    // the buffer is full, expand it
                    expand.call(this);
                }
                // move the queue to right
                Arrays.copy(this._buffer, 0, this._buffer, 1, this._length);
            }
        } else if (index < (this._length >> 1)) {
            // target position is near the head
            if (this._offset > 0) {
                // empty spaces found before the queue, move left part
                Arrays.copy(this._buffer, this._offset, this._buffer, this._offset - 1, index);
                this._offset -= 1;
            } else {
                if ((this._offset + this._length) === this._buffer.length) {
                    // the space is full, expand it
                    expand.call(this);
                }
                // move right part
                Arrays.copy(this._buffer, this._offset + index,
                    this._buffer, this._offset + index + 1, this._length - index);
            }
        } else {
            // target position is near the tail
            if ((this._offset + this._length) < this._buffer.length) {
                // empty spaces found after the queue, move right part
                Arrays.copy(this._buffer, this._offset + index,
                    this._buffer, this._offset + index + 1, this._length - index);
            } else if (this._offset > 0) {
                // empty spaces found before the queue, move left part
                Arrays.copy(this._buffer, this._offset, this._buffer, this._offset - 1, index);
                this._offset -= 1;
            } else {
                // the space is full, expand it
                expand.call(this);
                // move right part
                Arrays.copy(this._buffer, this._offset + index,
                    this._buffer, this._offset + index + 1, this._length - index);
            }
        }
        this._buffer[this._offset + index] = value & 0xFF;
        this._length += 1;
        return true;
    };

    //
    //  Erasing
    //

    /**
     *  Remove element at this position and return its value
     *
     * @param {int} index - position
     * @return {uint} value removed
     * @throws RangeError on error
     */
    bytes.prototype.remove = function (index) {
        // adjust position
        if (index < 0) {
            index += this._length;  // count from right hand
            if (index < 0) {       // too small
                throw new RangeError('error index: ' + (index - this._length) + ', length: ' + this._length);
            }
        } else if (index >= this._length) {  // too big
            throw new RangeError('index error: ' + index + ', length: ' + this._length);
        }
        if (index === 0) {
            // remove the first element
            return this.shift();
        } else if (index === (this._length - 1)) {
            // remove the last element
            return this.pop();
        }
        // remove inside element
        var erased = this._buffer[this._offset + index];
        if (index < (this._length >> 1)) {
            // target position is near the head, move the left part
            Arrays.copy(this._buffer, this._offset, this._buffer, this._offset + 1, index);
        } else {
            // target position is near the tail, move the right part
            Arrays.copy(this._buffer, this._offset + index + 1,
                this._buffer, this._offset + index, this._length - index - 1);
        }
        return erased;
    };

    /**
     *  Remove element from the head position and return its value
     *
     * @return {uint} value (removed) at the first place
     * @throws RangeError on data empty
     */
    bytes.prototype.shift = function () {
        if (this._length < 1) {
            throw new RangeError('data empty!');
        }
        var erased = this._buffer[this._offset];
        this._offset += 1;
        this._length -= 1;
        return erased;
    };

    /**
     *  Remove element from the tail position and return its value
     *
     * @return {uint} value (removed) at the last place
     * @throws RangeError on data empty
     */
    bytes.prototype.pop = function () {
        if (this._length < 1) {
            throw new RangeError('data empty!');
        }
        this._length -= 1;
        return this._buffer[this._offset + this._length];
    };

    /**
     *  Append the element to the tail
     *
     * @param {uint} element - new item value
     */
    bytes.prototype.push = function (element) {
        this.setByte(this._length, element);
    };

    //-------- namespace --------
    ns.type.MutableData = bytes;

    ns.type.registers('MutableData');

})(MONKEY);
