import * as crypto from "crypto";
import * as fs from "fs";
import * as process from "process";
import { config } from "dotenv";

config();

export type EncryptionResult = {
  iv: string;
  authTag: string;
  data: string;
};

let keyfile = process.env.ENCRYPTION_KEY_PATH;
let secret;

if (process.env.CI === "true") {
  console.log("No encryption for CI/CD pipeline");
  secret = "";
} else {
  if (keyfile === undefined) {
    console.log("Can not perform encryption or decryption without a key file.");
    process.exit(1);
  }
  secret = fs.readFileSync(keyfile, "binary");
}

let key = crypto.createHash("sha256").update(String(secret)).digest();

const algorithm = "aes-256-gcm";
const ivSize = 16;
const encryptionEncoding = "hex";

function createIv() {
  return crypto.randomBytes(ivSize);
}

export function encrypt(data: Buffer): EncryptionResult {
  if (data === undefined || data === null) {
    return {
      authTag: "",
      data: "",
      iv: "",
    };
  }
  const iv = createIv();
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const ivString = iv.toString(encryptionEncoding);
  const authTagString = cipher.getAuthTag().toString(encryptionEncoding);
  const dataString = encrypted.toString(encryptionEncoding);

  return {
    iv: ivString,
    authTag: authTagString,
    data: dataString,
  };
}

export function decrypt(data: EncryptionResult) {
  if (data.iv === "" || data.authTag === "" || data.data === "") {
    return null;
  }

  const iv = Buffer.from(data.iv, encryptionEncoding);
  const encData = Buffer.from(data.data, encryptionEncoding);
  const authTag = Buffer.from(data.authTag, encryptionEncoding);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted;
}
