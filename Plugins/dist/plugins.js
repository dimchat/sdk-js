/**
 *  DIM-Plugins (v0.2.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Apr. 25, 2022
 * @copyright (c) 2022 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    var Arrays = ns.type.Arrays;
    var bytes = function () {
        Object.call(this);
        this._buffer = null;
        this._offset = 0;
        this._length = 0;
        if (arguments.length === 0) {
            this._buffer = new Uint8Array(4);
        } else {
            if (arguments.length === 1) {
                var arg = arguments[0];
                if (typeof arg === "number") {
                    this._buffer = new Uint8Array(arg);
                } else {
                    if (arg instanceof bytes) {
                        this._buffer = arg._buffer;
                        this._offset = arg._offset;
                        this._length = arg._length;
                    } else {
                        if (arg instanceof Uint8Array) {
                            this._buffer = arg;
                        } else {
                            this._buffer = new Uint8Array(arg);
                        }
                        this._length = arg.length;
                    }
                }
            } else {
                if (arguments.length === 3) {
                    this._buffer = arguments[0];
                    this._offset = arguments[1];
                    this._length = arguments[2];
                } else {
                    throw new SyntaxError("arguments error: " + arguments);
                }
            }
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
    bytes.prototype.equals = function (other) {
        if (!other) {
            return this._length === 0;
        } else {
            if (this === other) {
                return true;
            }
        }
        var otherBuffer, otherOffset, otherLength;
        if (other instanceof bytes) {
            otherBuffer = other._buffer;
            otherOffset = other._offset;
            otherLength = other._length;
        } else {
            otherBuffer = other;
            otherOffset = 0;
            otherLength = other.length;
        }
        if (this._length !== otherLength) {
            return false;
        } else {
            if (this._buffer === otherBuffer && this._offset === otherOffset) {
                return true;
            }
        }
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
    var adjust = function (pos, len) {
        if (pos < 0) {
            pos += len;
            if (pos < 0) {
                return 0;
            }
        } else {
            if (pos > len) {
                return len;
            }
        }
        return pos;
    };
    bytes.adjust = adjust;
    var find_value = function (value, start, end) {
        start += this._offset;
        end += this._offset;
        for (; start < end; ++start) {
            if (this._buffer[start] === value) {
                return start - this._offset;
            }
        }
        return -1;
    };
    var find_sub = function (sub, start, end) {
        if (end - start < sub._length) {
            return -1;
        }
        start += this._offset;
        end += this._offset - sub._length + 1;
        if (this._buffer === sub._buffer) {
            if (start === sub._offset) {
                return start - this._offset;
            }
        }
        var index;
        for (; start < end; ++start) {
            for (index = 0; index < sub._length; ++index) {
                if (this._buffer[start + index] !== sub._buffer[sub._offset + index]) {
                    break;
                }
            }
            if (index === sub._length) {
                return start - this._offset;
            }
        }
        return -1;
    };
    bytes.prototype.find = function () {
        var sub, start, end;
        if (arguments.length === 1) {
            sub = arguments[0];
            start = 0;
            end = this._length;
        } else {
            if (arguments.length === 2) {
                sub = arguments[0];
                start = arguments[1];
                end = this._length;
                start = adjust(start, this._length);
            } else {
                if (arguments.length === 3) {
                    sub = arguments[0];
                    start = arguments[1];
                    end = arguments[2];
                    start = adjust(start, this._length);
                    end = adjust(end, this._length);
                } else {
                    throw new SyntaxError("arguments error: " + arguments);
                }
            }
        }
        if (typeof sub === "number") {
            return find_value.call(this, sub & 255, start, end);
        } else {
            if (sub instanceof bytes) {
                return find_sub.call(this, sub, start, end);
            } else {
                return find_sub.call(this, new bytes(sub), start, end);
            }
        }
    };
    bytes.prototype.getByte = function (index) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                throw new RangeError(
                    "error index: " + (index - this._length) + ", length: " + this._length
                );
            }
        } else {
            if (index >= this._length) {
                throw new RangeError(
                    "error index: " + index + ", length: " + this._length
                );
            }
        }
        return this._buffer[this._offset + index];
    };
    var get_bytes = function (start, end) {
        start += this._offset;
        end += this._offset;
        if (start === 0 && end === this._buffer.length) {
            return this._buffer;
        } else {
            if (start < end) {
                return this._buffer.subarray(start, end);
            } else {
                return this.ZERO.getBytes();
            }
        }
    };
    bytes.prototype.getBytes = function () {
        var start, end;
        if (arguments.length === 0) {
            start = 0;
            end = this._length;
        } else {
            if (arguments.length === 1) {
                start = arguments[0];
                end = this._length;
                start = adjust(start, this._length);
            } else {
                if (arguments.length === 2) {
                    start = arguments[0];
                    end = arguments[1];
                    start = adjust(start, this._length);
                    end = adjust(end, this._length);
                } else {
                    throw new SyntaxError("arguments error: " + arguments);
                }
            }
        }
        return get_bytes.call(this, start, end);
    };
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
            return data;
        } else {
            if (start < end) {
                return new bytes(data._buffer, data._offset + start, end - start);
            } else {
                return bytes.ZERO;
            }
        }
    };
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
        } else {
            if (right._length === 0) {
                return left;
            } else {
                if (
                    left._buffer === right._buffer &&
                    left._offset + left._length === right._offset
                ) {
                    return new bytes(
                        left._buffer,
                        left._offset,
                        left._length + right._length
                    );
                } else {
                    var joined = new Uint8Array(left._length + right._length);
                    Arrays.copy(left._buffer, left._offset, joined, 0, left._length);
                    Arrays.copy(
                        right._buffer,
                        right._offset,
                        joined,
                        left._length,
                        right._length
                    );
                    return new bytes(joined, 0, joined.length);
                }
            }
        }
    };
    bytes.prototype.copy = function () {
        return new bytes(this._buffer, this._offset, this._length);
    };
    bytes.prototype.mutableCopy = function () {
        var buffer = this.getBytes();
        buffer = new Uint8Array(buffer);
        return new bytes(buffer, 0, buffer.length);
    };
    bytes.prototype.toArray = function () {
        var array = this.getBytes();
        if (typeof Array.from === "function") {
            return Array.from(array);
        } else {
            return [].slice.call(array);
        }
    };
    ns.type.Data = bytes;
    ns.type.registers("Data");
})(MONKEY);
(function (ns) {
    var Arrays = ns.type.Arrays;
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
    bytes.prototype.setByte = function (index, value) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                return false;
            }
        }
        if (index >= this._length) {
            if (this._offset + index >= this._buffer.length) {
                if (index < this._buffer.length) {
                    Arrays.copy(
                        this._buffer,
                        this._offset,
                        this._buffer,
                        0,
                        this._length
                    );
                    this._offset = 0;
                } else {
                    resize.call(this, index + 1);
                }
            }
            this._length = index + 1;
        }
        this._buffer[this._offset + index] = value & 255;
        return true;
    };
    var copy_buffer = function (data, pos, source, start, end) {
        var copyLen = end - start;
        if (copyLen > 0) {
            var copyEnd = pos + copyLen;
            if (source !== data._buffer || data._offset + pos !== start) {
                if (data._offset + copyEnd > data._buffer.length) {
                    resize.call(data, copyEnd);
                }
                Arrays.copy(source, start, data._buffer, data._offset + pos, copyLen);
            }
            if (copyEnd > data._length) {
                data._length = copyEnd;
            }
        }
    };
    bytes.prototype.fill = function (pos, source) {
        if (pos < 0) {
            pos += this._length;
            if (pos < 0) {
                throw new RangeError(
                    "error position: " +
                    (pos - this._length) +
                    ", length: " +
                    this._length
                );
            }
        }
        var start, end;
        if (arguments.length === 4) {
            start = arguments[2];
            end = arguments[3];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source));
        } else {
            if (arguments.length === 3) {
                start = arguments[2];
                end = get_length(source);
                start = adjust(start, get_length(source));
            } else {
                start = 0;
                end = get_length(source);
            }
        }
        if (source instanceof bytes) {
            copy_buffer(
                this,
                pos,
                source._buffer,
                source._offset + start,
                source._offset + end
            );
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
    bytes.prototype.append = function (source) {
        if (arguments.length > 1 && typeof arguments[1] !== "number") {
            for (var i = 0; i < arguments.length; ++i) {
                this.append(arguments[i]);
            }
            return;
        }
        var start, end;
        if (arguments.length === 3) {
            start = arguments[1];
            end = arguments[2];
            start = adjust(start, get_length(source));
            end = adjust(end, get_length(source));
        } else {
            if (arguments.length === 2) {
                start = arguments[1];
                end = get_length(source);
                start = adjust(start, get_length(source));
            } else {
                start = 0;
                end = get_length(source);
            }
        }
        if (source instanceof bytes) {
            copy_buffer(
                this,
                this._length,
                source._buffer,
                source._offset + start,
                source._offset + end
            );
        } else {
            copy_buffer(this, this._length, source, start, end);
        }
    };
    bytes.prototype.insert = function (index, value) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                return false;
            }
        }
        if (index >= this._length) {
            return this.setByte(index, value);
        }
        if (index === 0) {
            if (this._offset > 0) {
                this._offset -= 1;
            } else {
                if (this._length === this._buffer.length) {
                    expand.call(this);
                }
                Arrays.copy(this._buffer, 0, this._buffer, 1, this._length);
            }
        } else {
            if (index < this._length >> 1) {
                if (this._offset > 0) {
                    Arrays.copy(
                        this._buffer,
                        this._offset,
                        this._buffer,
                        this._offset - 1,
                        index
                    );
                    this._offset -= 1;
                } else {
                    if (this._offset + this._length === this._buffer.length) {
                        expand.call(this);
                    }
                    Arrays.copy(
                        this._buffer,
                        this._offset + index,
                        this._buffer,
                        this._offset + index + 1,
                        this._length - index
                    );
                }
            } else {
                if (this._offset + this._length < this._buffer.length) {
                    Arrays.copy(
                        this._buffer,
                        this._offset + index,
                        this._buffer,
                        this._offset + index + 1,
                        this._length - index
                    );
                } else {
                    if (this._offset > 0) {
                        Arrays.copy(
                            this._buffer,
                            this._offset,
                            this._buffer,
                            this._offset - 1,
                            index
                        );
                        this._offset -= 1;
                    } else {
                        expand.call(this);
                        Arrays.copy(
                            this._buffer,
                            this._offset + index,
                            this._buffer,
                            this._offset + index + 1,
                            this._length - index
                        );
                    }
                }
            }
        }
        this._buffer[this._offset + index] = value & 255;
        this._length += 1;
        return true;
    };
    bytes.prototype.remove = function (index) {
        if (index < 0) {
            index += this._length;
            if (index < 0) {
                throw new RangeError(
                    "error index: " + (index - this._length) + ", length: " + this._length
                );
            }
        } else {
            if (index >= this._length) {
                throw new RangeError(
                    "index error: " + index + ", length: " + this._length
                );
            }
        }
        if (index === 0) {
            return this.shift();
        } else {
            if (index === this._length - 1) {
                return this.pop();
            }
        }
        var erased = this._buffer[this._offset + index];
        if (index < this._length >> 1) {
            Arrays.copy(
                this._buffer,
                this._offset,
                this._buffer,
                this._offset + 1,
                index
            );
        } else {
            Arrays.copy(
                this._buffer,
                this._offset + index + 1,
                this._buffer,
                this._offset + index,
                this._length - index - 1
            );
        }
        return erased;
    };
    bytes.prototype.shift = function () {
        if (this._length < 1) {
            throw new RangeError("data empty!");
        }
        var erased = this._buffer[this._offset];
        this._offset += 1;
        this._length -= 1;
        return erased;
    };
    bytes.prototype.pop = function () {
        if (this._length < 1) {
            throw new RangeError("data empty!");
        }
        this._length -= 1;
        return this._buffer[this._offset + this._length];
    };
    bytes.prototype.push = function (element) {
        this.setByte(this._length, element);
    };
    ns.type.MutableData = bytes;
    ns.type.registers("MutableData");
})(MONKEY);
(function (ns) {
    if (typeof String.prototype.repeat !== "function") {
        String.prototype.repeat = function (count) {
            var string = "";
            for (var i = 0; i < count; ++i) {
                string += this;
            }
            return string;
        };
    }
    function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
            throw new TypeError("Alphabet too long");
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255;
        }
        for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);
            if (BASE_MAP[xc] !== 255) {
                throw new TypeError(x + " is ambiguous");
            }
            BASE_MAP[xc] = i;
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);
        function encode(source) {
            if (source.length === 0) {
                return "";
            }
            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;
            while (pbegin !== pend && source[pbegin] === 0) {
                pbegin++;
                zeroes++;
            }
            var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
            var b58 = new Uint8Array(size);
            while (pbegin !== pend) {
                var carry = source[pbegin];
                var i = 0;
                for (
                    var it1 = size - 1;
                    (carry !== 0 || i < length) && it1 !== -1;
                    it1--, i++
                ) {
                    carry += (256 * b58[it1]) >>> 0;
                    b58[it1] = carry % BASE >>> 0;
                    carry = (carry / BASE) >>> 0;
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry");
                }
                length = i;
                pbegin++;
            }
            var it2 = size - length;
            while (it2 !== size && b58[it2] === 0) {
                it2++;
            }
            var str = LEADER.repeat(zeroes);
            for (; it2 < size; ++it2) {
                str += ALPHABET.charAt(b58[it2]);
            }
            return str;
        }
        function decodeUnsafe(source) {
            if (typeof source !== "string") {
                throw new TypeError("Expected String");
            }
            if (source.length === 0) {
                return [];
            }
            var psz = 0;
            if (source[psz] === " ") {
                return;
            }
            var zeroes = 0;
            var length = 0;
            while (source[psz] === LEADER) {
                zeroes++;
                psz++;
            }
            var size = ((source.length - psz) * FACTOR + 1) >>> 0;
            var b256 = new Uint8Array(size);
            while (source[psz]) {
                var carry = BASE_MAP[source.charCodeAt(psz)];
                if (carry === 255) {
                    return;
                }
                var i = 0;
                for (
                    var it3 = size - 1;
                    (carry !== 0 || i < length) && it3 !== -1;
                    it3--, i++
                ) {
                    carry += (BASE * b256[it3]) >>> 0;
                    b256[it3] = carry % 256 >>> 0;
                    carry = (carry / 256) >>> 0;
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry");
                }
                length = i;
                psz++;
            }
            if (source[psz] === " ") {
                return;
            }
            var it4 = size - length;
            while (it4 !== size && b256[it4] === 0) {
                it4++;
            }
            var vch = [];
            var j = 0;
            for (; j < zeroes; ++j) {
                vch[j] = 0;
            }
            while (it4 !== size) {
                vch[j++] = b256[it4++];
            }
            return vch;
        }
        function decode(string) {
            var buffer = decodeUnsafe(string);
            if (buffer) {
                return new Uint8Array(buffer);
            }
            throw new Error("Non-base" + BASE + " character");
        }
        return { encode: encode, decodeUnsafe: decodeUnsafe, decode: decode };
    }
    var bs58 = base("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    var DataCoder = ns.format.DataCoder;
    var Base58Coder = function () {
        Object.call(this);
    };
    ns.Class(Base58Coder, Object, [DataCoder], null);
    Base58Coder.prototype.encode = function (data) {
        return bs58.encode(data);
    };
    Base58Coder.prototype.decode = function (string) {
        return bs58.decode(string);
    };
    ns.format.Base58.setCoder(new Base58Coder());
})(MONKEY);
(function (ns) {
    var MutableData = ns.type.MutableData;
    var DataCoder = ns.format.DataCoder;
    var base64_chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i;
        }
    })(base64_chars, base64_values);
    var base64_encode = function (data) {
        var base64 = "";
        var length = data.length;
        var remainder = length % 3;
        length -= remainder;
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i + 1];
            x3 = data[i + 2];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
            base64 += base64_chars.charAt(((x2 & 15) << 2) | ((x3 & 192) >> 6));
            base64 += base64_chars.charAt(x3 & 63);
        }
        if (remainder === 1) {
            x1 = data[i];
            base64 += base64_chars.charAt((x1 & 252) >> 2);
            base64 += base64_chars.charAt((x1 & 3) << 4);
            base64 += "==";
        } else {
            if (remainder === 2) {
                x1 = data[i];
                x2 = data[i + 1];
                base64 += base64_chars.charAt((x1 & 252) >> 2);
                base64 += base64_chars.charAt(((x1 & 3) << 4) | ((x2 & 240) >> 4));
                base64 += base64_chars.charAt((x2 & 15) << 2);
                base64 += "=";
            }
        }
        return base64;
    };
    var base64_decode = function (string) {
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, "");
        var length = str.length;
        if (length % 4 !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error("base64 string error: " + string);
        }
        var array = new MutableData((length * 3) / 4);
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i += 4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i + 1)];
            ch3 = base64_values[str.charCodeAt(i + 2)];
            ch4 = base64_values[str.charCodeAt(i + 3)];
            array.push(((ch1 & 63) << 2) | ((ch2 & 48) >> 4));
            array.push(((ch2 & 15) << 4) | ((ch3 & 60) >> 2));
            array.push(((ch3 & 3) << 6) | ((ch4 & 63) >> 0));
        }
        while (str[--i] === "=") {
            array.pop();
        }
        return array.getBytes();
    };
    var Base64Coder = function () {
        Object.call(this);
    };
    ns.Class(Base64Coder, Object, [DataCoder], null);
    Base64Coder.prototype.encode = function (data) {
        return base64_encode(data);
    };
    Base64Coder.prototype.decode = function (string) {
        return base64_decode(string);
    };
    ns.format.Base64.setCoder(new Base64Coder());
})(MONKEY);
(function (ns) {
    var StringCoder = ns.format.StringCoder;
    var utf8_encode = function (string) {
        var len = string.length;
        var array = [];
        var c, l;
        for (var i = 0; i < len; ++i) {
            c = string.charCodeAt(i);
            if (55296 <= c && c <= 56319) {
                l = string.charCodeAt(++i);
                c = ((c - 55296) << 10) + 65536 + l - 56320;
            }
            if (c <= 0) {
                break;
            } else {
                if (c < 128) {
                    array.push(c);
                } else {
                    if (c < 2048) {
                        array.push(192 | ((c >> 6) & 31));
                        array.push(128 | ((c >> 0) & 63));
                    } else {
                        if (c < 65536) {
                            array.push(224 | ((c >> 12) & 15));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63));
                        } else {
                            array.push(240 | ((c >> 18) & 7));
                            array.push(128 | ((c >> 12) & 63));
                            array.push(128 | ((c >> 6) & 63));
                            array.push(128 | ((c >> 0) & 63));
                        }
                    }
                }
            }
        }
        return Uint8Array.from(array);
    };
    var utf8_decode = function (array) {
        var string = "";
        var len = array.length;
        var c, c2, c3, c4;
        for (var i = 0; i < len; ++i) {
            c = array[i];
            switch (c >> 4) {
                case 12:
                case 13:
                    c2 = array[++i];
                    c = ((c & 31) << 6) | (c2 & 63);
                    break;
                case 14:
                    c2 = array[++i];
                    c3 = array[++i];
                    c = ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63);
                    break;
                case 15:
                    c2 = array[++i];
                    c3 = array[++i];
                    c4 = array[++i];
                    c =
                        ((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
                    break;
            }
            if (c < 65536) {
                string += String.fromCharCode(c);
            } else {
                c -= 65536;
                string += String.fromCharCode((c >> 10) + 55296);
                string += String.fromCharCode((c & 1023) + 56320);
            }
        }
        return string;
    };
    var Utf8Coder = function () {
        Object.call(this);
    };
    ns.Class(Utf8Coder, Object, [StringCoder], null);
    Utf8Coder.prototype.encode = function (string) {
        return utf8_encode(string);
    };
    Utf8Coder.prototype.decode = function (data) {
        return utf8_decode(data);
    };
    ns.format.UTF8.setCoder(new Utf8Coder());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.MD5.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.SHA256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString());
    };
    ns.digest.RIPEMD160.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this);
    };
    ns.Class(hash, Object, [DataDigester], null);
    hash.prototype.digest = function (data) {
        var array = window.keccak256.update(data).digest();
        return new Uint8Array(array);
    };
    ns.digest.KECCAK256.setDigester(new hash());
})(MONKEY);
(function (ns) {
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function (data) {
        var base64 = ns.format.Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = "";
            var start = 0,
                end;
            for (; start < length; start += MIME_LINE_MAX_LEN) {
                end = start + MIME_LINE_MAX_LEN;
                if (end < length) {
                    sb += base64.substring(start, end);
                    sb += CR_LF;
                } else {
                    sb += base64.substring(start, length);
                    break;
                }
            }
            base64 = sb;
        }
        return base64;
    };
    var encode_key = function (key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right;
    };
    var decode_key = function (pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null;
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null;
        }
        return ns.format.Base64.decode(pem.substring(start, end));
    };
    var encode_public = function (key) {
        return encode_key(
            key,
            "-----BEGIN PUBLIC KEY-----",
            "-----END PUBLIC KEY-----"
        );
    };
    var encode_rsa_private = function (key) {
        return encode_key(
            key,
            "-----BEGIN RSA PRIVATE KEY-----",
            "-----END RSA PRIVATE KEY-----"
        );
    };
    var decode_public = function (pem) {
        var data = decode_key(
            pem,
            "-----BEGIN PUBLIC KEY-----",
            "-----END PUBLIC KEY-----"
        );
        if (!data) {
            data = decode_key(
                pem,
                "-----BEGIN RSA PUBLIC KEY-----",
                "-----END RSA PUBLIC KEY-----"
            );
        }
        if (data) {
            return data;
        }
        if (pem.indexOf("PRIVATE KEY") > 0) {
            throw new TypeError("this is a private key content");
        } else {
            return ns.format.Base64.decode(pem);
        }
    };
    var decode_rsa_private = function (pem) {
        var data = decode_key(
            pem,
            "-----BEGIN RSA PRIVATE KEY-----",
            "-----END RSA PRIVATE KEY-----"
        );
        if (data) {
            return data;
        }
        if (pem.indexOf("PUBLIC KEY") > 0) {
            throw new TypeError("this is not a RSA private key content");
        } else {
            return ns.format.Base64.decode(pem);
        }
    };
    var pem = function () {
        Object.call(this);
    };
    ns.Class(pem, Object, null, null);
    pem.prototype.encodePublicKey = function (key) {
        return encode_public(key);
    };
    pem.prototype.encodePrivateKey = function (key) {
        return encode_rsa_private(key);
    };
    pem.prototype.decodePublicKey = function (pem) {
        return decode_public(pem);
    };
    pem.prototype.decodePrivateKey = function (pem) {
        return decode_rsa_private(pem);
    };
    ns.format.PEM = new pem();
    ns.format.registers("PEM");
})(MONKEY);
(function (ns) {
    var Data = ns.type.Data;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.PEM.decodePublicKey(data);
            } else {
                throw new Error("public key data not found");
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 1024 / 8;
            }
        },
        verify: function (data, signature) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            signature = ns.format.Base64.encode(signature);
            var cipher = parse_key.call(this);
            return cipher.verify(data, signature, CryptoJS.SHA256);
        },
        matches: function (sKey) {
            return AsymmetricKey.matches(sKey, this);
        },
        encrypt: function (plaintext) {
            plaintext = ns.format.UTF8.decode(plaintext);
            var cipher = parse_key.call(this);
            var base64 = cipher.encrypt(plaintext);
            if (base64) {
                var res = ns.format.Base64.decode(base64);
                if (res.length === this.getSize()) {
                    return res;
                }
                var hex = cipher.getKey().encrypt(plaintext);
                if (hex) {
                    res = ns.format.Hex.decode(hex);
                    if (res.length === this.getSize()) {
                        return res;
                    }
                    throw new Error("Error encrypt result: " + plaintext);
                }
            }
            throw new Error("RSA encrypt error: " + plaintext);
        }
    });
    var x509_header = new Data([
        48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3,
        -127, -115, 0
    ]);
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            der = x509_header.concat(der).getBytes();
            key = ns.format.Base64.encode(der);
            cipher.setPublicKey(key);
        }
        return cipher;
    };
    ns.crypto.RSAPublicKey = RSAPublicKey;
    ns.crypto.registers("RSAPublicKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.PEM.decodePrivateKey(data);
            } else {
                var bits = this.getSize() * 8;
                var pem = generate.call(this, bits);
                return ns.format.PEM.decodePrivateKey(pem);
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 1024 / 8;
            }
        },
        getPublicKey: function () {
            var key = ns.format.Base64.encode(this.getData());
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            var pem = cipher.getPublicKey();
            var info = {
                algorithm: this.getValue("algorithm"),
                data: pem,
                mode: "ECB",
                padding: "PKCS1",
                digest: "SHA256"
            };
            return PublicKey.parse(info);
        },
        sign: function (data) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            var cipher = parse_key.call(this);
            var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
            if (base64) {
                return ns.format.Base64.decode(base64);
            } else {
                throw new Error("RSA sign error: " + data);
            }
        },
        decrypt: function (data) {
            data = ns.format.Base64.encode(data);
            var cipher = parse_key.call(this);
            var string = cipher.decrypt(data);
            if (string) {
                return ns.format.UTF8.encode(string);
            } else {
                throw new Error("RSA decrypt error: " + data);
            }
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    var generate = function (bits) {
        var cipher = new JSEncrypt({ default_key_size: bits });
        var key = cipher.getKey();
        var pem = key.getPublicKey() + "\r\n" + key.getPrivateKey();
        this.setValue("data", pem);
        this.setValue("mode", "ECB");
        this.setValue("padding", "PKCS1");
        this.setValue("digest", "SHA256");
        return pem;
    };
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher;
    };
    ns.crypto.RSAPrivateKey = RSAPrivateKey;
    ns.crypto.registers("RSAPrivateKey");
})(MONKEY);
(function (ns) {
    var Secp256k1 = window.Secp256k1;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var mem_cpy = function (dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i];
        }
    };
    var trim_to_32_bytes = function (src, src_offset, src_len, dst) {
        var pos = src_offset;
        while (src[pos] === 0 && src_len > 0) {
            ++pos;
            --src_len;
        }
        if (src_len > 32 || src_len < 1) {
            return false;
        }
        var dst_offset = 32 - src_len;
        mem_cpy(dst, dst_offset, src, pos, src_len);
        return true;
    };
    var ecc_der_to_sig = function (der, der_len) {
        var seq_len;
        var r_len;
        var s_len;
        if (der_len < 8 || der[0] !== 48 || der[2] !== 2) {
            return null;
        }
        seq_len = der[1];
        if (seq_len <= 0 || seq_len + 2 !== der_len) {
            return null;
        }
        r_len = der[3];
        if (r_len < 1 || r_len > seq_len - 5 || der[4 + r_len] !== 2) {
            return null;
        }
        s_len = der[5 + r_len];
        if (s_len < 1 || s_len !== seq_len - 4 - r_len) {
            return null;
        }
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (
            trim_to_32_bytes(der, 4, r_len, sig_r) &&
            trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)
        ) {
            return { r: sig_r, s: sig_s };
        } else {
            return null;
        }
    };
    var ECCPublicKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(ECCPublicKey, Dictionary, [PublicKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var pem = this.getValue("data");
            if (!pem || pem.length === 0) {
                throw new Error("ECC public key data not found");
            } else {
                if (pem.length === 66) {
                    return ns.format.Hex.decode(pem);
                } else {
                    if (pem.length === 130) {
                        return ns.format.Hex.decode(pem);
                    } else {
                        var pos1 = pem.indexOf("-----BEGIN PUBLIC KEY-----");
                        if (pos1 >= 0) {
                            pos1 += "-----BEGIN PUBLIC KEY-----".length;
                            var pos2 = pem.indexOf("-----END PUBLIC KEY-----", pos1);
                            if (pos2 > 0) {
                                var base64 = pem.substr(pos1, pos2 - pos1);
                                var data = ns.format.Base64.decode(base64);
                                return data.subarray(data.length - 65);
                            }
                        }
                    }
                }
            }
            throw new EvalError("key data error: " + pem);
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return this.getData().length / 8;
            }
        },
        verify: function (data, signature) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = ecc_der_to_sig(signature, signature.length);
            if (!sig) {
                throw new EvalError("signature error: " + signature);
            }
            var sig_r = Secp256k1.uint256(sig.r, 16);
            var sig_s = Secp256k1.uint256(sig.s, 16);
            var pub = decode_points(this.getData());
            return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z);
        },
        matches: function (sKey) {
            return AsymmetricKey.matches(sKey, this);
        }
    });
    var decode_points = function (data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16);
            } else {
                throw new EvalError("key data head error: " + data);
            }
        } else {
            if (data.length === 33) {
                if (data[0] === 4) {
                    x = Secp256k1.uint256(data.subarray(1, 33), 16);
                    y = Secp256k1.decompressKey(x, 0);
                } else {
                    throw new EvalError("key data head error: " + data);
                }
            } else {
                throw new EvalError("key data length error: " + data);
            }
        }
        return { x: x, y: y };
    };
    ns.crypto.ECCPublicKey = ECCPublicKey;
    ns.crypto.registers("ECCPublicKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ecc_sig_to_der = function (sig_r, sig_s, der) {
        var i;
        var p = 0,
            len,
            len1,
            len2;
        der[p] = 48;
        p++;
        der[p] = 0;
        len = p;
        p++;
        der[p] = 2;
        p++;
        der[p] = 0;
        len1 = p;
        p++;
        i = 0;
        while (sig_r[i] === 0 && i < 32) {
            i++;
        }
        if (sig_r[i] >= 128) {
            der[p] = 0;
            p++;
            der[len1] = der[len1] + 1;
        }
        while (i < 32) {
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++;
        }
        der[p] = 2;
        p++;
        der[p] = 0;
        len2 = p;
        p++;
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++;
        }
        if (sig_s[i] >= 128) {
            der[p] = 0;
            p++;
            der[len2] = der[len2] + 1;
        }
        while (i < 32) {
            der[p] = sig_s[i];
            p++;
            der[len2] = der[len2] + 1;
            i++;
        }
        der[len] = der[len1] + der[len2] + 4;
        return der[len] + 2;
    };
    var ECCPrivateKey = function (key) {
        Dictionary.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey;
    };
    ns.Class(ECCPrivateKey, Dictionary, [PrivateKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            var data = this.getValue("data");
            if (data && data.length > 0) {
                return ns.format.Hex.decode(data);
            } else {
                throw new Error("ECC private key data not found");
            }
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return this.getData().length / 8;
            }
        },
        getPublicKey: function () {
            var pub = this.__publicKey;
            var data = "04" + pub.x + pub.y;
            var info = {
                algorithm: this.getValue("algorithm"),
                data: data,
                curve: "secp256k1",
                digest: "SHA256"
            };
            return PublicKey.parse(info);
        },
        sign: function (data) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = Secp256k1.ecsign(this.__privateKey, z);
            var sig_r = ns.format.Hex.decode(sig.r);
            var sig_s = ns.format.Hex.decode(sig.s);
            var der = new Uint8Array(72);
            var sig_len = ecc_sig_to_der(sig_r, sig_s, der);
            if (sig_len === der.length) {
                return der;
            } else {
                return der.subarray(0, sig_len);
            }
        }
    });
    var get_key_pair = function () {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            sKey = generatePrivateKey.call(this, 256);
        } else {
            if (data.length === 32) {
                sKey = Secp256k1.uint256(data, 16);
            } else {
                throw new EvalError("key data length error: " + data);
            }
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return { privateKey: sKey, publicKey: pKey };
    };
    var generatePrivateKey = function (bits) {
        var key = window.crypto.getRandomValues(new Uint8Array(bits / 8));
        var hex = ns.format.Hex.encode(key);
        this.setValue("data", hex);
        this.setValue("curve", "secp256k1");
        this.setValue("digest", "SHA256");
        return key;
    };
    ns.crypto.ECCPrivateKey = ECCPrivateKey;
    ns.crypto.registers("ECCPrivateKey");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var bytes2words = function (data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string);
    };
    var words2bytes = function (array) {
        var result = array.toString();
        return ns.format.Hex.decode(result);
    };
    var random_data = function (size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256);
        }
        return data;
    };
    var zero_data = function (size) {
        return new Uint8Array(size);
    };
    var AESKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(AESKey, Dictionary, [SymmetricKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getSize: function () {
            var size = this.getValue("keySize");
            if (size) {
                return Number(size);
            } else {
                return 32;
            }
        },
        getBlockSize: function () {
            var size = this.getValue("blockSize");
            if (size) {
                return Number(size);
            } else {
                return 16;
            }
        },
        getData: function () {
            var data = this.getValue("data");
            if (data) {
                return ns.format.Base64.decode(data);
            }
            var keySize = this.getSize();
            var pwd = random_data(keySize);
            this.setValue("data", ns.format.Base64.encode(pwd));
            var blockSize = this.getBlockSize();
            var iv = random_data(blockSize);
            this.setValue("iv", ns.format.Base64.encode(iv));
            return pwd;
        },
        getInitVector: function () {
            var iv = this.getValue("iv");
            if (iv) {
                return ns.format.Base64.decode(iv);
            }
            var zeros = zero_data(this.getBlockSize());
            this.setValue("iv", ns.format.Base64.encode(zeros));
            return zeros;
        },
        encrypt: function (plaintext) {
            var data = this.getData();
            var iv = this.getInitVector();
            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);
            var message = bytes2words(plaintext);
            var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {
                iv: ivWordArray
            });
            if (cipher.hasOwnProperty("ciphertext")) {
                return words2bytes(cipher.ciphertext);
            } else {
                throw new TypeError("failed to encrypt message with key: " + this);
            }
        },
        decrypt: function (ciphertext) {
            var data = this.getData();
            var iv = this.getInitVector();
            var keyWordArray = bytes2words(data);
            var ivWordArray = bytes2words(iv);
            var cipher = { ciphertext: bytes2words(ciphertext) };
            var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {
                iv: ivWordArray
            });
            return words2bytes(plaintext);
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    ns.crypto.AESKey = AESKey;
    ns.crypto.registers("AESKey");
})(MONKEY);
(function (ns) {
    var Data = ns.type.Data;
    var MutableData = ns.type.MutableData;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function () {
        Object.call(this);
    };
    ns.Class(Password, Object, null, null);
    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;
    Password.generate = function (password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            var merged = new MutableData(Password.KEY_SIZE);
            merged.fill(0, digest, 0, filling);
            merged.fill(filling, data, 0, data.length);
            data = merged.getBytes();
        } else {
            if (filling < 0) {
                if (Password.KEY_SIZE === digest.length) {
                    data = digest;
                } else {
                    var head = new Data(digest);
                    data = head.slice(0, Password.KEY_SIZE);
                }
            }
        }
        var tail = new MutableData(Password.BLOCK_SIZE);
        tail.fill(0, digest, digest.length - Password.BLOCK_SIZE, digest.length);
        var iv = tail.getBytes();
        var key = {
            algorithm: SymmetricKey.AES,
            data: ns.format.Base64.encode(data),
            iv: ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key);
    };
    ns.crypto.Password = Password;
    ns.crypto.registers("Password");
})(MONKEY);
(function (ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function (key) {
        Dictionary.call(this, key);
    };
    ns.Class(PlainKey, Dictionary, [SymmetricKey], {
        getAlgorithm: function () {
            var dict = this.toMap();
            return CryptographyKey.getAlgorithm(dict);
        },
        getData: function () {
            return null;
        },
        encrypt: function (data) {
            return data;
        },
        decrypt: function (data) {
            return data;
        },
        matches: function (pKey) {
            return CryptographyKey.matches(pKey, this);
        }
    });
    var plain_key = null;
    PlainKey.getInstance = function () {
        if (!plain_key) {
            var key = { algorithm: PlainKey.PLAIN };
            plain_key = new PlainKey(key);
        }
        return plain_key;
    };
    PlainKey.PLAIN = "PLAIN";
    ns.crypto.PlainKey = PlainKey;
    ns.crypto.registers("PlainKey");
})(MONKEY);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var MutableData = ns.type.MutableData;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BTCAddress = function (string, network) {
        ConstantString.call(this, string);
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        this.__network = network;
    };
    ns.Class(BTCAddress, ConstantString, [Address], null);
    BTCAddress.prototype.getNetwork = function () {
        return this.__network;
    };
    BTCAddress.prototype.isBroadcast = function () {
        return false;
    };
    BTCAddress.prototype.isUser = function () {
        return NetworkType.isUser(this.__network);
    };
    BTCAddress.prototype.isGroup = function () {
        return NetworkType.isGroup(this.__network);
    };
    BTCAddress.generate = function (fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf();
        }
        var digest = ns.digest.RIPEMD160.digest(
            ns.digest.SHA256.digest(fingerprint)
        );
        var head = new MutableData(21);
        head.setByte(0, network);
        head.append(digest);
        var cc = check_code(head.getBytes(false));
        var data = new MutableData(25);
        data.append(head);
        data.append(cc);
        return new BTCAddress(
            ns.format.Base58.encode(data.getBytes(false)),
            network
        );
    };
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26) {
            return null;
        }
        var data = ns.format.Base58.decode(string);
        if (data.length !== 25) {
            throw new RangeError("address length error: " + string);
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new BTCAddress(string, data[0]);
        } else {
            return null;
        }
    };
    var check_code = function (data) {
        var sha256d = ns.digest.SHA256.digest(ns.digest.SHA256.digest(data));
        return sha256d.subarray(0, 4);
    };
    ns.mkm.BTCAddress = BTCAddress;
    ns.mkm.registers("BTCAddress");
})(MingKeMing);
(function (ns) {
    var ConstantString = ns.type.ConstantString;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var eip55 = function (hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = "9".charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                ch -= ((hash[i >> 1] << ((i << 2) & 4)) & 128) >> 2;
            }
            sb[i] = ch;
        }
        return ns.format.UTF8.decode(sb);
    };
    var is_eth = function (address) {
        if (address.length !== 42) {
            return false;
        } else {
            if (address.charAt(0) !== "0" || address.charAt(1) !== "x") {
                return false;
            }
        }
        var _0 = "0".charCodeAt(0);
        var _9 = "9".charCodeAt(0);
        var _A = "A".charCodeAt(0);
        var _Z = "Z".charCodeAt(0);
        var _a = "a".charCodeAt(0);
        var _z = "z".charCodeAt(0);
        var ch;
        for (var i = 2; i < 42; ++i) {
            ch = address.charCodeAt(i);
            if (ch >= _0 && ch <= _9) {
                continue;
            }
            if (ch >= _A && ch <= _Z) {
                continue;
            }
            if (ch >= _a && ch <= _z) {
                continue;
            }
            return false;
        }
        return true;
    };
    var ETHAddress = function (string) {
        ConstantString.call(this, string);
    };
    ns.Class(ETHAddress, ConstantString, [Address], null);
    ETHAddress.prototype.getNetwork = function () {
        return NetworkType.MAIN.valueOf();
    };
    ETHAddress.prototype.isBroadcast = function () {
        return false;
    };
    ETHAddress.prototype.isUser = function () {
        return true;
    };
    ETHAddress.prototype.isGroup = function () {
        return false;
    };
    ETHAddress.getValidateAddress = function (address) {
        if (is_eth(address)) {
            var lower = address.substr(2).toLowerCase();
            return "0x" + eip55(lower);
        }
        return null;
    };
    ETHAddress.isValidate = function (address) {
        return address === this.getValidateAddress(address);
    };
    ETHAddress.generate = function (fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1);
        } else {
            if (fingerprint.length !== 64) {
                throw new TypeError("ECC key data error: " + fingerprint);
            }
        }
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress("0x" + eip55(address));
    };
    ETHAddress.parse = function (address) {
        if (is_eth(address)) {
            return new ETHAddress(address);
        }
        return null;
    };
    ns.mkm.ETHAddress = ETHAddress;
    ns.mkm.registers("ETHAddress");
})(MingKeMing);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(
                    this,
                    arguments[0],
                    arguments[1],
                    arguments[2],
                    arguments[3]
                );
            } else {
                throw new SyntaxError("Default meta arguments error: " + arguments);
            }
        }
        this.__addresses = {};
    };
    ns.Class(DefaultMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (network instanceof NetworkType) {
                network = network.valueOf();
            }
            var address = this.__addresses[network];
            if (!address) {
                address = BTCAddress.generate(this.getFingerprint(), network);
                this.__addresses[network] = address;
            }
            return address;
        }
    });
    ns.mkm.DefaultMeta = DefaultMeta;
    ns.mkm.registers("DefaultMeta");
})(MingKeMing);
(function (ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1]);
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(
                        this,
                        arguments[0],
                        arguments[1],
                        arguments[2],
                        arguments[3]
                    );
                } else {
                    throw new SyntaxError("BTC meta arguments error: " + arguments);
                }
            }
        }
        this.__address = null;
    };
    ns.Class(BTCMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (!this.__address) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = BTCAddress.generate(fingerprint, NetworkType.BTC_MAIN);
            }
            return this.__address;
        }
    });
    ns.mkm.BTCMeta = BTCMeta;
    ns.mkm.registers("BTCMeta");
})(MingKeMing);
(function (ns) {
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0]);
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1]);
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(
                        this,
                        arguments[0],
                        arguments[1],
                        arguments[2],
                        arguments[3]
                    );
                } else {
                    throw new SyntaxError("ETH meta arguments error: " + arguments);
                }
            }
        }
        this.__address = null;
    };
    ns.Class(ETHMeta, BaseMeta, null, {
        generateAddress: function (network) {
            if (!this.__address) {
                var key = this.getKey();
                var fingerprint = key.getData();
                this.__address = ETHAddress.generate(fingerprint);
            }
            return this.__address;
        }
    });
    ns.mkm.ETHMeta = ETHMeta;
    ns.mkm.registers("ETHMeta");
})(MingKeMing);
(function (ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function () {
        AddressFactory.call(this);
    };
    ns.Class(GeneralAddressFactory, AddressFactory, null, null);
    GeneralAddressFactory.prototype.createAddress = function (address) {
        if (address.length === 42) {
            return ETHAddress.parse(address);
        }
        return BTCAddress.parse(address);
    };
    Address.setFactory(new GeneralAddressFactory());
})(MingKeMing);
(function (ns) {
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    ns.Class(GeneralMetaFactory, Object, [Meta.Factory], null);
    GeneralMetaFactory.prototype.createMeta = function (key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint);
        } else {
            if (MetaType.BTC.equals(this.__type)) {
                return new BTCMeta(this.__type, key);
            } else {
                if (MetaType.ExBTC.equals(this.__type)) {
                    return new BTCMeta(this.__type, key, seed, fingerprint);
                } else {
                    if (MetaType.ETH.equals(this.__type)) {
                        return new ETHMeta(this.__type, key);
                    } else {
                        if (MetaType.ExETH.equals(this.__type)) {
                            return new ETHMeta(this.__type, key, seed, fingerprint);
                        } else {
                            return null;
                        }
                    }
                }
            }
        }
    };
    GeneralMetaFactory.prototype.generateMeta = function (sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            fingerprint = sKey.sign(ns.format.UTF8.encode(seed));
        }
        return this.createMeta(sKey.getPublicKey(), seed, fingerprint);
    };
    GeneralMetaFactory.prototype.parseMeta = function (meta) {
        var out;
        var type = Meta.getType(meta);
        if (MetaType.MKM.equals(type)) {
            out = new DefaultMeta(meta);
        } else {
            if (MetaType.BTC.equals(type)) {
                out = new BTCMeta(meta);
            } else {
                if (MetaType.ExBTC.equals(type)) {
                    out = new BTCMeta(meta);
                } else {
                    if (MetaType.ETH.equals(type)) {
                        out = new ETHMeta(meta);
                    } else {
                        if (MetaType.ExETH.equals(type)) {
                            out = new ETHMeta(meta);
                        } else {
                            throw TypeError("unknown meta type: " + type);
                        }
                    }
                }
            }
        }
        return Meta.check(out) ? out : null;
    };
    Meta.setFactory(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM));
    Meta.setFactory(MetaType.BTC, new GeneralMetaFactory(MetaType.BTC));
    Meta.setFactory(MetaType.ExBTC, new GeneralMetaFactory(MetaType.ExBTC));
    Meta.setFactory(MetaType.ETH, new GeneralMetaFactory(MetaType.ETH));
    Meta.setFactory(MetaType.ExETH, new GeneralMetaFactory(MetaType.ExETH));
})(MingKeMing);
(function (ns) {
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
    var doc_type = function (type, identifier) {
        if (type === "*") {
            if (identifier.isGroup()) {
                return Document.BULLETIN;
            } else {
                if (identifier.isUser()) {
                    return Document.VISA;
                } else {
                    return Document.PROFILE;
                }
            }
        } else {
            return type;
        }
    };
    var GeneralDocumentFactory = function (type) {
        Object.call(this);
        this.__type = type;
    };
    ns.Class(GeneralDocumentFactory, Object, [Document.Factory], null);
    GeneralDocumentFactory.prototype.createDocument = function (
        identifier,
        data,
        signature
    ) {
        var type = doc_type(this.__type, identifier);
        if (type === Document.VISA) {
            if (data && signature) {
                return new BaseVisa(identifier, data, signature);
            } else {
                return new BaseVisa(identifier);
            }
        } else {
            if (type === Document.BULLETIN) {
                if (data && signature) {
                    return new BaseBulletin(identifier, data, signature);
                } else {
                    return new BaseBulletin(identifier);
                }
            } else {
                if (data && signature) {
                    return new BaseDocument(identifier, data, signature);
                } else {
                    return new BaseDocument(identifier);
                }
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function (doc) {
        var identifier = Document.getIdentifier(doc);
        if (!identifier) {
            return null;
        }
        var type = Document.getType(doc);
        if (!type) {
            type = doc_type("*", identifier);
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc);
        } else {
            if (type === Document.BULLETIN) {
                return new BaseBulletin(doc);
            } else {
                return new BaseDocument(doc);
            }
        }
    };
    Document.setFactory("*", new GeneralDocumentFactory("*"));
    Document.setFactory(Document.VISA, new GeneralDocumentFactory(Document.VISA));
    Document.setFactory(
        Document.PROFILE,
        new GeneralDocumentFactory(Document.PROFILE)
    );
    Document.setFactory(
        Document.BULLETIN,
        new GeneralDocumentFactory(Document.BULLETIN)
    );
})(MingKeMing);
(function (ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);
    AESKeyFactory.prototype.generateSymmetricKey = function () {
        return this.parseSymmetricKey({ algorithm: SymmetricKey.AES });
    };
    AESKeyFactory.prototype.parseSymmetricKey = function (key) {
        return new AESKey(key);
    };
    var aes = new AESKeyFactory();
    SymmetricKey.setFactory(SymmetricKey.AES, aes);
    SymmetricKey.setFactory("AES/CBC/PKCS7Padding", aes);
})(MONKEY);
(function (ns) {
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);
    PlainKeyFactory.prototype.generateSymmetricKey = function () {
        return PlainKey.getInstance();
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function (key) {
        if (CryptographyKey.getAlgorithm(key) !== PlainKey.PLAIN) {
            throw new TypeError("plain key error: " + key);
        }
        return PlainKey.getInstance();
    };
    SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory());
})(MONKEY);
(function (ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.RSA });
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new RSAPrivateKey(key);
    };
    var RSAPublicKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);
    RSAPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new RSAPublicKey(key);
    };
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.setFactory("SHA256withRSA", rsa_pri);
    PrivateKey.setFactory("RSA/ECB/PKCS1Padding", rsa_pri);
    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
    PublicKey.setFactory("SHA256withRSA", rsa_pub);
    PublicKey.setFactory("RSA/ECB/PKCS1Padding", rsa_pub);
})(MONKEY);
(function (ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({ algorithm: AsymmetricKey.ECC });
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new ECCPrivateKey(key);
    };
    var ECCPublicKeyFactory = function () {
        Object.call(this);
    };
    ns.Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);
    ECCPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new ECCPublicKey(key);
    };
    var ecc_pri = new ECCPrivateKeyFactory();
    PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
    PrivateKey.setFactory("SHA256withECC", ecc_pri);
    var ecc_pub = new ECCPublicKeyFactory();
    PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
    PublicKey.setFactory("SHA256withECC", ecc_pub);
})(MONKEY);
