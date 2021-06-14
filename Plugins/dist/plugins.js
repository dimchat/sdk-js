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
    var obj = ns.type.Object;
    var BaseCoder = ns.format.BaseCoder;
    var base58 = function() {
        obj.call(this)
    };
    ns.Class(base58, obj, [BaseCoder]);
    base58.prototype.encode = function(data) {
        return bs58.encode(data)
    };
    base58.prototype.decode = function(string) {
        return bs58.decode(string)
    };
    ns.format.Base58.coder = new base58()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var hash = function() {
        obj.call(this)
    };
    ns.Class(hash, obj, [Hash]);
    hash.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.MD5(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.MD5.hash = new hash()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var hash = function() {
        obj.call(this)
    };
    ns.Class(hash, obj, [Hash]);
    hash.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.SHA256(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.SHA256.hash = new hash()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var hash = function() {
        obj.call(this)
    };
    ns.Class(hash, obj, [Hash]);
    hash.prototype.digest = function(data) {
        var hex = ns.format.Hex.encode(data);
        var array = CryptoJS.enc.Hex.parse(hex);
        var result = CryptoJS.RIPEMD160(array);
        return ns.format.Hex.decode(result.toString())
    };
    ns.digest.RIPEMD160.hash = new hash()
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Hash = ns.digest.Hash;
    var keccak256 = window.keccak256;
    var hash = function() {
        obj.call(this)
    };
    ns.Class(hash, obj, [Hash]);
    hash.prototype.digest = function(data) {
        var array = keccak256.update(data).digest();
        return new Uint8Array(array)
    };
    ns.digest.KECCAK256.hash = new hash()
})(MONKEY);
(function(ns) {
    var MIME_LINE_MAX_LEN = 76;
    var CR_LF = "\r\n";
    var rfc2045 = function(data) {
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
        return ns.format.Base64.decode(pem.substring(start, end))
    };
    var encode_public = function(key) {
        return encode_key(key, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----")
    };
    var encode_rsa_private = function(key) {
        return encode_key(key, "-----BEGIN RSA PRIVATE KEY-----", "-----END RSA PRIVATE KEY-----")
    };
    var decode_public = function(pem) {
        var data = decode_key(pem, "-----BEGIN PUBLIC KEY-----", "-----END PUBLIC KEY-----");
        if (!data) {
            data = decode_key(pem, "-----BEGIN RSA PUBLIC KEY-----", "-----END RSA PUBLIC KEY-----")
        }
        if (data) {
            return data
        }
        if (pem.indexOf("PRIVATE KEY") > 0) {
            throw new TypeError("this is a private key content")
        } else {
            return ns.format.Base64.decode(pem)
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
            return ns.format.Base64.decode(pem)
        }
    };
    var obj = ns.type.Object;
    var pem = function() {
        obj.call(this)
    };
    ns.Class(pem, obj, null);
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
    ns.format.PEM = new pem();
    ns.format.registers("PEM")
})(MONKEY);
(function(ns) {
    var Data = ns.type.Data;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var EncryptKey = ns.crypto.EncryptKey;
    var RSAPublicKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPublicKey, Dictionary, [PublicKey, EncryptKey]);
    RSAPublicKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    RSAPublicKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return ns.format.PEM.decodePublicKey(data)
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
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPublicKey(key);
        if (cipher.key.e === 0 || cipher.key.n === null) {
            der = x509_header.concat(der).getBytes();
            key = ns.format.Base64.encode(der);
            cipher.setPublicKey(key)
        }
        return cipher
    };
    RSAPublicKey.prototype.verify = function(data, signature) {
        data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
        signature = ns.format.Base64.encode(signature);
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
            var res = ns.format.Base64.decode(base64);
            if (res.length === this.getSize()) {
                return res
            }
            var hex = cipher.getKey().encrypt(plaintext);
            if (hex) {
                res = ns.format.Hex.decode(hex);
                if (res.length === this.getSize()) {
                    return res
                }
                throw new Error("Error encrypt result: " + plaintext)
            }
        }
        throw new Error("RSA encrypt error: " + plaintext)
    };
    ns.crypto.RSAPublicKey = RSAPublicKey;
    ns.crypto.registers("RSAPublicKey")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var DecryptKey = ns.crypto.DecryptKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(RSAPrivateKey, Dictionary, [PrivateKey, DecryptKey]);
    RSAPrivateKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    RSAPrivateKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data) {
            return ns.format.PEM.decodePrivateKey(data)
        } else {
            var bits = this.getSize() * 8;
            var pem = generate.call(this, bits);
            return ns.format.PEM.decodePrivateKey(pem)
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
        var key = ns.format.Base64.encode(this.getData());
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        var pem = cipher.getPublicKey();
        var info = {
            "algorithm": this.getValue("algorithm"),
            "data": pem,
            "mode": "ECB",
            "padding": "PKCS1",
            "digest": "SHA256"
        };
        return PublicKey.parse(info)
    };
    var parse_key = function() {
        var der = this.getData();
        var key = ns.format.Base64.encode(der);
        var cipher = new JSEncrypt();
        cipher.setPrivateKey(key);
        return cipher
    };
    RSAPrivateKey.prototype.sign = function(data) {
        data = CryptoJS.enc.Hex.parse(ns.format.Hex.encode(data));
        var cipher = parse_key.call(this);
        var base64 = cipher.sign(data, CryptoJS.SHA256, "sha256");
        if (base64) {
            return ns.format.Base64.decode(base64)
        } else {
            throw new Error("RSA sign error: " + data)
        }
    };
    RSAPrivateKey.prototype.decrypt = function(data) {
        data = ns.format.Base64.encode(data);
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
    ns.crypto.RSAPrivateKey = RSAPrivateKey;
    ns.crypto.registers("RSAPrivateKey")
})(MONKEY);
(function(ns) {
    var Secp256k1 = window.Secp256k1;
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PublicKey = ns.crypto.PublicKey;
    var mem_cpy = function(dst, dst_offset, src, src_offset, src_len) {
        for (var i = 0; i < src_len; ++i) {
            dst[dst_offset + i] = src[src_offset + i]
        }
    };
    var trim_to_32_bytes = function(src, src_offset, src_len, dst) {
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
    var ecc_der_to_sig = function(der, der_len) {
        var seq_len;
        var r_len;
        var s_len;
        if (der_len < 8 || der[0] !== 48 || der[2] !== 2) {
            return null
        }
        seq_len = der[1];
        if ((seq_len <= 0) || (seq_len + 2 !== der_len)) {
            return null
        }
        r_len = der[3];
        if ((r_len < 1) || (r_len > seq_len - 5) || (der[4 + r_len] !== 2)) {
            return null
        }
        s_len = der[5 + r_len];
        if ((s_len < 1) || (s_len !== seq_len - 4 - r_len)) {
            return null
        }
        var sig_r = new Uint8Array(32);
        var sig_s = new Uint8Array(32);
        if (trim_to_32_bytes(der, 4, r_len, sig_r) && trim_to_32_bytes(der, 6 + r_len, s_len, sig_s)) {
            return {
                r: sig_r,
                s: sig_s
            }
        } else {
            return null
        }
    };
    var ECCPublicKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(ECCPublicKey, Dictionary, [PublicKey]);
    ECCPublicKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    ECCPublicKey.prototype.getData = function() {
        var pem = this.getValue("data");
        if (!pem || pem.length === 0) {
            throw new Error("ECC public key data not found")
        } else {
            if (pem.length === 66) {
                return ns.format.Hex.decode(pem)
            } else {
                if (pem.length === 130) {
                    return ns.format.Hex.decode(pem)
                } else {
                    var pos1 = pem.indexOf("-----BEGIN PUBLIC KEY-----");
                    if (pos1 >= 0) {
                        pos1 += "-----BEGIN PUBLIC KEY-----".length;
                        var pos2 = pem.indexOf("-----END PUBLIC KEY-----", pos1);
                        if (pos2 > 0) {
                            var base64 = pem.substr(pos1, pos2 - pos1);
                            var data = ns.format.Base64.decode(base64);
                            return data.subarray(data.length - 65)
                        }
                    }
                }
            }
        }
        throw new EvalError("key data error: " + pem)
    };
    ECCPublicKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return this.getData().length / 8
        }
    };
    var decode_points = function(data) {
        var x, y;
        if (data.length === 65) {
            if (data[0] === 4) {
                x = Secp256k1.uint256(data.subarray(1, 33), 16);
                y = Secp256k1.uint256(data.subarray(33, 65), 16)
            } else {
                throw new EvalError("key data head error: " + data)
            }
        } else {
            if (data.length === 33) {
                if (data[0] === 4) {
                    x = Secp256k1.uint256(data.subarray(1, 33), 16);
                    y = Secp256k1.decompressKey(x, 0)
                } else {
                    throw new EvalError("key data head error: " + data)
                }
            } else {
                throw new EvalError("key data length error: " + data)
            }
        }
        return {
            x: x,
            y: y
        }
    };
    ECCPublicKey.prototype.verify = function(data, signature) {
        var hash = ns.digest.SHA256.digest(data);
        var z = Secp256k1.uint256(hash, 16);
        var sig = ecc_der_to_sig(signature, signature.length);
        if (!sig) {
            throw new EvalError("signature error: " + signature)
        }
        var sig_r = Secp256k1.uint256(sig.r, 16);
        var sig_s = Secp256k1.uint256(sig.s, 16);
        var pub = decode_points(this.getData());
        return Secp256k1.ecverify(pub.x, pub.y, sig_r, sig_s, z)
    };
    ECCPublicKey.prototype.matches = function(sKey) {
        return AsymmetricKey.matches(sKey, this)
    };
    ns.crypto.ECCPublicKey = ECCPublicKey;
    ns.crypto.registers("ECCPublicKey")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ecc_sig_to_der = function(sig_r, sig_s, der) {
        var i;
        var p = 0,
            len, len1, len2;
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
            i++
        }
        if (sig_r[i] >= 128) {
            der[p] = 0;
            p++;
            der[len1] = der[len1] + 1
        }
        while (i < 32) {
            der[p] = sig_r[i];
            p++;
            der[len1] = der[len1] + 1;
            i++
        }
        der[p] = 2;
        p++;
        der[p] = 0;
        len2 = p;
        p++;
        i = 0;
        while (sig_s[i] === 0 && i < 32) {
            i++
        }
        if (sig_s[i] >= 128) {
            der[p] = 0;
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
    var ECCPrivateKey = function(key) {
        Dictionary.call(this, key);
        var keyPair = get_key_pair.call(this);
        this.__privateKey = keyPair.privateKey;
        this.__publicKey = keyPair.publicKey
    };
    ns.Class(ECCPrivateKey, Dictionary, [PrivateKey]);
    ECCPrivateKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    ECCPrivateKey.prototype.getData = function() {
        var data = this.getValue("data");
        if (data && data.length > 0) {
            return ns.format.Hex.decode(data)
        } else {
            throw new Error("ECC private key data not found")
        }
    };
    ECCPrivateKey.prototype.getSize = function() {
        var size = this.getValue("keySize");
        if (size) {
            return Number(size)
        } else {
            return this.getData().length / 8
        }
    };
    var get_key_pair = function() {
        var sKey;
        var data = this.getData();
        if (!data || data.length === 0) {
            sKey = generatePrivateKey.call(this, 256)
        } else {
            if (data.length === 32) {
                sKey = Secp256k1.uint256(data, 16)
            } else {
                throw new EvalError("key data length error: " + data)
            }
        }
        var pKey = Secp256k1.generatePublicKeyFromPrivateKeyData(sKey);
        return {
            privateKey: sKey,
            publicKey: pKey
        }
    };
    var generatePrivateKey = function(bits) {
        var key = window.crypto.getRandomValues(new Uint8Array(bits / 8));
        var hex = ns.format.Hex.encode(key);
        this.setValue("data", hex);
        this.setValue("curve", "secp256k1");
        this.setValue("digest", "SHA256");
        return key
    };
    ECCPrivateKey.prototype.getPublicKey = function() {
        var pub = this.__publicKey;
        var data = "04" + pub.x + pub.y;
        var info = {
            "algorithm": this.getValue("algorithm"),
            "data": data,
            "curve": "secp256k1",
            "digest": "SHA256"
        };
        return PublicKey.parse(info)
    };
    ECCPrivateKey.prototype.sign = function(data) {
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
    };
    ns.crypto.ECCPrivateKey = ECCPrivateKey;
    ns.crypto.registers("ECCPrivateKey")
})(MONKEY);
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
    AESKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
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
    ns.crypto.AESKey = AESKey;
    ns.crypto.registers("AESKey")
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var Data = ns.type.Data;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var Password = function() {
        obj.call(this)
    };
    ns.Class(Password, obj, null);
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
    ns.crypto.registers("Password")
})(MONKEY);
(function(ns) {
    var Dictionary = ns.type.Dictionary;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = function(key) {
        Dictionary.call(this, key)
    };
    ns.Class(PlainKey, Dictionary, [SymmetricKey]);
    PlainKey.prototype.getAlgorithm = function() {
        return CryptographyKey.getAlgorithm(this.getMap())
    };
    PlainKey.prototype.getData = function() {
        return null
    };
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
    ns.crypto.registers("PlainKey")
})(MONKEY);
(function(ns) {
    var str = ns.type.String;
    var Data = ns.type.Data;
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
        var digest = ns.digest.RIPEMD160.digest(ns.digest.SHA256.digest(fingerprint));
        var head = new Data(21);
        head.setByte(0, network);
        head.append(digest);
        var cc = check_code(head.getBytes(false));
        var data = new Data(25);
        data.append(head);
        data.append(cc);
        return new BTCAddress(ns.format.Base58.encode(data.getBytes(false)), network)
    };
    BTCAddress.parse = function(string) {
        var len = string.length;
        if (len < 26) {
            return null
        }
        var data = ns.format.Base58.decode(string);
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
        var sha256d = ns.digest.SHA256.digest(ns.digest.SHA256.digest(data));
        return sha256d.subarray(0, 4)
    };
    ns.mkm.BTCAddress = BTCAddress;
    ns.mkm.registers("BTCAddress")
})(MingKeMing);
(function(ns) {
    var str = ns.type.String;
    var NetworkType = ns.protocol.NetworkType;
    var Address = ns.protocol.Address;
    var eip55 = function(hex) {
        var sb = new Uint8Array(40);
        var hash = ns.digest.KECCAK256.digest(ns.format.UTF8.encode(hex));
        var ch;
        var _9 = "9".charCodeAt(0);
        for (var i = 0; i < 40; ++i) {
            ch = hex.charCodeAt(i);
            if (ch > _9) {
                ch -= (hash[i >> 1] << (i << 2 & 4) & 128) >> 2
            }
            sb[i] = ch
        }
        return ns.format.UTF8.decode(sb)
    };
    var is_eth = function(address) {
        if (address.length !== 42) {
            return false
        } else {
            if (address.charAt(0) !== "0" || address.charAt(1) !== "x") {
                return false
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
    var ETHAddress = function(string) {
        str.call(this, string)
    };
    ns.Class(ETHAddress, str, [Address]);
    ETHAddress.prototype.getNetwork = function() {
        return NetworkType.MAIN.valueOf()
    };
    ETHAddress.prototype.isBroadcast = function() {
        return false
    };
    ETHAddress.prototype.isUser = function() {
        return true
    };
    ETHAddress.prototype.isGroup = function() {
        return false
    };
    ETHAddress.getValidateAddress = function(address) {
        if (is_eth(address)) {
            var lower = address.substr(2).toLowerCase();
            return "0x" + eip55(lower)
        }
        return null
    };
    ETHAddress.isValidate = function(address) {
        return address === this.getValidateAddress(address)
    };
    ETHAddress.generate = function(fingerprint) {
        if (fingerprint.length === 65) {
            fingerprint = fingerprint.subarray(1)
        } else {
            if (fingerprint.length !== 64) {
                throw new TypeError("ECC key data error: " + fingerprint)
            }
        }
        var digest = ns.digest.KECCAK256.digest(fingerprint);
        var tail = digest.subarray(digest.length - 20);
        var address = ns.format.Hex.encode(tail);
        return new ETHAddress("0x" + eip55(address))
    };
    ETHAddress.parse = function(address) {
        if (is_eth(address)) {
            return new ETHAddress(address)
        }
        return null
    };
    ns.mkm.ETHAddress = ETHAddress;
    ns.mkm.registers("ETHAddress")
})(MingKeMing);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var DefaultMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 4) {
                BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
            } else {
                throw new SyntaxError("Default meta arguments error: " + arguments)
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
    ns.mkm.DefaultMeta = DefaultMeta;
    ns.mkm.registers("DefaultMeta")
})(MingKeMing);
(function(ns) {
    var NetworkType = ns.protocol.NetworkType;
    var BTCAddress = ns.mkm.BTCAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var BTCMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1])
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
                } else {
                    throw new SyntaxError("BTC meta arguments error: " + arguments)
                }
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
    ns.mkm.BTCMeta = BTCMeta;
    ns.mkm.registers("BTCMeta")
})(MingKeMing);
(function(ns) {
    var ETHAddress = ns.mkm.ETHAddress;
    var BaseMeta = ns.mkm.BaseMeta;
    var ETHMeta = function() {
        if (arguments.length === 1) {
            BaseMeta.call(this, arguments[0])
        } else {
            if (arguments.length === 2) {
                BaseMeta.call(this, arguments[0], arguments[1])
            } else {
                if (arguments.length === 4) {
                    BaseMeta.call(this, arguments[0], arguments[1], arguments[2], arguments[3])
                } else {
                    throw new SyntaxError("ETH meta arguments error: " + arguments)
                }
            }
        }
        this.__address = null
    };
    ns.Class(ETHMeta, BaseMeta, null);
    ETHMeta.prototype.generateAddress = function(network) {
        if (!this.__address && this.isValid()) {
            var fingerprint = this.getKey().getData();
            this.__address = ETHAddress.generate(fingerprint)
        }
        return this.__address
    };
    ns.mkm.ETHMeta = ETHMeta;
    ns.mkm.registers("ETHMeta")
})(MingKeMing);
(function(ns) {
    var Address = ns.protocol.Address;
    var AddressFactory = ns.mkm.AddressFactory;
    var BTCAddress = ns.mkm.BTCAddress;
    var ETHAddress = ns.mkm.ETHAddress;
    var GeneralAddressFactory = function() {
        AddressFactory.call(this)
    };
    ns.Class(GeneralAddressFactory, AddressFactory, null);
    GeneralAddressFactory.prototype.createAddress = function(address) {
        if (address.length === 42) {
            return ETHAddress.parse(address)
        }
        return BTCAddress.parse(address)
    };
    Address.setFactory(new GeneralAddressFactory())
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var MetaType = ns.protocol.MetaType;
    var Meta = ns.protocol.Meta;
    var DefaultMeta = ns.mkm.DefaultMeta;
    var BTCMeta = ns.mkm.BTCMeta;
    var ETHMeta = ns.mkm.ETHMeta;
    var GeneralMetaFactory = function(type) {
        obj.call(this);
        this.__type = type
    };
    ns.Class(GeneralMetaFactory, obj, [Meta.Factory]);
    GeneralMetaFactory.prototype.createMeta = function(key, seed, fingerprint) {
        if (MetaType.MKM.equals(this.__type)) {
            return new DefaultMeta(this.__type, key, seed, fingerprint)
        } else {
            if (MetaType.BTC.equals(this.__type)) {
                return new BTCMeta(this.__type, key)
            } else {
                if (MetaType.ExBTC.equals(this.__type)) {
                    return new BTCMeta(this.__type, key, seed, fingerprint)
                } else {
                    if (MetaType.ETH.equals(this.__type)) {
                        return new ETHMeta(this.__type, key)
                    } else {
                        if (MetaType.ExETH.equals(this.__type)) {
                            return new ETHMeta(this.__type, key, seed, fingerprint)
                        } else {
                            return null
                        }
                    }
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
                    if (MetaType.ETH.equals(type)) {
                        return new ETHMeta(meta)
                    } else {
                        if (MetaType.ExETH.equals(type)) {
                            return new ETHMeta(meta)
                        } else {
                            return null
                        }
                    }
                }
            }
        }
    };
    Meta.register(MetaType.MKM, new GeneralMetaFactory(MetaType.MKM));
    Meta.register(MetaType.BTC, new GeneralMetaFactory(MetaType.BTC));
    Meta.register(MetaType.ExBTC, new GeneralMetaFactory(MetaType.ExBTC));
    Meta.register(MetaType.ETH, new GeneralMetaFactory(MetaType.ETH));
    Meta.register(MetaType.ExETH, new GeneralMetaFactory(MetaType.ExETH))
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var Document = ns.protocol.Document;
    var BaseDocument = ns.mkm.BaseDocument;
    var BaseBulletin = ns.mkm.BaseBulletin;
    var BaseVisa = ns.mkm.BaseVisa;
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
        obj.call(this);
        this.__type = type
    };
    ns.Class(GeneralDocumentFactory, obj, [Document.Factory]);
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
})(MingKeMing);
(function(ns) {
    var obj = ns.type.Object;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var AESKey = ns.crypto.AESKey;
    var AESKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(AESKeyFactory, obj, [SymmetricKey.Factory]);
    AESKeyFactory.prototype.generateSymmetricKey = function() {
        return new AESKey({
            "algorithm": SymmetricKey.AES
        })
    };
    AESKeyFactory.prototype.parseSymmetricKey = function(key) {
        return new AESKey(key)
    };
    var aes = new AESKeyFactory();
    SymmetricKey.register(SymmetricKey.AES, aes);
    SymmetricKey.register("AES/CBC/PKCS7Padding", aes)
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var CryptographyKey = ns.crypto.CryptographyKey;
    var SymmetricKey = ns.crypto.SymmetricKey;
    var PlainKey = ns.crypto.PlainKey;
    var PlainKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(PlainKeyFactory, obj, [SymmetricKey.Factory]);
    PlainKeyFactory.prototype.generateSymmetricKey = function() {
        return PlainKey.getInstance()
    };
    PlainKeyFactory.prototype.parseSymmetricKey = function(key) {
        if (CryptographyKey.getAlgorithm(key) !== PlainKey.PLAIN) {
            throw new TypeError("plain key error: " + key)
        }
        return PlainKey.getInstance()
    };
    SymmetricKey.register(PlainKey.PLAIN, new PlainKeyFactory())
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var RSAPrivateKey = ns.crypto.RSAPrivateKey;
    var RSAPublicKey = ns.crypto.RSAPublicKey;
    var RSAPrivateKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(RSAPrivateKeyFactory, obj, [PrivateKey.Factory]);
    RSAPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new RSAPrivateKey({
            "algorithm": AsymmetricKey.RSA
        })
    };
    RSAPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new RSAPrivateKey(key)
    };
    var RSAPublicKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(RSAPublicKeyFactory, obj, [PublicKey.Factory]);
    RSAPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new RSAPublicKey(key)
    };
    var rsa_pri = new RSAPrivateKeyFactory();
    PrivateKey.register(AsymmetricKey.RSA, rsa_pri);
    PrivateKey.register("SHA256withRSA", rsa_pri);
    PrivateKey.register("RSA/ECB/PKCS1Padding", rsa_pri);
    var rsa_pub = new RSAPublicKeyFactory();
    PublicKey.register(AsymmetricKey.RSA, rsa_pub);
    PublicKey.register("SHA256withRSA", rsa_pub);
    PublicKey.register("RSA/ECB/PKCS1Padding", rsa_pub)
})(MONKEY);
(function(ns) {
    var obj = ns.type.Object;
    var AsymmetricKey = ns.crypto.AsymmetricKey;
    var PrivateKey = ns.crypto.PrivateKey;
    var PublicKey = ns.crypto.PublicKey;
    var ECCPrivateKey = ns.crypto.ECCPrivateKey;
    var ECCPublicKey = ns.crypto.ECCPublicKey;
    var ECCPrivateKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(ECCPrivateKeyFactory, obj, [PrivateKey.Factory]);
    ECCPrivateKeyFactory.prototype.generatePrivateKey = function() {
        return new ECCPrivateKey({
            "algorithm": AsymmetricKey.ECC
        })
    };
    ECCPrivateKeyFactory.prototype.parsePrivateKey = function(key) {
        return new ECCPrivateKey(key)
    };
    var ECCPublicKeyFactory = function() {
        obj.call(this)
    };
    ns.Class(ECCPublicKeyFactory, obj, [PublicKey.Factory]);
    ECCPublicKeyFactory.prototype.parsePublicKey = function(key) {
        return new ECCPublicKey(key)
    };
    var ecc_pri = new ECCPrivateKeyFactory();
    PrivateKey.register(AsymmetricKey.ECC, ecc_pri);
    PrivateKey.register("SHA256withECC", ecc_pri);
    var ecc_pub = new ECCPublicKeyFactory();
    PublicKey.register(AsymmetricKey.ECC, ecc_pub);
    PublicKey.register("SHA256withECC", ecc_pub)
})(MONKEY);
