import * as crypto from "crypto";
import * as fs from "fs";
import * as process from "process";

const keyfile = process.env.ENCRYPTION_KEY_PATH;
if (keyfile === undefined) {
  console.log("Can not perform encryption or decryption without a key file.");
  process.exit(1);
}
const secret = fs.readFileSync(keyfile, "binary");
const key = crypto.createHash("sha256").update(String(secret)).digest();

const algorithm = "aes-256-gcm";
const ivSize = 16;
const encoding = "binary";

export function encrypt(data: string) {
  const iv = crypto.randomBytes(ivSize);
  const ivString = iv.toString();
  const cipher = crypto.createCipheriv(algorithm, key, ivString);

  let encrypted = cipher.update(data, encoding, encoding);
  encrypted += cipher.final(encoding);
  encrypted = ivString + encrypted;

  return encrypted;
}

export function decrypt(data: string) {
  const iv = data.slice(0, ivSize);
  const dataBuffer = data.slice(ivSize);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decrypted = decipher.update(dataBuffer, encoding, encoding);
  try {
    decrypted += decipher.final();
  } catch {
    console.log("dunno");
  }


  return decrypted;
}
