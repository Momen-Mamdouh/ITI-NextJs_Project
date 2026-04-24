import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const isDev = process.env.NODE_ENV === "development";

export function getDevSession(token?: string) {
  if (!isDev) return null;

  if (token === "fake-admin-token") {
    return { id: "dev-admin", role: "admin" as const };
  }

  if (token === "fake-seller-token") {
    return { id: "dev-seller", role: "seller" as const };
  }

  if (token === "fake-customer-token") {
    return { id: "dev-user", role: "customer" as const };
  }

  return null;
}

export async function createTokens(payload: { id: string; role: string }) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const access = await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);
  const refresh = await new SignJWT({ id: payload.id } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return { access, refresh };
}

export async function verifyToken(token: string) {
  const devSession = getDevSession(token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (devSession) return devSession as any;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      id: string;
      role: "customer" | "seller" | "admin";
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
}
