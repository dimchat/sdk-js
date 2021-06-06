/**
 *  DIM-Plugins (v0.1.0)
 *  (DIMP: Decentralized Instant Messaging Protocol)
 *
 * @author    moKy <albert.moky at gmail.com>
 * @date      June. 4, 2021
 * @copyright (c) 2021 Albert Moky
 * @license   {@link https://mit-license.org | MIT License}
 */;
(function(ns) {
    if (typeof String.prototype.repeat !== "function") {
        String.prototype.repeat = function(count) {
            var string = "";
            for (var i = 0; i < count; ++i) {
                string += this
            }
            return string
        }
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
    ns.Class(base58, ns.type.Object, [BaseCoder]);
    base58.prototype.encode = function(data) {
        return bs58.encode(data)
    };
    base58.prototype.decode = function(string) {
        return bs58.decode(string)
    };
    ns.format.Base58.coder = new base58()
})(DIMP);
(function(ns) {
    var Hash = ns.digest.Hash;
    var md5 = function() {};
    ns.Class(md5, ns.type.Object, [Hash]);
    md5.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.MD5.hash = new md5()
})(DIMP);
(function(ns) {
    var Hash = ns.digest.Hash;
    var sha256 = function() {};
    ns.Class(sha256, ns.type.Object, [Hash]);
    sha256.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.SHA256.hash = new sha256()
})(DIMP);
(function(ns) {
    var Hash = ns.digest.Hash;
    var ripemd160 = function() {};
    ns.Class(ripemd160, ns.type.Object, [Hash]);
    ripemd160.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.RIPEMD160.hash = new ripemd160()
})(DIMP);
(function(ns) {
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
            throw new TypeError("this is a private key content")
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
            throw new TypeError("this is not a RSA private key content")
        } else {
            return Base64.decode(pem)
        }
    };
    var pem = function() {};
    ns.Class(pem, ns.type.Object, null);
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
    ns.format.PEM = new pem()
})(DIMP);
(function(ns) {
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
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey]);
    RSAPublicKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return PEM.decodePublicKey(data)
        } else {
            throw new Error("public key data not found")
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
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            der = x509_header.concat(der).getBytes();
            key = Base64.encode(der);
            cipher.setPublicKey(key)
        }
        return cipher
    };
    RSAPublicKey.prototype.verify = function(data, signature) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        signature = Base64.encode(signature);
        var cipher = parse_key.call(this);
        return cipher.verify(data, signature, CryptoJS.SHA256)
    };
    RSAPublicKey.prototype.matches = function(sKey) {
        return AsymmetricKey.matches(sKey, this)
    };
    RSAPublicKey.prototype.encrypt = function(plaintext) {
        plaintext = ns.format.UTF8.decode(plaintext);
        var cipher = parse_key.call(this);
        var base64 = cipher.encrypt(plaintext);
        if (base64) {
            var res = Base64.decode(base64);
            if (res.length === this.getSize()) {
                return res
            }
            var hex = cipher.getKey().encrypt(plaintext);
            if (hex) {
                res = Hex.decode(hex);
                if (res.length === this.getSize()) {
                    return res
                }
                throw new Error("Error encrypt result: " + plaintext)
            }
        }
        throw new Error("RSA encrypt error: " + plaintext)
    };
    PublicKey.register(AsymmetricKey.RSA, RSAPublicKey);
    PublicKey.register("SHA256withRSA", RSAPublicKey);
    PublicKey.register("RSA/ECB/PKCS1Padding", RSAPublicKey);
    ns.crypto.RSAPublicKey = RSAPublicKey;
    ns.crypto.register("RSAPublicKey")
})(DIMP);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var Hex = ns.format.Hex;
    var Base64 = ns.format.Base64;
    var PEM = ns.format.PEM;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey]);
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
        return PublicKey.parse(info)
    };
    var parse_key = function() {
        var der = this.getData();
        var key = Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher
    };
    RSAPrivateKey.prototype.sign = function(data) {
        data = CryptoJS.enc.Hex.parse(Hex.encode(data));
        var cipher = parse_key.call(this);
        var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
        if (base64) {
            return Base64.decode(base64)
        } else {
            throw new Error("RSA sign error: " + data)
        }
    };
    RSAPrivateKey.prototype.decrypt = function(data) {
        data = Base64.encode(data);
        var cipher = parse_key.call(this);
        var string = cipher.decrypt(data);
        if (string) {
            return ns.format.UTF8.encode(string)
        } else {
            throw new Error("RSA decrypt error: " + data)
        }
    };
    RSAPrivateKey.prototype.matches = function(pKey) {
        return CryptographyKey.matches(pKey, this)
    };
    PrivateKey.register(AsymmetricKey.RSA, RSAPrivateKey);
    PrivateKey.register("SHA256withRSA", RSAPrivateKey);
    PrivateKey.register("RSA/ECB/PKCS1Padding", RSAPrivateKey);
    ns.crypto.RSAPrivateKey = RSAPrivateKey;
    ns.crypto.register("RSAPrivateKey")
})(DIMP);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var bytes2words = function(data) {
        var string = ns.format.Hex.encode(data);
        return CryptoJS.enc.Hex.parse(string)
    };
    var words2bytes = function(array) {
        var result = array.toString();
        return ns.format.Hex.decode(result)
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
    ns.Class(AESKey, Dictionary, [SymmetricKey]);
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
            return ns.format.Base64.decode(data)
        }
        var keySize = this.getSize();
        var pwd = random_data(keySize);
        this.setValue("data", ns.format.Base64.encode(pwd));
        var blockSize = this.getBlockSize();
        var iv = random_data(blockSize);
        this.setValue("iv", ns.format.Base64.encode(iv));
        return pwd
    };
    AESKey.prototype.getInitVector = function() {
        var iv = this.getValue("iv");
        if (iv) {
            return ns.format.Base64.decode(iv)
        }
        var zeros = zero_data(this.getBlockSize());
        this.setValue("iv", ns.format.Base64.encode(zeros));
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
            throw new TypeError("failed to encrypt message with key: " + this)
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
    AESKey.prototype.matches = function(pKey) {
        return CryptographyKey.matches(pKey, this)
    };
    SymmetricKey.register(SymmetricKey.AES, AESKey);
    SymmetricKey.register("AES/CBC/PKCS7Padding", AESKey);
    ns.crypto.AESKey = AESKey;
    ns.crypto.register("AESKey")
})(DIMP);
(function(ns) {
    var Data = ns.type.Data;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function() {};
    Password.KEY_SIZE = 32;
    Password.BLOCK_SIZE = 16;
    Password.generate = function(password) {
        var data = ns.format.UTF8.encode(password);
        var digest = ns.digest.SHA256.digest(data);
        var filling = Password.KEY_SIZE - data.length;
        if (filling > 0) {
            var merged = new Data(Password.KEY_SIZE);
            merged.fill(0, digest, 0, filling);
            merged.fill(filling, data, 0, data.length);
            data = merged.getBytes()
        } else {
            if (filling < 0) {
                if (Password.KEY_SIZE === digest.length) {
                    data = digest
                } else {
                    var head = new Data(digest);
                    data = head.slice(0, Password.KEY_SIZE)
                }
            }
        }
        var tail = new Data(Password.BLOCK_SIZE);
        tail.fill(0, digest, digest.length - Password.BLOCK_SIZE, digest.length);
        var iv = tail.getBytes();
        var key = {
            "algorithm": SymmetricKey.AES,
            "data": ns.format.Base64.encode(data),
            "iv": ns.format.Base64.encode(iv)
        };
        return SymmetricKey.parse(key)
    };
    ns.crypto.Password = Password;
    ns.crypto.register("Password")
})(DIMP);
(function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function(key) {
        SymmetricKey.call(this, key)
    };
    ns.Class(PlainKey, SymmetricKey, null);
    PlainKey.prototype.encrypt = function(data) {
        return data
    };
    PlainKey.prototype.decrypt = function(data) {
        return data
    };
    var plain_key = null;
    PlainKey.getInstance = function() {
        if (!plain_key) {
            var key = {
                "algorithm": PlainKey.PLAIN
            };
            plain_key = new PlainKey(key)
        }
        return plain_key
    };
    PlainKey.PLAIN = "PLAIN";
    ns.crypto.PlainKey = PlainKey;
    ns.crypto.register("PlainKey")
})(DIMP);
(function(ns) {
    var str = ns.type.String;
    var Data = ns.type.Data;
    var SHA256 = ns.digest.SHA256;
    var RIPEMD160 = ns.digest.RIPEMD160;
    var Base58 = ns.format.Base58;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var BTCAddress = function(string, network) {
        str.call(this, string);
        this.__network = network
    };
    ns.Class(BTCAddress, str, [Address]);
    BTCAddress.prototype.getNetwork = function() {
        return this.__network
    };
    BTCAddress.prototype.isBroadcast = function() {
        return false
    };
    BTCAddress.prototype.isUser = function() {
        return NetworkType.isUser(this.__network)
    };
    BTCAddress.prototype.isGroup = function() {
        return NetworkType.isGroup(this.__network)
    };
    BTCAddress.generate = function(fingerprint, network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var digest = RIPEMD160.digest(SHA256.digest(fingerprint));
        var head = new Data(21);
        head.setByte(0, network);
        head.append(digest);
        var cc = check_code(head.getBytes(false));
        var data = new Data(25);
        data.append(head);
        data.append(cc);
        return new BTCAddress(Base58.encode(data.getBytes(false)), network)
    };
    BTCAddress.parse = function(string) {
        var len = string.length;
        if (len < 26) {
            return null
        }
        var data = Base58.decode(string);
        if (data.length !== 25) {
            throw new RangeError("address length error: " + string)
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
    var check_code = function(data) {
        var sha256d = SHA256.digest(SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.BTCAddress = BTCAddress;
    ns.register("BTCAddress")
})(DIMP);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.BTCAddress;
    var BaseMeta = ns.BaseMeta;
    var DefaultMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
            }
        }
        this.__addresses = {}
    };
    ns.Class(DefaultMeta, BaseMeta, null);
    DefaultMeta.prototype.generateAddress = function(network) {
        if (network instanceof NetworkType) {
            network = network.valueOf()
        }
        var address = this.__addresses[network];
        if (!address && this.isValid()) {
            address = BTCAddress.generate(this.getFingerprint(), network);
            this.__addresses[network] = address
        }
        return address
    };
    ns.DefaultMeta = DefaultMeta;
    ns.register("DefaultMeta")
})(DIMP);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.BTCAddress;
    var BaseMeta = ns.BaseMeta;
    var BTCMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
            }
        }
        this.__address = null
    };
    ns.Class(BTCMeta, BaseMeta, null);
    BTCMeta.prototype.generateAddress = function(network) {
        if (!this.__address && this.isValid()) {
            var fingerprint = this.getKey().getData();
            this.__address = BTCAddress.generate(fingerprint, NetworkType.BTC_MAIN)
        }
        return this.__address
    };
    ns.BTCMeta = BTCMeta;
    ns.register("BTCMeta")
})(DIMP);
(function(ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = ns.AddressFactory;
    var BTCAddress = ns.BTCAddress;
    var GeneralAddressFactory = function() {
        AddressFactory.call(this)
    };
    ns.Class(GeneralAddressFactory, AddressFactory);
    GeneralAddressFactory.prototype.createAddress = function(address) {
        return BTCAddress.parse(address)
    };
    Address.setFactory(new GeneralAddressFactory())
})(DIMP);
(function(ns) {
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.DefaultMeta;
    var BTCMeta = ns.BTCMeta;
    var GeneralMetaFactory = function(type) {
        this.__type = type
    };
    ns.Class(GeneralMetaFactory, null, [Meta.Factory]);
    GeneralMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint)
        } else {
            if (MetaType.BTC.equals(this.__type)) {
                return new BTCMeta(this.__type, key, seed, fingerprint)
            } else {
                if (MetaType.ExBTC.equals(this.__type)) {
                    return new BTCMeta(this.__type, key, seed, fingerprint)
                } else {
                    return null
                }
            }
        }
    };
    GeneralMetaFactory.prototype.generateMeta = function(sKey, seed) {
        var fingerprint = null;
        if (seed && seed.length > 0) {
            fingerprint = sKey.sign(ns.format.UTF8.encode(seed))
        }
        return this.createMeta(sKey.getPublicKey(), seed, fingerprint)
    };
    GeneralMetaFactory.prototype.parseMeta = function(meta) {
        var type = Meta.getType(meta);
        if (MetaType.MKM.equals(type)) {
            return new DefaultMeta(meta)
        } else {
            if (MetaType.BTC.equals(type)) {
                return new BTCMeta(meta)
            } else {
                if (MetaType.ExBTC.equals(type)) {
                    return new BTCMeta(meta)
                } else {
                    return null
                }
            }
        }
    };
    Meta.register(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM))
})(DIMP);
(function(ns) {
    var Document = ns.protocol.Document;
    var BaseDocument = ns.BaseDocument;
    var BaseBulletin = ns.BaseBulletin;
    var BaseVisa = ns.BaseVisa;
    var doc_type = function(type, identifier) {
        if (type === "*") {
            if (identifier.isGroup()) {
                return Document.BULLETIN
            } else {
                if (identifier.isUser()) {
                    return Document.VISA
                } else {
                    return Document.PROFILE
                }
            }
        } else {
            return type
        }
    };
    var GeneralDocumentFactory = function(type) {
        this.__type = type
    };
    ns.Class(GeneralDocumentFactory, null, [Document.Factory]);
    GeneralDocumentFactory.prototype.createDocument = function(identifier, data, signature) {
        var type = doc_type(this.__type, identifier);
        if (type === Document.VISA) {
            if (data && signature) {
                return new BaseVisa(identifier, data, signature)
            } else {
                return new BaseVisa(identifier)
            }
        } else {
            if (type === Document.BULLETIN) {
                if (data && signature) {
                    return new BaseBulletin(identifier, data, signature)
                } else {
                    return new BaseBulletin(identifier)
                }
            } else {
                if (data && signature) {
                    return new BaseDocument(identifier, data, signature)
                } else {
                    return new BaseDocument(identifier)
                }
            }
        }
    };
    GeneralDocumentFactory.prototype.parseDocument = function(doc) {
        var identifier = Document.getIdentifier(doc);
        if (!identifier) {
            return null
        }
        var type = Document.getType(doc);
        if (!type) {
            type = doc_type("*", identifier)
        }
        if (type === Document.VISA) {
            return new BaseVisa(doc)
        } else {
            if (type === Document.BULLETIN) {
                return new BaseBulletin(doc)
            } else {
                return new BaseDocument(doc)
            }
        }
    };
    Document.register("*", new GeneralDocumentFactory("*"));
    Document.register(Document.VISA, new GeneralDocumentFactory(Document.VISA));
    Document.register(Document.PROFILE, new GeneralDocumentFactory(Document.PROFILE));
    Document.register(Document.BULLETIN, new GeneralDocumentFactory(Document.BULLETIN))
})(DIMP);
(function(ns) {
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var PlainKey = ns.crypto.PlainKey;
    var AESKeyFactory = function() {};
    ns.Class(AESKeyFactory, null, [SymmetricKey.Factory]);
    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return new AESKey({
            "algorithm": SymmetricKey.AES
        })
    };
    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key)
    };
    var PlainKeyFactory = function() {};
    ns.Class(PlainKeyFactory, null, [SymmetricKey.Factory]);
    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance()
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        return PlainKey.getInstance()
    };
    SymmetricKey.register(SymmetricKey.AES, new AESKeyFactory());
    SymmetricKey.register(PlainKey.PLAIN, new PlainKeyFactory())
})(DIMP);
(function(ns) {
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function() {};
    ns.Class(RSAPrivateKeyFactory, null, [PrivateKey.Factory]);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new RSAPrivateKey({
            "algorithm": AsymmetricKey.RSA
        })
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new RSAPrivateKey(key)
    };
    var RSAPublicKeyFactory = function() {};
    ns.Class(RSAPublicKeyFactory, null, [PublicKey.Factory]);
    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key)
    };
    PrivateKey.register(AsymmetricKey.RSA, new RSAPrivateKeyFactory());
    PublicKey.register(AsymmetricKey.RSA, new RSAPublicKeyFactory())
})(DIMP);
