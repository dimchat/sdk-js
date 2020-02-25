/**
 *  DIM-Plugins (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      Feb. 23, 2020
 * @copyright (c) 2020 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */
! function(ns) {
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
                for (var it1 = size - 1;
                     (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
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
            var str = LEADER.repeat(zeroes);
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
                for (var it3 = size - 1;
                     (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
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
        return {
            encode: encode,
            decodeUnsafe: decodeUnsafe,
            decode: decode
        }
    }
    var bs58 = base("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
    var BaseCoder = ns.format.BaseCoder;
    var base58 = function() {};
    ns.Class(base58, null, BaseCoder);
    base58.prototype.encode = function(data) {
        return bs58.encode(data)
    };
    base58.prototype.decode = function(string) {
        return bs58.decode(string)
    };
    ns.format.Base58.coder = new base58()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var md5 = function() {};
    ns.Class(md5, null, Hash);
    md5.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.MD5.hash = new md5()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var sha256 = function() {};
    ns.Class(sha256, null, Hash);
    sha256.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.SHA256.hash = new sha256()
}(DIMP);
! function(ns) {
    var Hash = ns.digest.Hash;
    var ripemd160 = function() {};
    ns.Class(ripemd160, null, Hash);
    ripemd160.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.RIPEMD160.hash = new ripemd160()
}(DIMP);
! function(ns) {
    var Base64 = ns.format.Base64;
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function(data) {
        var base64 = Base64.encode(data);
        var length = base64.length;
        if (length > MIME_LINE_MAX_LEN && base64.indexOf(CR_LF) < 0) {
            var sb = "";
            var start = 0,
                end;
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
    var encode_key = function(key, left, right) {
        var content = rfc2045(key);
        return left + CR_LF + content + CR_LF + right
    };
    var decode_key = function(pem, left, right) {
        var start = pem.indexOf(left);
        if (start < 0) {
            return null
        }
        start += left.length;
        var end = pem.indexOf(right, start);
        if (end < start) {
            return null
        }
        return Base64.decode(pem.substring(start, end))
    };
    var encode_public = function(key) {
        return encode_key(key, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----")
    };
    var encode_rsa_private = function(key) {
        return encode_key(key, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----")
    };
    var decode_public = function(pem) {
        var data = decode_key(pem, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
        if (data) {
            return data
        }
        if (pem.indexOf("PRIVATE KEY") > 0) {
            throw TypeError("this is a private key content")
        } else {
            return Base64.decode(pem)
        }
    };
    var decode_rsa_private = function(pem) {
        var data = decode_key(pem, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----");
        if (data) {
            return data
        }
        if (pem.indexOf("PUBLIC KEY") > 0) {
            throw TypeError("this is not a RSA private key content")
        } else {
            return Base64.decode(pem)
        }
    };
    var KeyParser = ns.format.KeyParser;
    var pem = function() {};
    ns.Class(pem, null, KeyParser);
    pem.prototype.encodePublicKey = function(key) {
        return encode_public(key)
    };
    pem.prototype.encodePrivateKey = function(key) {
        return encode_rsa_private(key)
    };
    pem.prototype.decodePublicKey = function(pem) {
        return decode_public(pem)
    };
    pem.prototype.decodePrivateKey = function(pem) {
        return decode_rsa_private(pem)
    };
    ns.format.PEM.parser = new pem()
}(DIMP);
! function(ns) {
    var Dictionary = ns.type.Dictionary;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Base64 = ns.format.Base64;
    var Hex = ns.format.Hex;
    var bytes2words = function(data) {
        var string = Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function(array) {
        var result = array.toString();
        return Hex.decode(result)
    };
    var random_data = function(size) {
        var data = new Uint8Array(size);
        for (var i = 0; i < size; ++i) {
            data[i] = Math.floor(Math.random() * 256)
        }
        return data
    };
    var zero_data = function(size) {
        return new Uint8Array(size)
    };
    var AESKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(AESKey, Dictionary, SymmetricKey);
    AESKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 32
        }
    };
    AESKey.prototype.getBlockSize = function() {
        var size = this.getValue("blockSize");
        if (size) {
            return Number(size)
        } else {
            return 16
        }
    };
    AESKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return Base64.decode(data)
        }
        var keySize = this.getSize();
        var pwd = random_data(keySize);
        this.setValue("data", Base64.encode(pwd));
        var blockSize = this.getBlockSize();
        var iv = random_data(blockSize);
        this.setValue("iv", Base64.encode(iv));
        return pwd
    };
    AESKey.prototype.getInitVector = function() {
        var iv = this.getValue("iv");
        if (iv) {
            return Base64.decode(iv)
        }
        var zeros = zero_data(this.getBlockSize());
        this.setValue("iv", Base64.encode(zeros));
        return zeros
    };
    AESKey.prototype.encrypt = function(plaintext) {
        var data = this.getData();
        var iv = this.getInitVector();
        var keyWordArray = bytes2words(data);
        var ivWordArray = bytes2words(iv);
        var message = bytes2words(plaintext);
        var cipher = CryptoJS.AES.encrypt(message, keyWordArray, {
            iv: ivWordArray
        });
        if (cipher.hasOwnProperty("ciphertext")) {
            return words2bytes(cipher.ciphertext)
        } else {
            throw TypeError("failed to encrypt message with key: " + this)
        }
    };
    AESKey.prototype.decrypt = function(ciphertext) {
        var data = this.getData();
        var iv = this.getInitVector();
        var keyWordArray = bytes2words(data);
        var ivWordArray = bytes2words(iv);
        var cipher = {
            ciphertext: bytes2words(ciphertext)
        };
        var plaintext = CryptoJS.AES.decrypt(cipher, keyWordArray, {
            iv: ivWordArray
        });
        return words2bytes(plaintext)
    };
    SymmetricKey.register(SymmetricKey.AES, AESKey);
    SymmetricKey.register("AES/CBC/PKCS7Padding", AESKey);
    ns.plugins.AESKey = AESKey
}(DIMP);
! function(ns) {
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var Data = ns.type.Data;
    var Dictionary = ns.type.Dictionary;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPublicKey, Dictionary, PublicKey, EncryptKey);
    RSAPublicKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePublicKey(data)
        } else {
            throw Error("public key data not found")
        }
    };
    RSAPublicKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 1024 / 8
        }
    };
    var x509_header = [48, -127, -97, 48, 13, 6, 9, 42, -122, 72, -122, -9, 13, 1, 1, 1, 5, 0, 3, -127, -115, 0];
    x509_header = new Data(x509_header);
    var parse_key = function() {
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPublicKey(key);
            if (cipher.key.e === 0 || cipher.key.n === null) {
                der = x509_header.concat(der).getBytes();
                key = Base64.encode(der);
                cipher.setPublicKey(key)
            }
            this.cipher = cipher
        }
        return this.cipher
    };
    RSAPublicKey.prototype.verify = function(data, signature) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        signature = Base64.encode(signature);
        var cipher = parse_key.call(this);
        return cipher.verify(data, signature, CryptoJS.SHA256)
    };
    RSAPublicKey.prototype.encrypt = function(plaintext) {
        var str = new ns.type.String(plaintext, "UTF-8");
        plaintext = str.toString();
        var cipher = parse_key.call(this);
        var base64 = cipher.encrypt(plaintext);
        if (base64) {
            return Base64.decode(base64)
        } else {
            throw Error("RSA encrypt error: " + plaintext)
        }
    };
    PublicKey.register(AsymmetricKey.RSA, RSAPublicKey);
    PublicKey.register("SHA256withRSA", RSAPublicKey);
    PublicKey.register("RSA/ECB/PKCS1Padding", RSAPublicKey);
    ns.plugins.RSAPublicKey = RSAPublicKey
}(DIMP);
! function(ns) {
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var Dictionary = ns.type.Dictionary;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPrivateKey, Dictionary, PrivateKey, DecryptKey);
    RSAPrivateKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePrivateKey(data)
        } else {
            var bits = this.getSize() * 8;
            var pem = generate.call(this, bits);
            return PEM.decodePrivateKey(pem)
        }
    };
    var generate = function(bits) {
        var cipher = new JSEncrypt({
            default_key_size: bits
        });
        var key = cipher.getKey();
        var pem = key.getPublicKey() + "\r\n" + key.getPrivateKey();
        this.setValue("data", pem);
        this.setValue("mode", "ECB");
        this.setValue("padding", "PKCS1");
        this.setValue("digest", "SHA256");
        return pem
    };
    RSAPrivateKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return 1024 / 8
        }
    };
    RSAPrivateKey.prototype.getPublicKey = function() {
        var key = Base64.encode(this.getData());
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
        return PublicKey.getInstance(info)
    };
    var parse_key = function() {
        if (!this.cipher) {
            var der = this.getData();
            var key = Base64.encode(der);
            var cipher = new JSEncrypt();
            cipher.setPrivateKey(key);
            this.cipher = cipher
        }
        return this.cipher
    };
    RSAPrivateKey.prototype.sign = function(data) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        var cipher = parse_key.call(this);
        var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
        if (base64) {
            return Base64.decode(base64)
        } else {
            throw Error("RSA sign error: " + data)
        }
    };
    RSAPrivateKey.prototype.decrypt = function(data) {
        data = Base64.encode(data);
        var cipher = parse_key.call(this);
        var string = cipher.decrypt(data);
        if (string) {
            return ns.type.String.from(string).getBytes("UTF-8")
        } else {
            throw Error("RSA decrypt error: " + data)
        }
    };
    PrivateKey.register(AsymmetricKey.RSA, RSAPrivateKey);
    PrivateKey.register("SHA256withRSA", RSAPrivateKey);
    PrivateKey.register("RSA/ECB/PKCS1Padding", RSAPrivateKey);
    ns.plugins.RSAPrivateKey = RSAPrivateKey
}(DIMP);
! function(ns) {
    var Data = ns.type.Data;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Base58 = ns.format.Base58;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.Address;
    var DefaultAddress = function(string) {
        Address.call(this, string);
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw RangeError("address length error: " + string)
        }
        var prefix = data.subarray(0, 21);
        var suffix = data.subarray(21, 25);
        var cc = check_code(prefix);
        if (!ns.type.Arrays.equals(cc, suffix)) {
            throw Error("address check code error: " + string)
        }
        this.network = new NetworkType(data[0]);
        this.code = search_number(cc)
    };
    ns.Class(DefaultAddress, Address, null);
    DefaultAddress.prototype.getNetwork = function() {
        return this.network
    };
    DefaultAddress.prototype.getCode = function() {
        return this.code
    };
    DefaultAddress.generate = function(fingerprint, network) {
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = new Data(21);
        head.push(network.valueOf());
        head.push(digest);
        var cc = check_code(head.getBytes(false));
        var data = new Data(25);
        data.push(head);
        data.push(cc);
        return new DefaultAddress(Base58.encode(data.getBytes(false)))
    };
    var check_code = function(data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    var search_number = function(cc) {
        return (cc[0] | cc[1] << 8 | cc[2] << 16) + cc[3] * 16777216
    };
    Address.register(DefaultAddress);
    ns.plugins.DefaultAddress = DefaultAddress
}(DIMP);
! function(ns) {
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.Meta;
    var DefaultAddress = ns.plugins.DefaultAddress;
    var DefaultMeta = function(meta) {
        Meta.call(this, meta);
        this.idMap = {}
    };
    ns.Class(DefaultMeta, Meta, null);
    DefaultMeta.prototype.generateIdentifier = function(network) {
        var identifier = this.idMap[network];
        if (!identifier) {
            identifier = Meta.prototype.generateIdentifier.call(this, network);
            if (identifier) {
                this.idMap[network] = identifier
            }
        }
        return identifier
    };
    DefaultMeta.prototype.generateAddress = function(network) {
        if (!this.isValid()) {
            throw Error("meta invalid: " + this)
        }
        var identifier = this.idMap[network];
        if (identifier) {
            return identifier.address
        }
        return DefaultAddress.generate(this.fingerprint, network)
    };
    Meta.register(MetaType.MKM, DefaultMeta);
    ns.plugins.DefaultMeta = DefaultMeta
}(DIMP);
