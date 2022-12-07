import { decode, JwtPayload, verify } from "jsonwebtoken";
import { config } from "dotenv";
import process from "process";
import jwksClient from "jwks-rsa";

config();

type MsJwtPayload = JwtPayload & {
  // name: string,
  // preferred_username: string,
  // tid: string
  oid: string;
};

const validationOptions = {
  audience: process.env.AZURE_CLIENT_ID ?? "",
  issuer: process.env.AZURE_TENANT_AUTHORITY ?? "",
};

export async function getUserId(token: string): Promise<string> {
  if (!(await AuthenticationIsValid(token))) {
    return "";
  }

  const decoded = decode(token, { complete: true });
  if (!decoded?.payload) {
    return "";
  }

  const payload = decoded.payload as MsJwtPayload;
  return payload.oid;
}

export async function AuthenticationIsValid(token: string): Promise<boolean> {
  const decoded = decode(token, { complete: true });
  const kid = decoded?.header.kid;

  if (kid) {
    const key = await getSigningKeys(kid);

    try {
      verify(token, key, validationOptions);
    } catch {
      return false;
    }

    return true;
  }

  return false;
}

async function getSigningKeys(kid: string) {
  const uri = process.env.AZURE_DISCOVERY_KEYS_ENDPOINT ?? "";
  const client = jwksClient({
    jwksUri: uri,
  });

  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}
