import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt via node:crypto — memory-hard, no native dependency.
const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password.normalize("NFKC"), salt, KEYLEN, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, { N, r, p });
  return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, n, rr, pp, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await scrypt(password, Buffer.from(salt, "base64url"), { N: Number(n), r: Number(rr), p: Number(pp) });
  return key.length === expected.length && timingSafeEqual(key, expected);
}
