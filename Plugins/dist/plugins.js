/**
 *  DIM-Plugins (v1.0.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Nov. 18, 2024
 * @copyright (c) 2024 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function (ns) {
    'use strict';
    var repeat = function (count) {
        var string = '';
        for (var i = 0; i < count; ++i) {
            string += this
        }
        return string
    };
    if (typeof String.prototype.repeat !== 'function') {
        String.prototype.repeat = repeat
    }

    function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
            throw new TypeError("Alphabet too long")
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
            BASE_MAP[j] = 255
        }
        for (var i = 0; i < ALPHABET.length; i++) {
            var x = ALPHABET.charAt(i);
            var xc = x.charCodeAt(0);
            if (BASE_MAP[xc] !== 255) {
                throw new TypeError(x + " is ambiguous")
            }
            BASE_MAP[xc] = i
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);

        function encode(source) {
            if (source.length === 0) {
                return ""
            }
            var zeroes = 0;
            var length = 0;
            var pbegin = 0;
            var pend = source.length;
            while (pbegin !== pend && source[pbegin] === 0) {
                pbegin++;
                zeroes++
            }
            var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
            var b58 = new Uint8Array(size);
            while (pbegin !== pend) {
                var carry = source[pbegin];
                var i = 0;
                for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                    carry += (256 * b58[it1]) >>> 0;
                    b58[it1] = (carry % BASE) >>> 0;
                    carry = (carry / BASE) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                pbegin++
            }
            var it2 = size - length;
            while (it2 !== size && b58[it2] === 0) {
                it2++
            }
            var str = repeat.call(LEADER, zeroes);
            for (; it2 < size; ++it2) {
                str += ALPHABET.charAt(b58[it2])
            }
            return str
        }

        function decodeUnsafe(source) {
            if (typeof source !== "string") {
                throw new TypeError("Expected String")
            }
            if (source.length === 0) {
                return []
            }
            var psz = 0;
            if (source[psz] === " ") {
                return
            }
            var zeroes = 0;
            var length = 0;
            while (source[psz] === LEADER) {
                zeroes++;
                psz++
            }
            var size = (((source.length - psz) * FACTOR) + 1) >>> 0;
            var b256 = new Uint8Array(size);
            while (source[psz]) {
                var carry = BASE_MAP[source.charCodeAt(psz)];
                if (carry === 255) {
                    return
                }
                var i = 0;
                for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                    carry += (BASE * b256[it3]) >>> 0;
                    b256[it3] = (carry % 256) >>> 0;
                    carry = (carry / 256) >>> 0
                }
                if (carry !== 0) {
                    throw new Error("Non-zero carry")
                }
                length = i;
                psz++
            }
            if (source[psz] === " ") {
                return
            }
            var it4 = size - length;
            while (it4 !== size && b256[it4] === 0) {
                it4++
            }
            var vch = [];
            var j = 0;
            for (; j < zeroes; ++j) {
                vch[j] = 0
            }
            while (it4 !== size) {
                vch[j++] = b256[it4++]
            }
            return vch
        }

        function decode(string) {
            var buffer = decodeUnsafe(string);
            if (buffer) {
                return new Uint8Array(buffer)
            }
            throw new Error("Non-base" + BASE + " character")
        }

        return {encode: encode, decodeUnsafe: decodeUnsafe, decode: decode}
    }

    var bs58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base58Coder = function () {
        Object.call(this)
    };
    Class(Base58Coder, Object, [DataCoder], {
        encode: function (data) {
            return bs58.encode(data)
        }, decode: function (string) {
            return bs58.decode(string)
        }
    });
    ns.format.Base58.setCoder(new Base58Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var base64_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
    })(base64_chars, base64_values);
    var base64_encode = function (data) {
        var base64 = '';
        var length = data.length;
        var remainder = length % 3;
        length -= remainder;
        var x1, x2, x3;
        var i;
        for (i = 0; i < length; i += 3) {
            x1 = data[i];
            x2 = data[i + 1];
            x3 = data[i + 2];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            base64 += base64_chars.charAt(((x2 & 0x0F) << 2) | ((x3 & 0xC0) >> 6));
            base64 += base64_chars.charAt(x3 & 0x3F)
        }
        if (remainder === 1) {
            x1 = data[i];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt((x1 & 0x03) << 4);
            base64 += '=='
        } else if (remainder === 2) {
            x1 = data[i];
            x2 = data[i + 1];
            base64 += base64_chars.charAt((x1 & 0xFC) >> 2);
            base64 += base64_chars.charAt(((x1 & 0x03) << 4) | ((x2 & 0xF0) >> 4));
            base64 += base64_chars.charAt((x2 & 0x0F) << 2);
            base64 += '='
        }
        return base64
    };
    var base64_decode = function (string) {
        var str = string.replace(/[^A-Za-z0-9+\/=]/g, '');
        var length = str.length;
        if ((length % 4) !== 0 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(str)) {
            throw new Error('base64 string error: ' + string)
        }
        var array = [];
        var ch1, ch2, ch3, ch4;
        var i;
        for (i = 0; i < length; i += 4) {
            ch1 = base64_values[str.charCodeAt(i)];
            ch2 = base64_values[str.charCodeAt(i + 1)];
            ch3 = base64_values[str.charCodeAt(i + 2)];
            ch4 = base64_values[str.charCodeAt(i + 3)];
            array.push(((ch1 & 0x3F) << 2) | ((ch2 & 0x30) >> 4));
            array.push(((ch2 & 0x0F) << 4) | ((ch3 & 0x3C) >> 2));
            array.push(((ch3 & 0x03) << 6) | ((ch4 & 0x3F) >> 0))
        }
        while (str[--i] === '=') {
            array.pop()
        }
        return Uint8Array.from(array)
    };
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var Base64Coder = function () {
        Object.call(this)
    };
    Class(Base64Coder, Object, [DataCoder], {
        encode: function (data) {
            return base64_encode(data)
        }, decode: function (string) {
            return base64_decode(string)
        }
    });
    ns.format.Base64.setCoder(new Base64Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var hex_chars = '0123456789abcdef';
    var hex_values = new Int8Array(128);
    (function (chars, values) {
        for (var i = 0; i < chars.length; ++i) {
            values[chars.charCodeAt(i)] = i
        }
        values['A'.charCodeAt(0)] = 0x0A;
        values['B'.charCodeAt(0)] = 0x0B;
        values['C'.charCodeAt(0)] = 0x0C;
        values['D'.charCodeAt(0)] = 0x0D;
        values['E'.charCodeAt(0)] = 0x0E;
        values['F'.charCodeAt(0)] = 0x0F
    })(hex_chars, hex_values);
    var hex_encode = function (data) {
        var len = data.length;
        var str = '';
        var byt;
        for (var i = 0; i < len; ++i) {
            byt = data[i];
            str += hex_chars[byt >> 4];
            str += hex_chars[byt & 0x0F]
        }
        return str
    };
    var hex_decode = function (string) {
        var len = string.length;
        if (len > 2) {
            if (string[0] === '0') {
                if (string[1] === 'x' || string[1] === 'X') {
                    string = string.substring(2);
                    len -= 2
                }
            }
        }
        if (len % 2 === 1) {
            string = '0' + string;
            len += 1
        }
        var cnt = len >> 1;
        var hi, lo;
        var data = new Uint8Array(cnt);
        for (var i = 0, j = 0; i < cnt; ++i, j += 2) {
            hi = hex_values[string.charCodeAt(j)];
            lo = hex_values[string.charCodeAt(j + 1)];
            data[i] = (hi << 4) | lo
        }
        return data
    };
    var Class = ns.type.Class;
    var DataCoder = ns.format.DataCoder;
    var HexCoder = function () {
        Object.call(this)
    };
    Class(HexCoder, Object, [DataCoder], {
        encode: function (data) {
            return hex_encode(data)
        }, decode: function (string) {
            return hex_decode(string)
        }
    });
    ns.format.Hex.setCoder(new HexCoder())
})(DIMP);
(function (ns) {
    'use strict';
    var utf8_encode = function (string) {
        var len = string.length;
        var array = [];
        var c, l;
        for (var i = 0; i < len; ++i) {
            c = string.charCodeAt(i);
            if (0xD800 <= c && c <= 0xDBFF) {
                l = string.charCodeAt(++i);
                c = ((c - 0xD800) << 10) + 0x10000 + l - 0xDC00
            }
            if (c <= 0) {
                break
            } else if (c < 0x0080) {
                array.push(c)
            } else if (c < 0x0800) {
                array.push(0xC0 | ((c >> 6) & 0x1F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            } else if (c < 0x10000) {
                array.push(0xE0 | ((c >> 12) & 0x0F));
                array.push(0x80 | ((c >> 6) & 0x3F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            } else {
                array.push(0xF0 | ((c >> 18) & 0x07));
                array.push(0x80 | ((c >> 12) & 0x3F));
                array.push(0x80 | ((c >> 6) & 0x3F));
                array.push(0x80 | ((c >> 0) & 0x3F))
            }
        }
        return Uint8Array.from(array)
    };
    var utf8_decode = function (array) {
        var string = '';
        var len = array.length;
        var c, c2, c3, c4;
        for (var i = 0; i < len; ++i) {
            c = array[i];
            switch (c >> 4) {
                case 12:
                case 13:
                    c2 = array[++i];
                    c = ((c & 0x1F) << 6) | (c2 & 0x3F);
                    break;
                case 14:
                    c2 = array[++i];
                    c3 = array[++i];
                    c = ((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
                    break;
                case 15:
                    c2 = array[++i];
                    c3 = array[++i];
                    c4 = array[++i];
                    c = ((c & 0x07) << 18) | ((c2 & 0x3F) << 12) | ((c3 & 0x3F) << 6) | (c4 & 0x3F);
                    break
            }
            if (c < 0x10000) {
                string += String.fromCharCode(c)
            } else {
                c -= 0x10000;
                string += String.fromCharCode((c >> 10) + 0xD800);
                string += String.fromCharCode((c & 0x03FF) + 0xDC00)
            }
        }
        return string
    };
    var Class = ns.type.Class;
    var StringCoder = ns.format.StringCoder;
    var Utf8Coder = function () {
        Object.call(this)
    };
    Class(Utf8Coder, Object, [StringCoder], {
        encode: function (string) {
            return utf8_encode(string)
        }, decode: function (data) {
            return utf8_decode(data)
        }
    })
    ns.format.UTF8.setCoder(new Utf8Coder())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ObjectCoder = ns.format.ObjectCoder;
    var JsonCoder = function () {
        Object.call(this)
    };
    Class(JsonCoder, Object, [ObjectCoder], {
        encode: function (object) {
            return JSON.stringify(object)
        }, decode: function (string) {
            return JSON.parse(string)
        }
    });
    ns.format.JSON.setCoder(new JsonCoder())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var TransportableData = ns.format.TransportableData;
    var BaseDataWrapper = ns.format.BaseDataWrapper;
    var Base64Data = function (info) {
        var binary = null;
        if (info instanceof Uint8Array) {
            binary = info;
            info = null
        }
        Dictionary.call(this, info);
        var wrapper = new BaseDataWrapper(this.toMap());
        if (binary) {
            wrapper.setAlgorithm(TransportableData.BASE64);
            if (binary.length > 0) {
                wrapper.setData(binary)
            }
        }
        this.__wrapper = wrapper
    };
    Class(Base64Data, Dictionary, [TransportableData], {
        getAlgorithm: function () {
            return this.__wrapper.getAlgorithm()
        }, getData: function () {
            return this.__wrapper.getData()
        }, toObject: function () {
            return this.toString()
        }, toString: function () {
            return this.__wrapper.toString()
        }, encode: function (mimeType) {
            return this.__wrapper.encode(mimeType)
        }
    });
    var Base64DataFactory = function () {
        Object.call(this)
    };
    Class(Base64DataFactory, Object, [TransportableData.Factory], {
        createTransportableData: function (data) {
            return new Base64Data(data)
        }, parseTransportableData: function (ted) {
            return new Base64Data(ted)
        }
    });
    var factory = new Base64DataFactory();
    TransportableData.setFactory('*', factory);
    TransportableData.setFactory(TransportableData.BASE64, factory)
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Dictionary = ns.type.Dictionary;
    var JsON = ns.format.JSON;
    var PortableNetworkFile = ns.format.PortableNetworkFile;
    var BaseFileWrapper = ns.format.BaseFileWrapper;
    var BaseNetworkFile = function () {
        var ted = null, filename = null, url = null, password = null;
        if (arguments.length === 1) {
            Dictionary.call(this, arguments[0])
        } else if (arguments.length === 4) {
            Dictionary.call(this);
            ted = arguments[0];
            filename = arguments[1];
            url = arguments[2];
            password = arguments[3]
        } else {
            throw new SyntaxError('PNF arguments error: ' + arguments);
        }
        var wrapper = new BaseFileWrapper(this.toMap());
        if (ted) {
            wrapper.setData(ted)
        }
        if (filename) {
            wrapper.setFilename(filename)
        }
        if (url) {
            wrapper.setURL(url)
        }
        if (password) {
            wrapper.setPassword(password)
        }
        this.__wrapper = wrapper
    };
    Class(BaseNetworkFile, Dictionary, [PortableNetworkFile], {
        getData: function () {
            var ted = this.__wrapper.getData();
            return !ted ? null : ted.getData()
        }, setData: function (binary) {
            this.__wrapper.setBinaryData(binary)
        }, getFilename: function () {
            return this.__wrapper.getFilename()
        }, setFilename: function (filename) {
            this.__wrapper.setFilename(filename)
        }, getURL: function () {
            return this.__wrapper.getURL()
        }, setURL: function (url) {
            this.__wrapper.setURL(url)
        }, getPassword: function () {
            return this.__wrapper.getPassword()
        }, setPassword: function (key) {
            this.__wrapper.setPassword(key)
        }, toString: function () {
            var url = this.getURLString();
            if (url) {
                return url
            }
            return JsON.encode(this.toMap())
        }, toObject: function () {
            var url = this.getURLString();
            if (url) {
                return url
            }
            return this.toMap()
        }, getURLString: function () {
            var url = this.getString('URL', '');
            var len = url.length;
            if (len === 0) {
                return null
            } else if (len > 5 && url.substring(0, 5) === 'data:') {
                return url
            }
            var count = this.getLength();
            if (count === 1) {
                return url
            } else if (count === 2 && this.getValue('filename')) {
                return url
            } else {
                return null
            }
        }
    });
    var BaseNetworkFileFactory = function () {
        Object.call(this)
    };
    Class(BaseNetworkFileFactory, Object, [PortableNetworkFile.Factory], {
        createPortableNetworkFile: function (ted, filename, url, password) {
            return new BaseNetworkFile(ted, filename, url, password)
        }, parsePortableNetworkFile: function (pnf) {
            return new BaseNetworkFile(pnf)
        }
    });
    var factory = new BaseNetworkFileFactory();
    PortableNetworkFile.setFactory(factory)
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.MD5(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.MD5.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.SHA256(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.SHA256.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var hex = ns.format.Hex.encode(data);
            var array = CryptoJS.enc.Hex.parse(hex);
            var result = CryptoJS.RIPEMD160(array);
            return ns.format.Hex.decode(result.toString())
        }
    });
    ns.digest.RIPEMD160.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var DataDigester = ns.digest.DataDigester;
    var hash = function () {
        Object.call(this)
    };
    Class(hash, Object, [DataDigester], {
        digest: function (data) {
            var array = window.keccak256.update(data).digest();
            return new Uint8Array(array)
        }
    });
    ns.digest.KECCAK256.setDigester(new hash())
})(DIMP);
(function (ns) {
    'use strict';
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = '\r\n';
    var rfc2045 = function (data) {
        var base64 = ns.format.Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = '';
            var start = 0, end;
            for (; start < length; start += MIME_LINE_MAX_LEN) {
                end = start + MIME_LINE_MAX_LEN;
                if (end < length) {
                    sb += base64.substring(start, end);
                    sb += CR_LF
                } else {
                    sb += base64.substring(start, length);
                    break
                }
            }
            base64 = sb
        }
        return base64
    };
    var encode_key = function (key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right
    };
    var decode_key = function (pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null
        }
        return ns.format.Base64.decode(pem.substring(start, end))
    };
    var encode_public = function (key) {
        return encode_key(key, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----')
    };
    var encode_rsa_private = function (key) {
        return encode_key(key, '-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----')
    };
    var decode_public = function (pem) {
        var data = decode_key(pem, '-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----');
        if (!data) {
            data = decode_key(pem, "-----BEGIN RSA PUBLIC KEY-----", "-----END RSA PUBLIC KEY-----")
        }
        if (data) {
            return data
        }
        if (pem.indexOf('PRIVATE KEY') > 0) {
            throw new TypeError('this is a private key content');
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var decode_rsa_private = function (pem) {
        var data = decode_key(pem, '-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----');
        if (data) {
            return data
        }
        if (pem.indexOf('PUBLIC KEY') > 0) {
            throw new TypeError('this is not a RSA private key content');
        } else {
            return ns.format.Base64.decode(pem)
        }
    };
    var Class = ns.type.Class;
    var pem = function () {
        Object.call(this)
    };
    Class(pem, Object, null, null);
    pem.prototype.encodePublicKey = function (key) {
        return encode_public(key)
    };
    pem.prototype.encodePrivateKey = function (key) {
        return encode_rsa_private(key)
    };
    pem.prototype.decodePublicKey = function (pem) {
        return decode_public(pem)
    };
    pem.prototype.decodePrivateKey = function (pem) {
        return decode_rsa_private(pem)
    };
    ns.format.PEM = new pem()
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function (key) {
        BasePublicKey.call(this, key)
    };
    Class(RSAPublicKey, BasePublicKey, [EncryptKey], {
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePublicKey(data)
            } else {
                throw new ReferenceError('public key data not found');
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return 1024 / 8
            }
        }, verify: function (data, signature) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            signature = ns.format.Base64.encode(signature);
            var cipher = parse_key.call(this);
            return cipher.verify(data, signature, CryptoJS.SHA256)
        }, encrypt: function (plaintext, extra) {
            plaintext = ns.format.UTF8.decode(plaintext);
            var cipher = parse_key.call(this);
            var base64 = cipher.encrypt(plaintext);
            if (base64) {
                var keySize = this.getSize();
                var res = ns.format.Base64.decode(base64);
                if (res.length === keySize) {
                    return res
                }
                var pad = new Uint8Array(keySize);
                pad.set(res, keySize - res.length);
                return pad
            }
            throw new ReferenceError('RSA encrypt error: ' + plaintext);
        }
    });
    var x509_header = new Uint8Array([48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0]);
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            var fixed = new Uint8Array(x509_header.length + der.length);
            fixed.set(x509_header);
            fixed.set(der, x509_header.length);
            key = ns.format.Base64.encode(fixed);
            cipher.setPublicKey(key)
        }
        return cipher
    };
    ns.crypto.RSAPublicKey = RSAPublicKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
    var RSAPrivateKey = function (key) {
        BasePrivateKey.call(this, key)
    };
    Class(RSAPrivateKey, BasePrivateKey, [DecryptKey], {
        getData: function () {
            var data = this.getValue('data');
            if (data) {
                return ns.format.PEM.decodePrivateKey(data)
            } else {
                var bits = this.getSize() * 8;
                var pem = generate.call(this, bits);
                return ns.format.PEM.decodePrivateKey(pem)
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return 1024 / 8
            }
        }, getPublicKey: function () {
            var key = ns.format.Base64.encode(this.getData());
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            var pem = cipher.getPublicKey();
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': pem,
                'mode': 'ECB',
                'padding': 'PKCS1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info)
        }, sign: function (data) {
            data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
            var cipher = parse_key.call(this);
            var base64 = cipher.sign(data, CryptoJS.SHA256, 'sha256');
            if (base64) {
                return ns.format.Base64.decode(base64)
            } else {
                throw new ReferenceError('RSA sign error: ' + data);
            }
        }, decrypt: function (data, params) {
            data = ns.format.Base64.encode(data);
            var cipher = parse_key.call(this);
            var string = cipher.decrypt(data);
            if (string) {
                return ns.format.UTF8.encode(string)
            } else {
                throw new ReferenceError('RSA decrypt error: ' + data);
            }
        }
    });
    var generate = function (bits) {
        var cipher = new JSEncrypt({default_key_size: bits});
        var key = cipher.getKey();
        var pem = key.getPublicKey() + '\r\n' + key.getPrivateKey();
        this.setValue('data', pem);
        this.setValue('mode', 'ECB');
        this.setValue('padding', 'PKCS1');
        this.setValue('digest', 'SHA256');
        return pem
    };
    var parse_key = function () {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher
    };
    ns.crypto.RSAPrivateKey = RSAPrivateKey
})(DIMP);
(function (ns) {
    'use strict';
    var Secp256k1 = window.Secp256k1;
    var Class = ns.type.Class;
    var BasePublicKey = ns.crypto.BasePublicKey;
    var mem_cpy = function (dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i]
        }
    };
    var trim_to_32_bytes = function (src, src_offset, src_len, dst) {
        var pos = src_offset;
        while (src[pos] === 0 && src_len > 0) {
            ++pos;
            --src_len
        }
        if (src_len > 32 || src_len < 1) {
            return false
        }
        var dst_offset = 32 - src_len;
        mem_cpy(dst, dst_offset, src, pos, src_len);
        return true
    };
    var ecc_der_to_sig = function (der, der_len) {
        var seq_len;
        var r_len;
        var s_len;
        if (der_len < 8 || der[0] !== 0x30 || der[2] !== 0x02) {
            return null
        }
        seq_len = der[1];
        if ((seq_len <= 0) || (seq_len + 2 !== der_len)) {
            return null
        }
        r_len = der[3];
        if ((r_len < 1) || (r_len > seq_len - 5) || (der[4 + r_len] !== 0x02)) {
            return null
        }
        s_len = der[5 + r_len];
        if ((s_len < 1) || (s_len !== seq_len - 4 - r_len)) {
            return null
        }
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (trim_to_32_bytes(der, 4, r_len, sig_r) && trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)) {
            return {r: sig_r, s: sig_s}
        } else {
            return null
        }
    };
    var ECCPublicKey = function (key) {
        BasePublicKey.call(this, key)
    };
    Class(ECCPublicKey, BasePublicKey, null, {
        getData: function () {
            var pem = this.getValue('data');
            if (!pem || pem.length === 0) {
                throw new ReferenceError('ECC public key data not found');
            } else if (pem.length === 66) {
                return ns.format.Hex.decode(pem)
            } else if (pem.length === 130) {
                return ns.format.Hex.decode(pem)
            } else {
                var pos1 = pem.indexOf('-----BEGIN PUBLIC KEY-----');
                if (pos1 >= 0) {
                    pos1 += '-----BEGIN PUBLIC KEY-----'.length;
                    var pos2 = pem.indexOf('-----END PUBLIC KEY-----', pos1);
                    if (pos2 > 0) {
                        var base64 = pem.substr(pos1, pos2 - pos1);
                        var data = ns.format.Base64.decode(base64);
                        return data.subarray(data.length - 65)
                    }
                }
            }
            throw new EvalError('key data error: ' + pem);
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return this.getData().length / 8
            }
        }, verify: function (data, signature) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = ecc_der_to_sig(signature, signature.length);
            if (!sig) {
                throw new EvalError('signature error: ' + signature);
            }
            var sig_r = Secp256k1.uint256(sig.r, 16);
            var sig_s = Secp256k1.uint256(sig.s, 16);
            var pub = decode_points(this.getData());
            return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z)
        }
    });
    var decode_points = function (data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16)
            } else {
                throw new EvalError('key data head error: ' + data);
            }
        } else if (data.length === 33) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.decompressKey(x, 0)
            } else {
                throw new EvalError('key data head error: ' + data);
            }
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        return {x: x, y: y}
    };
    ns.crypto.ECCPublicKey = ECCPublicKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var PublicKey = ns.crypto.PublicKey;
    var BasePrivateKey = ns.crypto.BasePrivateKey;
    var ecc_sig_to_der = function (sig_r, sig_s, der) {
        var i;
        var p = 0, len, len1, len2;
        der[p] = 0x30;
        p++;
        der[p] = 0x00;
        len = p;
        p++;
        der[p] = 0x02;
        p++;
        der[p] = 0x00;
        len1 = p;
        p++;
        i = 0;
        while (sig_r[i] === 0 && i < 32) {
            i++
        }
        if (sig_r[i] >= 0x80) {
            der[p] = 0x00;
            p++;
            der[len1] = der[len1] + 1
        }
        while (i < 32) {
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++
        }
        der[p] = 0x02;
        p++;
        der[p] = 0x00;
        len2 = p;
        p++;
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++
        }
        if (sig_s[i] >= 0x80) {
            der[p] = 0x00;
            p++;
            der[len2] = der[len2] + 1
        }
        while (i < 32) {
            der[p] = sig_s[i];
            p++;
            der[len2] = der[len2] + 1;
            i++
        }
        der[len] = der[len1] + der[len2] + 4;
        return der[len] + 2
    };
    var ECCPrivateKey = function (key) {
        BasePrivateKey.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey
    };
    Class(ECCPrivateKey, BasePrivateKey, null, {
        getData: function () {
            var data = this.getValue('data');
            if (data && data.length > 0) {
                return ns.format.Hex.decode(data)
            } else {
                throw new ReferenceError('ECC private key data not found');
            }
        }, getSize: function () {
            var size = this.getValue('keySize');
            if (size) {
                return Number(size)
            } else {
                return this.getData().length / 8
            }
        }, getPublicKey: function () {
            var pub = this.__publicKey;
            var data = '04' + pub.x + pub.y;
            var info = {
                'algorithm': this.getValue('algorithm'),
                'data': data,
                'curve': 'secp256k1',
                'digest': 'SHA256'
            };
            return PublicKey.parse(info)
        }, sign: function (data) {
            var hash = ns.digest.SHA256.digest(data);
            var z = Secp256k1.uint256(hash, 16);
            var sig = Secp256k1.ecsign(this.__privateKey, z);
            var sig_r = ns.format.Hex.decode(sig.r);
            var sig_s = ns.format.Hex.decode(sig.s);
            var der = new Uint8Array(72);
            var sig_len = ecc_sig_to_der(sig_r, sig_s, der);
            if (sig_len === der.length) {
                return der
            } else {
                return der.subarray(0, sig_len)
            }
        }
    });
    var get_key_pair = function () {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            sKey = generatePrivateKey.call(this, 256)
        } else if (data.length === 32) {
            sKey = Secp256k1.uint256(data, 16)
        } else {
            throw new EvalError('key data length error: ' + data);
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return {privateKey: sKey, publicKey: pKey}
    };
    var generatePrivateKey = function (bits) {
        var key = window.crypto.getRandomValues(new Uint8Array(bits / 8))
        var hex = ns.format.Hex.encode(key);
        this.setValue('data', hex);
        this.setValue('curve', 'secp256k1');
        this.setValue('digest', 'SHA256');
        return key
    };
    ns.crypto.ECCPrivateKey = ECCPrivateKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var TransportableData = ns.format.TransportableData;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
    var bytes2words = function (data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function (array) {
        var result = array.toString();
        return ns.format.Hex.decode(result)
    };
    var random_data = function (size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256)
        }
        return data
    };
    var zero_data = function (size) {
        return new Uint8Array(size)
    };
    var AESKey = function (key) {
        BaseSymmetricKey.call(this, key);
        var base64 = this.getValue('data');
        if (base64) {
            this.__tedKey = null
        } else {
            this.__tedKey = this.generateKeyData()
        }
    };
    Class(AESKey, BaseSymmetricKey, null, {
        generateKeyData: function () {
            var keySize = this.getKeySize();
            var pwd = random_data(keySize);
            var ted = TransportableData.create(pwd);
            this.setValue('data', ted.toObject());
            return ted
        }, getKeySize: function () {
            return this.getInt('keySize', 32)
        }, getBlockSize: function () {
            return this.getInt('blockSize', 16)
        }, getData: function () {
            var ted = this.__tedKey;
            if (!ted) {
                var base64 = this.getValue('data');
                ted = TransportableData.parse(base64);
                this.__tedKey = ted
            }
            return !ted ? null : ted.getData()
        }, getIVString: function (params) {
            var base64 = params['IV'];
            if (base64 && base64.length > 0) {
                return base64
            }
            base64 = params['iv'];
            if (base64 && base64.length > 0) {
                return base64
            }
            base64 = this.getString('iv', null);
            if (base64 && base64.length > 0) {
                return base64
            }
            return this.getString('IV', null)
        }, getIVData: function (params) {
            if (!params) {
                throw new SyntaxError('params must provided to fetch IV for AES');
            }
            var base64 = this.getIVString(params);
            var ted = TransportableData.parse(base64);
            var ivData = !ted ? null : ted.getData();
            if (ivData) {
                return ivData
            }
            var blockSize = this.getBlockSize();
            return zero_data(blockSize)
        }, newIVData: function (extra) {
            if (!extra) {
                throw new SyntaxError('extra dict must provided to store IV for AES');
            }
            var blockSize = this.getBlockSize();
            var ivData = random_data(blockSize);
            var ted = TransportableData.create(ivData);
            extra['IV'] = ted.toObject();
            return ivData
        }, encrypt: function (plaintext, extra) {
            var message = bytes2words(plaintext);
            var iv = this.newIVData(extra);
            var ivWordArray = bytes2words(iv);
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            try {
                var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {iv: ivWordArray});
                if (cipher.hasOwnProperty('ciphertext')) {
                    return words2bytes(cipher.ciphertext)
                }
            } catch (e) {
                return null
            }
        }, decrypt: function (ciphertext, params) {
            var message = bytes2words(ciphertext);
            var iv = this.getIVData(params);
            var ivWordArray = bytes2words(iv);
            var key = this.getData();
            var keyWordArray = bytes2words(key);
            var cipher = {ciphertext: message};
            try {
                var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {iv: ivWordArray});
                return words2bytes(plaintext)
            } catch (e) {
                return null
            }
        }
    });
    ns.crypto.AESKey = AESKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function () {
        Object.call(this)
    };
    Class(Password, Object, null, null);
    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;
    Password.generate = function (password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            var merged = new Uint8Array(Password.KEY_SIZE);
            merged.set(digest.subarray(0, filling));
            merged.set(data, filling);
            data = merged
        } else if (filling < 0) {
            if (Password.KEY_SIZE === digest.length) {
                data = digest
            } else {
                data = digest.subarray(0, Password.KEY_SIZE)
            }
        }
        var iv = digest.subarray(digest.length - Password.BLOCK_SIZE, digest.length);
        var key = {
            'algorithm': SymmetricKey.AES,
            'data': ns.format.Base64.encode(data),
            'iv': ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key)
    };
    ns.crypto.Password = Password
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var BaseSymmetricKey = ns.crypto.BaseSymmetricKey;
    var PlainKey = function (key) {
        BaseSymmetricKey.call(this, key)
    };
    Class(PlainKey, BaseSymmetricKey, null, {
        getData: function () {
            return null
        }, encrypt: function (data, extra) {
            return data
        }, decrypt: function (data, params) {
            return data
        }
    });
    var plain_key = null;
    PlainKey.getInstance = function () {
        if (!plain_key) {
            var key = {'algorithm': PlainKey.PLAIN};
            plain_key = new PlainKey(key)
        }
        return plain_key
    };
    PlainKey.PLAIN = 'PLAIN';
    ns.crypto.PlainKey = PlainKey
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function () {
        Object.call(this)
    };
    Class(ECCPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({'algorithm': AsymmetricKey.ECC})
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new ECCPrivateKey(key)
    };
    var ECCPublicKeyFactory = function () {
        Object.call(this)
    };
    Class(ECCPublicKeyFactory, Object, [PublicKey.Factory], null);
    ECCPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new ECCPublicKey(key)
    };
    ns.crypto.ECCPrivateKeyFactory = ECCPrivateKeyFactory;
    ns.crypto.ECCPublicKeyFactory = ECCPublicKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function () {
        Object.call(this)
    };
    Class(RSAPrivateKeyFactory, Object, [PrivateKey.Factory], null);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function () {
        return this.parsePrivateKey({'algorithm': AsymmetricKey.RSA})
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function (key) {
        return new RSAPrivateKey(key)
    };
    var RSAPublicKeyFactory = function () {
        Object.call(this)
    };
    Class(RSAPublicKeyFactory, Object, [PublicKey.Factory], null);
    RSAPublicKeyFactory.prototype.parsePublicKey = function (key) {
        return new RSAPublicKey(key)
    };
    ns.crypto.RSAPrivateKeyFactory = RSAPrivateKeyFactory;
    ns.crypto.RSAPublicKeyFactory = RSAPublicKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function () {
        Object.call(this)
    };
    Class(AESKeyFactory, Object, [SymmetricKey.Factory], null);
    AESKeyFactory.prototype.generateSymmetricKey = function () {
        return this.parseSymmetricKey({'algorithm': SymmetricKey.AES})
    };
    AESKeyFactory.prototype.parseSymmetricKey = function (key) {
        return new AESKey(key)
    };
    ns.crypto.AESKeyFactory = AESKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function () {
        Object.call(this)
    };
    Class(PlainKeyFactory, Object, [SymmetricKey.Factory], null);
    PlainKeyFactory.prototype.generateSymmetricKey = function () {
        return PlainKey.getInstance()
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function (key) {
        return PlainKey.getInstance()
    };
    ns.crypto.PlainKeyFactory = PlainKeyFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var ConstantString = ns.type.ConstantString;
    var Base58 = ns.format.Base58;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Address = ns.protocol.Address;
    var BTCAddress = function (string, network) {
        ConstantString.call(this, string);
        this.__network = Enum.getInt(network)
    };
    Class(BTCAddress, ConstantString, [Address], null);
    BTCAddress.prototype.getType = function () {
        return this.__network
    };
    BTCAddress.generate = function (fingerprint, network) {
        network = Enum.getInt(network);
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = [];
        head.push(network);
        for (var i = 0; i < digest.length; ++i) {
            head.push(digest[i])
        }
        var cc = check_code(Uint8Array.from(head));
        var data = [];
        for (var j = 0; j < head.length; ++j) {
            data.push(head[j])
        }
        for (var k = 0; k < cc.length; ++k) {
            data.push(cc[k])
        }
        return new BTCAddress(Base58.encode(Uint8Array.from(data)), network)
    };
    BTCAddress.parse = function (string) {
        var len = string.length;
        if (len < 26 || len > 35) {
            return null
        }
        var data = Base58.decode(string);
        if (!data || data.length !== 25) {
            return null
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (ns.type.Arrays.equals(cc, suffix)) {
            return new BTCAddress(string, data[0])
        } else {
            return null
        }
    };
    var check_code = function (data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.mkm.BTCAddress = BTCAddress
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ConstantString = ns.type.ConstantString;
    var EntityType = ns.protocol.EntityType;
    var Address = ns.protocol.Address;
    var ETHAddress = function (string) {
        ConstantString.call(this, string)
    };
    Class(ETHAddress, ConstantString, [Address], null);
    ETHAddress.prototype.getType = function () {
        return EntityType.USER.getValue()
    };
    ETHAddress.getValidateAddress = function (address) {
        if (!is_eth(address)) {
            return null
        }
        var lower = address.substr(2).toLowerCase();
        return '0x' + eip55(lower)
    };
    ETHAddress.isValidate = function (address) {
        return address === this.getValidateAddress(address)
    };
    ETHAddress.generate = function (fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1)
        } else if (fingerprint.length !== 64) {
            throw new TypeError('ECC key data error: ' + fingerprint);
        }
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress('0x' + eip55(address))
    };
    ETHAddress.parse = function (address) {
        if (!is_eth(address)) {
            return null
        }
        return new ETHAddress(address)
    };
    var eip55 = function (hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = '9'.charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                ch -= (hash[i >> 1] << (i << 2 & 4) & 0x80) >> 2
            }
            sb[i] = ch
        }
        return ns.format.UTF8.decode(sb)
    };
    var is_eth = function (address) {
        if (address.length !== 42) {
            return false
        } else if (address.charAt(0) !== '0' || address.charAt(1) !== 'x') {
            return false
        }
        var _0 = '0'.charCodeAt(0);
        var _9 = '9'.charCodeAt(0);
        var _A = 'A'.charCodeAt(0);
        var _Z = 'Z'.charCodeAt(0);
        var _a = 'a'.charCodeAt(0);
        var _z = 'z'.charCodeAt(0);
        var ch;
        for (var i = 2; i < 42; ++i) {
            ch = address.charCodeAt(i);
            if (ch >= _0 && ch <= _9) {
                continue
            }
            if (ch >= _A && ch <= _Z) {
                continue
            }
            if (ch >= _a && ch <= _z) {
                continue
            }
            return false
        }
        return true
    };
    ns.mkm.ETHAddress = ETHAddress
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = function () {
        Object.call(this);
        this.__addresses = {}
    };
    Class(BaseAddressFactory, Object, [Address.Factory], null);
    BaseAddressFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__addresses, finger);
        return finger >> 1
    };
    BaseAddressFactory.prototype.generateAddress = function (meta, network) {
        var address = meta.generateAddress(network);
        if (address) {
            this.__addresses[address.toString()] = address
        }
        return address
    };
    BaseAddressFactory.prototype.parseAddress = function (string) {
        var address = this.__addresses[string];
        if (!address) {
            address = Address.create(string);
            if (address) {
                this.__addresses[string] = address
            }
        }
        return address
    };
    var thanos = ns.mkm.thanos;
    ns.mkm.BaseAddressFactory = BaseAddressFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var BaseAddressFactory = ns.mkm.BaseAddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function () {
        BaseAddressFactory.call(this)
    };
    Class(GeneralAddressFactory, BaseAddressFactory, null, null);
    GeneralAddressFactory.prototype.createAddress = function (address) {
        if (!address) {
            return null
        }
        var len = address.length;
        if (len === 8) {
            if (address.toLowerCase() === 'anywhere') {
                return Address.ANYWHERE
            }
        } else if (len === 10) {
            if (address.toLowerCase() === 'everywhere') {
                return Address.EVERYWHERE
            }
        }
        var res;
        if (26 <= len && len <= 35) {
            res = BTCAddress.parse(address)
        } else if (len === 42) {
            res = ETHAddress.parse(address)
        } else {
            res = null
        }
        return res
    };
    ns.mkm.GeneralAddressFactory = GeneralAddressFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Identifier = ns.mkm.Identifier;
    var IdentifierFactory = function () {
        Object.call(this);
        this.__identifiers = {}
    };
    Class(IdentifierFactory, Object, [ID.Factory], null);
    IdentifierFactory.prototype.reduceMemory = function () {
        var finger = 0;
        finger = thanos(this.__identifiers, finger);
        return finger >> 1
    };
    IdentifierFactory.prototype.generateIdentifier = function (meta, network, terminal) {
        var address = Address.generate(meta, network);
        return ID.create(meta.getSeed(), address, terminal)
    };
    IdentifierFactory.prototype.createIdentifier = function (name, address, terminal) {
        var string = Identifier.concat(name, address, terminal);
        var id = this.__identifiers[string];
        if (!id) {
            id = this.newID(string, name, address, terminal);
            this.__identifiers[string] = id
        }
        return id
    }
    IdentifierFactory.prototype.parseIdentifier = function (identifier) {
        var id = this.__identifiers[identifier];
        if (!id) {
            id = this.parse(identifier);
            if (id) {
                this.__identifiers[identifier] = id
            }
        }
        return id
    };
    IdentifierFactory.prototype.newID = function (string, name, address, terminal) {
        return new Identifier(string, name, address, terminal)
    };
    IdentifierFactory.prototype.parse = function (string) {
        var name, address, terminal;
        var pair = string.split('/');
        if (pair.length === 1) {
            terminal = null
        } else {
            terminal = pair[1]
        }
        pair = pair[0].split('@');
        if (pair.length === 1) {
            name = null;
            address = Address.parse(pair[0])
        } else {
            name = pair[0];
            address = Address.parse(pair[1])
        }
        if (!address) {
            return null
        }
        return this.newID(string, name, address, terminal)
    };
    var thanos = ns.mkm.thanos;
    ns.mkm.GeneralIdentifierFactory = IdentifierFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('Default meta arguments error: ' + arguments);
        }
        this.__addresses = {}
    };
    Class(DefaultMeta, BaseMeta, null, {
        hasSeed: function () {
            return true
        }, generateAddress: function (network) {
            network = Enum.getInt(network);
            var cached = this.__addresses[network];
            if (!cached) {
                var data = this.getFingerprint();
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached
            }
            return cached
        }
    });
    ns.mkm.DefaultMeta = DefaultMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var Enum = ns.type.Enum;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseMeta.call(this, arguments[0], arguments[1])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('BTC meta arguments error: ' + arguments);
        }
        this.__addresses = {}
    };
    Class(BTCMeta, BaseMeta, null, {
        hasSeed: function () {
            return false
        }, generateAddress: function (network) {
            network = Enum.getInt(network);
            var cached = this.__addresses[network];
            if (!cached) {
                var key = this.getPublicKey();
                var data = key.getData();
                cached = BTCAddress.generate(data, network);
                this.__addresses[network] = cached
            }
            return cached
        }
    });
    ns.mkm.BTCMeta = BTCMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = function () {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else if (arguments.length === 2) {
            BaseMeta.call(this, arguments[0], arguments[1])
        } else if (arguments.length === 4) {
            BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
        } else {
            throw new SyntaxError('ETH meta arguments error: ' + arguments);
        }
        this.__address = null
    };
    Class(ETHMeta, BaseMeta, null, {
        hasSeed: function () {
            return false
        }, generateAddress: function (network) {
            var cached = this.__address;
            if (!cached) {
                var key = this.getPublicKey();
                var data = key.getData();
                cached = ETHAddress.generate(data);
                this.__address = cached
            }
            return cached
        }
    });
    ns.mkm.ETHMeta = ETHMeta
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var UTF8 = ns.format.UTF8;
    var TransportableData = ns.format.TransportableData;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function (algorithm) {
        Object.call(this);
        this.__type = algorithm
    };
    Class(GeneralMetaFactory, Object, [Meta.Factory], null);
    GeneralMetaFactory.prototype.getType = function () {
        return this.__type
    };
    GeneralMetaFactory.prototype.generateMeta = function (sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            var sig = sKey.sign(UTF8.encode(seed));
            fingerprint = TransportableData.create(sig)
        }
        var pKey = sKey.getPublicKey();
        return this.createMeta(pKey, seed, fingerprint)
    };
    GeneralMetaFactory.prototype.createMeta = function (key, seed, fingerprint) {
        var out;
        var type = this.getType();
        if (type === Meta.MKM) {
            out = new DefaultMeta(type, key, seed, fingerprint)
        } else if (type === Meta.BTC) {
            out = new BTCMeta(type, key)
        } else if (type === Meta.ETH) {
            out = new ETHMeta(type, key)
        } else {
            throw new TypeError('unknown meta type: ' + type);
        }
        return out
    };
    GeneralMetaFactory.prototype.parseMeta = function (meta) {
        var out;
        var gf = general_factory();
        var type = gf.getMetaType(meta, '');
        if (type === Meta.MKM) {
            out = new DefaultMeta(meta)
        } else if (type === Meta.BTC) {
            out = new BTCMeta(meta)
        } else if (type === Meta.ETH) {
            out = new ETHMeta(meta)
        } else {
            throw new TypeError('unknown meta type: ' + type);
        }
        return out.isValid() ? out : null
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.mkm.GeneralMetaFactory = GeneralMetaFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Class = ns.type.Class;
    var ID = ns.protocol.ID;
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
    var doc_type = function (type, identifier) {
        if (type !== '*') {
            return type
        } else if (identifier.isGroup()) {
            return Document.BULLETIN
        } else if (identifier.isUser()) {
            return Document.VISA
        } else {
            return Document.PROFILE
        }
    };
    var GeneralDocumentFactory = function (type) {
        Object.call(this);
        this.__type = type
    };
    Class(GeneralDocumentFactory, Object, [Document.Factory], null);
    GeneralDocumentFactory.prototype.createDocument = function (identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (data && signature) {
            if (type === Document.VISA) {
                return new BaseVisa(identifier, data, signature)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier, data, signature)
            } else {
                return new BaseDocument(identifier, data, signature)
            }
        } else {
            if (type === Document.VISA) {
                return new BaseVisa(identifier)
            } else if (type === Document.BULLETIN) {
                return new BaseBulletin(identifier)
            } else {
                return new BaseDocument(identifier, type)
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function (doc) {
        var identifier = ID.parse(doc['ID']);
        if (!identifier) {
            return null
        }
        var gf = general_factory();
        var type = gf.getDocumentType(doc, null);
        if (!type) {
            type = doc_type('*', identifier)
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc)
        } else if (type === Document.BULLETIN) {
            return new BaseBulletin(doc)
        } else {
            return new BaseDocument(doc)
        }
    };
    var general_factory = function () {
        var man = ns.mkm.AccountFactoryManager;
        return man.generalFactory
    };
    ns.mkm.GeneralDocumentFactory = GeneralDocumentFactory
})(DIMP);
(function (ns) {
    'use strict';
    var Address = ns.protocol.Address;
    var ID = ns.protocol.ID;
    var Meta = ns.protocol.Meta;
    var Document = ns.protocol.Document;
    var GeneralAddressFactory = ns.mkm.GeneralAddressFactory;
    var GeneralIdentifierFactory = ns.mkm.GeneralIdentifierFactory;
    var GeneralMetaFactory = ns.mkm.GeneralMetaFactory;
    var GeneralDocumentFactory = ns.mkm.GeneralDocumentFactory;
    var registerAddressFactory = function () {
        Address.setFactory(new GeneralAddressFactory())
    };
    var registerIdentifierFactory = function () {
        ID.setFactory(new GeneralIdentifierFactory())
    };
    var registerMetaFactories = function () {
        Meta.setFactory(Meta.MKM, new GeneralMetaFactory(Meta.MKM));
        Meta.setFactory(Meta.BTC, new GeneralMetaFactory(Meta.BTC));
        Meta.setFactory(Meta.ETH, new GeneralMetaFactory(Meta.ETH))
    };
    var registerDocumentFactories = function () {
        Document.setFactory('*', new GeneralDocumentFactory('*'));
        Document.setFactory(Document.VISA, new GeneralDocumentFactory(Document.VISA));
        Document.setFactory(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
        Document.setFactory(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN))
    };
    ns.registerAddressFactory = registerAddressFactory;
    ns.registerIdentifierFactory = registerIdentifierFactory;
    ns.registerMetaFactories = registerMetaFactories;
    ns.registerDocumentFactories = registerDocumentFactories
})(DIMP);
(function (ns) {
    'use strict';
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var PlainKey = ns.crypto.PlainKey;
    var ECCPrivateKeyFactory = ns.crypto.ECCPrivateKeyFactory;
    var ECCPublicKeyFactory = ns.crypto.ECCPublicKeyFactory
    var RSAPrivateKeyFactory = ns.crypto.RSAPrivateKeyFactory;
    var RSAPublicKeyFactory = ns.crypto.RSAPublicKeyFactory
    var AESKeyFactory = ns.crypto.AESKeyFactory;
    var PlainKeyFactory = ns.crypto.PlainKeyFactory;
    var registerKeyFactories = function () {
        var ecc_pri = new ECCPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.ECC, ecc_pri);
        PrivateKey.setFactory('SHA256withECC', ecc_pri);
        var ecc_pub = new ECCPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.ECC, ecc_pub);
        PublicKey.setFactory('SHA256withECC', ecc_pub);
        var rsa_pri = new RSAPrivateKeyFactory();
        PrivateKey.setFactory(AsymmetricKey.RSA, rsa_pri);
        PrivateKey.setFactory('SHA256withRSA', rsa_pri);
        PrivateKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pri);
        var rsa_pub = new RSAPublicKeyFactory();
        PublicKey.setFactory(AsymmetricKey.RSA, rsa_pub);
        PublicKey.setFactory('SHA256withRSA', rsa_pub);
        PublicKey.setFactory('RSA/ECB/PKCS1Padding', rsa_pub);
        var aes = new AESKeyFactory();
        SymmetricKey.setFactory(SymmetricKey.AES, aes);
        SymmetricKey.setFactory('AES/CBC/PKCS7Padding', aes);
        SymmetricKey.setFactory(PlainKey.PLAIN, new PlainKeyFactory())
    };
    var registerPlugins = function () {
        ns.registerKeyFactories();
        ns.registerIdentifierFactory();
        ns.registerAddressFactory();
        ns.registerMetaFactories();
        ns.registerDocumentFactories()
    };
    ns.registerKeyFactories = registerKeyFactories;
    ns.registerPlugins = registerPlugins
})(DIMP);
