// Proof of work for a Bitcoin order (the licence API's challenge): find a nonce such that SHA-256("<challenge>:<nonce>")
// starts with `difficulty` zero bits. A plain synchronous SHA-256, much faster here than crypto.subtle per hash.
(function (global) {
  "use strict";
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  var w = new Uint32Array(64);

  /** The eight 32-bit words of SHA-256(bytes). */
  function sha256(bytes) {
    var length = bytes.length;
    var padded = ((length + 9 + 63) >> 6) << 6;
    var m = new Uint8Array(padded);
    m.set(bytes);
    m[length] = 0x80;
    var view = new DataView(m.buffer);
    view.setUint32(padded - 4, (length * 8) >>> 0);
    view.setUint32(padded - 8, Math.floor((length * 8) / 0x100000000));
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    for (var offset = 0; offset < padded; offset += 64) {
      var i;
      for (i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
      for (i = 16; i < 64; i++) {
        var x = w[i - 15], y = w[i - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (i = 0; i < 64; i++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (k + S1 + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        k = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + k) | 0;
    }
    return h.map(function (v) { return v >>> 0; });
  }

  function leadingZeroBits(words) {
    return words[0] !== 0 ? Math.clz32(words[0]) : 32 + Math.clz32(words[1]);
  }

  function utf8(text) {
    return new TextEncoder().encode(text);
  }

  /** Resolves with the nonce as a string; works in slices so the page stays responsive. */
  function solve(challenge, difficulty, onProgress) {
    return new Promise(function (resolve) {
      var nonce = 0;
      (function slice() {
        var end = nonce + 20000;
        for (; nonce < end; nonce++) {
          if (leadingZeroBits(sha256(utf8(challenge + ":" + nonce))) >= difficulty) return resolve(String(nonce));
        }
        if (onProgress) onProgress(nonce);
        setTimeout(slice, 0);
      })();
    });
  }

  global.QP1NGPow = { sha256: sha256, leadingZeroBits: leadingZeroBits, solve: solve };
})(typeof window !== "undefined" ? window : globalThis);
