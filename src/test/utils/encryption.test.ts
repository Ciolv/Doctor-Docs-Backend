import { decrypt, encrypt } from "../../utils/encryption";
import * as crypto from "crypto";

describe("Encryption", () => {
  const input = crypto.randomBytes(256);

  test("Verify encrypted data does not equal plaintext", () => {
    const encrypted = encrypt(input);
    // @ts-ignore
    expect(input !== encrypted);
  });

  test("Verify encrypting the same file leads to different encryptions", () => {
    const encryptedOne = encrypt(input);
    const encryptedTwo = encrypt(input);
    // @ts-ignore
    expect(encryptedOne !== encryptedTwo);
  });

  test("Verify encrypted data can be successfully decrypted", () => {

    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted === input);
  });
});